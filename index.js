const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://Eatsumn:Eatsumn@cluster0.glsj1ah.mongodb.net/instaCare-DB";

// MongoDB schema for Panel Lab Test
const labTestPanelSchema = new mongoose.Schema({
  title: String,
  number: Number,
  description: String,
  includes: [String],
});

const LabTestPanel = mongoose.model("PanelLabTest", labTestPanelSchema);

// Function to connect to the database
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
};

// Function to load JSON data from a file
const loadJSONData = (filePath) => {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
};

// Function to insert data into the MongoDB collection
const insertData = async (data) => {
  try {
    await LabTestPanel.insertMany(data);
    console.log("Data inserted successfully");
  } catch (err) {
    console.error("Error inserting data", err);
  }
};

// Main execution
const main = async () => {
  await connectDB(); // Connect to MongoDB

  const data = loadJSONData("labTestPanels.json"); // Load JSON data from file

  await insertData(data); // Insert data into the database
  mongoose.connection.close(); // Close the connection after insertion
};

main();
