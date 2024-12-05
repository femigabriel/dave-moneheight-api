const mongoose = require("mongoose");

// Define the schema
const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  number: { type: String, default: "" },
  includes: { type: Boolean, default: false },
});

// Create the model
const Test = mongoose.model("lab-Tests", testSchema);

module.exports = Test;
