const mongoose = require('mongoose');
const fs = require('fs');
const mammoth = require('mammoth');

// MongoDB URI
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Eatsumn:Eatsumn@cluster0.glsj1ah.mongodb.net/instaCare-DB";

// MongoDB schema to store structured test data
const testSchema = new mongoose.Schema({
    testName: String,
    testCode: String,
    clinicalSignificance: String,
    includes: [String],
    reflexTests: [
        {
            testName: String,
            cost: String
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

const Test = mongoose.model('Test', testSchema);

// Function to parse the raw text and structure it
function parseDocText(docText) {
    const testData = [];

    // Define a regular expression pattern to match the sections
    const testPattern = /([a-zA-Z\s,]+)\s+(\d+)(.*?)(?=(\n[a-zA-Z\s,]+|$))/gs;
    let match;

    // Loop through the matches and structure the data
    while ((match = testPattern.exec(docText)) !== null) {
        const testName = match[1].trim();
        const testCode = match[2].trim();
        const testDetails = match[3].trim();

        // Extract the 'Clinical Significance' section
        const clinicalSignificanceMatch = /Clinical Significance\s*([\s\S]*?)(?=\n(?:Includes|Reflex Tests|$))/s.exec(testDetails);
        const clinicalSignificance = clinicalSignificanceMatch ? clinicalSignificanceMatch[1].trim() : '';

        // Extract the 'Includes' section
        const includesMatch = /Includes\s*([\s\S]*?)(?=\n(?:Reflex Tests|$))/s.exec(testDetails);
        const includes = includesMatch ? includesMatch[1].split('\n').map(line => line.trim()).filter(Boolean) : ["No includes specified"];

        // Extract the 'Reflex Tests' section
        const reflexTestsMatch = /Reflex Tests\s*([\s\S]*?)(?=\n|$)/s.exec(testDetails);
        const reflexTests = [];
        if (reflexTestsMatch) {
            const reflexTestsText = reflexTestsMatch[1].trim();
            const reflexTestPattern = /([A-Za-z\s,]+)\s*\$([\d.]+)/g;
            let reflexTestMatch;
            while ((reflexTestMatch = reflexTestPattern.exec(reflexTestsText)) !== null) {
                reflexTests.push({
                    testName: reflexTestMatch[1].trim(),
                    cost: reflexTestMatch[2].trim()
                });
            }
        }

        // Create a structured test object
        const testObject = {
            testName,
            testCode,
            clinicalSignificance,
            includes,
            reflexTests
        };

        testData.push(testObject);
    }

    return testData;
}

// Function to convert .docx to JSON, parse it, and save it to MongoDB
function convertDocToJsonAndSave(filePath) {
    mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('Connected to MongoDB');

            fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return;
                }

                // Use Mammoth to extract text from the .docx file
                mammoth.extractRawText({ buffer: data })
                    .then((result) => {
                        const docText = result.value;
                        const structuredData = parseDocText(docText);

                        // Save each parsed test data to MongoDB
                        Test.insertMany(structuredData)
                            .then(() => {
                                console.log('Documents saved to MongoDB');
                                mongoose.disconnect(); // Close DB connection after saving
                            })
                            .catch((err) => {
                                console.error('Error saving documents:', err);
                                mongoose.disconnect();
                            });
                    })
                    .catch((err) => {
                        console.error('Error processing document:', err);
                        mongoose.disconnect();
                    });
            });
        })
        .catch((err) => {
            console.error('Error connecting to MongoDB:', err);
        });
}

// Example usage
const docFilePath = 'Lab Test Descriptions.docx';
convertDocToJsonAndSave(docFilePath);
