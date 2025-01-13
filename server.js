// MongoDB Connection and Dependencies
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

// Helper function to map data to RESO-compliant fields
const mapToRESOFields = (listing) => {
  const {
    __v,
    _id,
    ListingDetails,
    BasicDetails,
    Agent,
    Office,
    Location,
    RentalDetails,
    Neighborhood,
    RichDetails,
    MediaAssets,
    ...rest
  } = listing;

  // Helper function to format phone numbers
  const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, ""); // Remove non-digit characters
    return `+1-${cleaned}`; // Assume US country code for now
  };

  // Helper function to parse media assets
  const mapMediaAssets = (media) => {
    if (!Array.isArray(media)) return [];
    return media.map((asset) => ({
      MediaURL: asset.url || "",
      MediaType: asset.type || "Image", // Default to "Image" if not specified
      MediaDescription: asset.description || "",
    }));
  };

  // Default LivingAreaUnits to square feet
  const livingAreaUnits = "Square Feet";

  return {
    ListingKey: (ListingDetails?.ProviderListingId || _id)?.toString(), // Ensure string format
    ListingID: ListingDetails?.MLSNumber || null, // Use null for missing values
    StandardFields: {
      Property: {
        Address: {
          StreetAddress: Location?.StreetAddress || "",
          UnitNumber: Location?.UnitNumber?.toString() || "", // Convert to string
          City: Location?.City || "",
          StateOrProvince: Location?.State || "",
          PostalCode: Location?.Zip?.toString().padStart(5, "0") || "", // Ensure 5-digit format
          Country: Location?.Country || "US", // Default to "US"
        },
        Geo: {
          Latitude: Location?.Lat || 0,
          Longitude: Location?.Long || 0,
          GeoAccuracy: "High", // Optional accuracy field
        },
      },
      LeaseDetails: {
        AvailabilityDate: RentalDetails?.Availability || "",
        LeaseTerm: RentalDetails?.LeaseTerm || "", // Ensure compliance with RESO values
        UtilitiesIncluded: {
          Water: RentalDetails?.UtilitiesIncluded?.Water || "No",
          Electricity: RentalDetails?.UtilitiesIncluded?.Electricity || "No",
          Gas: RentalDetails?.UtilitiesIncluded?.Gas || "No",
        },
        PetsAllowed: {
          SmallDogs: RentalDetails?.PetsAllowed?.SmallDogs || "No",
          LargeDogs: RentalDetails?.PetsAllowed?.LargeDogs || "No",
          Cats: RentalDetails?.PetsAllowed?.Cats || "No",
        },
      },
      BasicDetails: {
        Title: BasicDetails?.Title || "",
        Description: BasicDetails?.Description || "",
        Bedrooms: BasicDetails?.Bedrooms || 0,
        Bathrooms: BasicDetails?.Bathrooms || 0,
        LivingArea: BasicDetails?.LivingArea || 0,
        LivingAreaUnits: livingAreaUnits,
        PropertyType: "Residential Lease", // RESO standard field
        PropertySubType: "Apartment", // RESO standard field
      },
      Agent: {
        ListAgent: {
          FirstName: Agent?.FirstName || "",
          LastName: Agent?.LastName || "",
          FullName: `${Agent?.FirstName || ""} ${Agent?.LastName || ""}`.trim(),
          Email: Agent?.EmailAddress || "",
          Phone: formatPhoneNumber(Agent?.MobilePhoneLineNumber),
        },
      },
      Office: {
        Name: Office?.BrokerageName || "",
        Phone: formatPhoneNumber(Office?.BrokerPhone),
        Email: Office?.BrokerEmail || "",
        Website: Office?.BrokerWebsite || "",
        Address: {
          Street: Office?.StreetAddress || "",
          City: Office?.City || "",
          StateOrProvince: Office?.State || "",
          PostalCode: Office?.Zip?.toString().padStart(5, "0") || "", // Ensure 5-digit format
          Country: Office?.Country || "US",
        },
      },
      Features: RichDetails?.AdditionalFeatures
        ? RichDetails.AdditionalFeatures.split(",")
        : [], // Convert to array
      Neighborhood: Neighborhood?.Name || "",
      Media: mapMediaAssets(MediaAssets),
    },
  };
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

    // Transform listings to RESO format
    const transformedListings = listings.map(mapToRESOFields);

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
// const MONGODB_URI =
//   "mongodb+srv://Eatsumn:Eatsumn@cluster0.glsj1ah.mongodb.net/dave-moneheight";

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
//   const { page = 1, limit = 10 } = req.query;

//   try {
//     await connectDB();

//     const listings = await Listing.find()
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .lean();

//       const transformedListings = listings.map((listing) => {
//         const { __v, _id, ListingDetails, BasicDetails, Agent, Office, ...rest } =
//           listing;
      
//         // Destructure BasicDetails to exclude PropertyType
//         const { PropertyType, ...filteredBasicDetails } = BasicDetails || {};
      
//         // Transforming Agent and Office data
//         const memberPhone = Agent?.OfficeLineNumber || Office?.BrokerPhone || "";
//         const memberEmail = Agent?.EmailAddress || Office?.BrokerEmail || "";
      
//         return {
//           ListingKey: ListingDetails?.ProviderListingId || _id, // Changed to ListingKey
//           Location: listing.Location,
//           RentalDetails: listing.RentalDetails,
//           BasicDetails: {
//             ...filteredBasicDetails,
//             propertyType: "Residential Lease",
//             PropertySubType: "Residential Lease,Apartment",
//           },
//           Agent: {
//             memberFirstName: Agent?.FirstName || "",
//             memberLastName: Agent?.LastName || "",
//             memberEmail: Agent?.EmailAddress || "", // Aligning with their request
//             memberPhone: Agent?.OfficeLineNumber || "", // Aligning with their request
//             memberMobilePhone: Agent?.MobilePhoneLineNumber || "",
//           },
//           Office: {
//             BrokerageName: Office?.BrokerageName || "",
//             memberPhone: Office?.BrokerPhone || "", // Updated field
//             memberEmail: Office?.BrokerEmail || "", // Updated field
//             BrokerWebsite: Office?.BrokerWebsite || "", // Retained field
//             StreetAddress: Office?.StreetAddress || "",
//             City: Office?.City || "",
//             State: Office?.State || "",
//             Zip: Office?.Zip || "",
//         },
        
//           Neighborhood: listing.Neighborhood,
//           RichDetails: listing.RichDetails,
//         };
//       });
      

//     // Return transformed listings
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
