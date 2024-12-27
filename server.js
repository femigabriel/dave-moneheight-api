const express = require("express");
const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

// MongoDB URI
const MONGODB_URI =
  "mongodb+srv://Eatsumn:Eatsumn@cluster0.glsj1ah.mongodb.net/dave-moneheight";

// Create Express app
const app = express();
const port = process.env.PORT || 5000;

// Define schema and model
const ListingSchema = new Schema({}, { strict: false }); // Open schema for dynamic data
const Listing = models.Listing || model("Listing", ListingSchema);

// Middleware to connect to MongoDB
const connectDB = async () => {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(MONGODB_URI);
      console.log("MongoDB connected");
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

// Fetch listings endpoint
app.get("/api/listings", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    await connectDB();

    const listings = await Listing.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

      const transformedListings = listings.map((listing) => {
        const { __v, _id, ListingDetails, BasicDetails, Agent, Office, ...rest } =
          listing;
      
        // Destructure BasicDetails to exclude PropertyType
        const { PropertyType, ...filteredBasicDetails } = BasicDetails || {};
      
        // Transforming Agent and Office data
        const memberPhone = Agent?.OfficeLineNumber || Office?.BrokerPhone || "";
        const memberEmail = Agent?.EmailAddress || Office?.BrokerEmail || "";
      
        return {
          ListingKey: ListingDetails?.ProviderListingId || _id, // Changed to ListingKey
          Location: listing.Location,
          RentalDetails: listing.RentalDetails,
          BasicDetails: {
            ...filteredBasicDetails,
            propertyType: "Residential Lease",
            PropertySubType: "Residential Lease,Apartment",
          },
          Agent: {
            memberFirstName: Agent?.FirstName || "",
            memberLastName: Agent?.LastName || "",
            memberEmail: Agent?.EmailAddress || "", // Aligning with their request
            memberPhone: Agent?.OfficeLineNumber || "", // Aligning with their request
            memberMobilePhone: Agent?.MobilePhoneLineNumber || "",
          },
          Office: {
            BrokerageName: Office?.BrokerageName || "",
            memberPhone, // Updated from BrokerPhone
            memberEmail, // Updated from BrokerEmail
            StreetAddress: Office?.StreetAddress || "",
            City: Office?.City || "",
            State: Office?.State || "",
            Zip: Office?.Zip || "",
          },
          Neighborhood: listing.Neighborhood,
          RichDetails: listing.RichDetails,
        };
      });
      

    // Return transformed listings
    res.json(transformedListings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// const express = require("express");
// const mongoose = require("mongoose");
// const { Schema, model, models } = mongoose;

// // MongoDB URI
// const MONGODB_URI = "mongodb+srv://Eatsumn:Eatsumn@cluster0.glsj1ah.mongodb.net/dave-moneheight";

// // Create Express app
// const app = express();
// const port = process.env.PORT || 5000;

// // Define schema and model
// const ListingSchema = new Schema({}, { strict: false }); // Open schema for dynamic data
// const Listing = models.Listing || model("Listing", ListingSchema);

// // Middleware to connect to MongoDB
// const connectDB = async () => {
//   try {
//     if (!mongoose.connection.readyState) {
//       await mongoose.connect(MONGODB_URI);
//       console.log("MongoDB connected");
//     }
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//   }
// };

// // Fetch listings endpoint
// app.get("/api/listings", async (req, res) => {
//   try {
//     // Ensure MongoDB connection
//     await connectDB();

//     // Fetch listings
//     const listings = await Listing.find();

//     // Transform _id to listingId
//     const transformedListings = listings.map((listing) => {
//       const obj = listing.toObject(); // Convert Mongoose document to plain JS object
//       obj.listingId = obj._id; // Add listingId with the value of _id
//       delete obj._id; // Remove _id
//       return obj;
//     });

//     res.json(transformedListings);
//   } catch (error) {
//     console.error("Error fetching listings:", error);
//     res.status(500).json({ error: "Failed to fetch listings" });
//   }
// });

// // Start the Express server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
