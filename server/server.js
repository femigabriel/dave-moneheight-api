const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5001;

// MongoDB URI
const MONGO_URI = 'mongodb+srv://Eatsumn:Eatsumn@cluster0.glsj1ah.mongodb.net/instaCare-DB';

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Define the schema and model
const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  number: { type: Number, required: true },
  description: { type: String, required: true },
  // '__v' is automatically handled by Mongoose, no need to define it
}, { collection: 'single lab tests' });  // Specify the collection name here

const Test = mongoose.model('SingleLabTest', testSchema);

// Middleware
app.use(cors());
app.use(express.json());

// Define endpoint to fetch data from the "single lab tests" collection
app.get('/api/tests', async (req, res) => {
  try {
    const tests = await Test.find();  // Fetch all tests from the collection
    res.json(tests);  // Return the data as JSON
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tests', error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
