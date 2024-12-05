const fs = require('fs');
const mammoth = require('mammoth');
const mongoose = require('mongoose');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Eatsumn:Eatsumn@cluster0.glsj1ah.mongodb.net/instaCare-DB";
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Define Schema and Model
const labTestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    number: { type: Number, required: true },
    description: { type: String, required: true },
});

const LabTest = mongoose.model('Single Lab Test', labTestSchema);

// Function to extract data and convert to JSON
const convertDocToJson = async (inputPath) => {
    try {
        // Read the Word document
        const { value: text } = await mammoth.extractRawText({ path: inputPath });

        // Split into sections
        const lines = text.split('\n').filter(line => line.trim() !== '');

        const data = [];
        let currentEntry = {};

        // Parse lines into JSON
        lines.forEach((line) => {
            if (/^\D+\t\d+$/.test(line)) {
                // Match title and number (e.g., "Title    12345")
                const [title, number] = line.split('\t');
                if (currentEntry.title) data.push(currentEntry);
                currentEntry = { title: title.trim(), number: parseInt(number.trim(), 10), description: '' };
            } else {
                // Append to description
                if (currentEntry.description) currentEntry.description += ' ';
                currentEntry.description += line.trim();
            }
        });

        // Push the last entry
        if (currentEntry.title) data.push(currentEntry);

        // Validate entries and remove invalid ones
        const validData = data.filter(entry => {
            if (!entry.title || isNaN(entry.number) || !entry.description) {
                console.warn(`Invalid entry skipped: ${JSON.stringify(entry)}`);
                return false;
            }
            return true;
        });

        // Save to database
        if (validData.length > 0) {
            await LabTest.insertMany(validData);
            console.log("Data successfully saved to MongoDB");
        } else {
            console.warn("No valid data to save.");
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close(); // Close MongoDB connection
    }
};

// Specify input path
const inputPath = 'Single Lab Test.docx';

convertDocToJson(inputPath);
