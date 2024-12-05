const express = require("express");
const mongoose = require("mongoose");
const Test = require("./models/Test");  // Assuming your Test model is in a separate file
const app = express();

// MongoDB URI and connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Eatsumn:Eatsumn@cluster0.glsj1ah.mongodb.net/instaCare-DB";

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Error connecting to MongoDB:", err));

// Endpoint to fetch lab test data
app.get("/api/lab-tests", async (req, res) => {
  try {
    // Fetch all lab test documents from MongoDB
    const tests = await Test.find();

    // Log the data to the console
    console.log("Lab Tests:", JSON.stringify(tests, null, 2));

    // Send the data as the response
    res.json(tests);
  } catch (err) {
    console.error("Error fetching lab tests:", err);
    res.status(500).send("Server Error");
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
