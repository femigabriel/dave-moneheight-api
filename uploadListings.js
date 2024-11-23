const fs = require("fs");
const mongoose = require("mongoose");
const { XMLParser } = require("fast-xml-parser");

// MongoDB connection
const MONGODB_URI = "mongodb+srv://Eatsumn:Eatsumn@cluster0.glsj1ah.mongodb.net/dave-moneheight";

// Create a flexible schema
const ListingSchema = new mongoose.Schema({}, { strict: false }); // No restrictions on fields
const Listing = mongoose.model("Listing", ListingSchema);

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Read the XML file
    const filePath = "C:/Users/Femi/Desktop/xml-file converter/listings.xml"; // Replace with your XML file's path
    const xmlData = fs.readFileSync(filePath, "utf-8");

    // Parse XML to JSON
    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonData = parser.parse(xmlData);

    // Insert the full JSON data into MongoDB
    const listings = jsonData.Listings.Listing;
    if (!listings || !listings.length) {
      throw new Error("No listings found in the file!");
    }

    await Listing.insertMany(listings);
    console.log("Listings uploaded successfully!");
  } catch (error) {
    console.error("Error uploading listings:", error);
  } finally {
    mongoose.disconnect();
  }
}

main();
