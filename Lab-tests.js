// Import necessary modules
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Eatsumn:Eatsumn@cluster0.glsj1ah.mongodb.net/instaCare-DB";

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware to parse JSON
app.use(express.json());

// Define a Mongoose schema and model for Individual Lab Tests
const labTestSchema = new mongoose.Schema({}, { strict: false });
const IndividualLabTest = mongoose.model("individual_lab_tests", labTestSchema);

// Endpoint to receive and save JSON data
app.post("/api/lab-tests", async (req, res) => {
  try {
    const labTestsData = req.body; // Assuming JSON data is sent in the request body

    if (!Array.isArray(labTestsData)) {
      return res.status(400).json({ error: "Invalid data format. Expected an array of objects." });
    }

    // Insert data into the collection
    const result = await IndividualLabTest.insertMany(labTestsData);

    res.status(201).json({ message: "Data successfully saved to the database.", result });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ error: "Failed to save data to the database." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
