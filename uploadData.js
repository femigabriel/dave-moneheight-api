// Import required modules
const { MongoClient } = require('mongodb');
const fs = require('fs');

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Eatsumn:Eatsumn@cluster0.glsj1ah.mongodb.net/instaCare-DB";

// Database and collection names
const DB_NAME = "instaCare-DB";
const COLLECTION_NAME = "lab_tests";

// Function to load JSON file and insert data into the database
async function insertLabTests() {
    let client;

    try {
        // Read the JSON file
        const data = JSON.parse(fs.readFileSync('individual_lab_tests.json', 'utf8'));

        // Add a "name" property to each lab test (customize this as needed)
        data.forEach((test, index) => {
            test.name = `Lab Test ${index + 1}`; // Example naming convention
        });

        // Connect to MongoDB
        client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log("Connected to MongoDB");

        // Insert data into the collection
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const result = await collection.insertMany(data);
        console.log(`${result.insertedCount} documents inserted successfully!`);

    } catch (error) {
        console.error("Error inserting lab tests:", error);
    } finally {
        // Close the connection
        if (client) {
            await client.close();
        }
    }
}

// Run the function
insertLabTests();