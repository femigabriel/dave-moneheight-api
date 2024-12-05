const mongoose = require("mongoose");
const WordExtractor = require("word-extractor");
const fs = require("fs");

// MongoDB Connection URI
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Eatsumn:Eatsumn@cluster0.glsj1ah.mongodb.net/instaCare-DB";

// Mongoose Schema
const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  number: { type: String, default: "" },
  includes: { type: Boolean, default: false },
});

const Test = mongoose.model("lab-Tests", testSchema);

// Function to parse Word document and extract data
const parseWordDocument = async (filePath) => {
  const extractor = new WordExtractor();
  const extracted = await extractor.extract(filePath);
  const rawText = extracted.getBody();
  
  // Split text into sections based on patterns
  const sections = rawText.split(/\n\s*\n/); // Separate by blank lines
  const data = [];

  sections.forEach((section) => {
    const lines = section.trim().split("\n");
    const titleMatch = lines[0]?.match(/^(.+?)\s+-?\s+\d+$/);
    const numberMatch = lines[0]?.match(/\d+$/);
    const includes = /includes/i.test(section);

    if (titleMatch && numberMatch) {
      data.push({
        title: titleMatch[1].trim(),
        description: lines.slice(1).join(" ").trim(), // Combine remaining lines as description
        number: numberMatch[0],
        includes: includes,
      });
    }
  });

  return data;
};

// Function to insert data into MongoDB
const insertDataToDB = async (data) => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");

    await Test.insertMany(data);
    console.log("Data successfully inserted!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.connection.close();
  }
};

// Main Function
const main = async () => {
  const filePath = "./Lab Test Descriptions.docx"; 

  try {
    const data = await parseWordDocument(filePath);
    console.log("Parsed Data:", JSON.stringify(data, null, 2)); // Preview structured data
    await insertDataToDB(data);
  } catch (err) {
    console.error("Error:", err);
  }
};

// Run the script
main();
