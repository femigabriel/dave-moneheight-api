const express = require("express");
const mongoose = require("mongoose");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { parseStringPromise } = require("xml2js");
const { Schema, model, models } = mongoose;

// MongoDB URI
const MONGODB_URI = "mongodb+srv://Eatsumn:Eatsumn@cluster0.glsj1ah.mongodb.net/dave-moneheight";

// Create Express app
const app = express();
const port = process.env.PORT || 5000;

// Define schema and model
const ListingSchema = new Schema({}, { strict: false }); // Open schema for dynamic data
const Listing = models.Listing || model("Listing", ListingSchema);

// Middleware to parse JSON
app.use(express.json());

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

// Fetch listings from YouGotListings API
app.post("/api/external-listings", async (req, res) => {
  const { location, price_min, price_max, beds } = req.body;

  try {
    const apiUrl = "https://www.yougotlistings.com/api/rentals/search.php";
    const body = new URLSearchParams({
      key: "C0lOBfoG7SWzPbjsQuTLntFKpvrAmY1ewNXhRMig",
      ...(location && { location }),
      ...(price_min && { price_min }),
      ...(price_max && { price_max }),
      ...(beds && { beds }),
    }).toString();

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const responseText = await response.text();
    if (!response.ok) {
      console.error("Error fetching from YouGotListings:", response.status, response.statusText);
      return res.status(500).json({ error: "Failed to fetch data from YouGotListings" });
    }

    const parsedData = await parseStringPromise(responseText);

    const responseCode = parsedData.YGLResponse?.$?.responseCode;
    if (responseCode && parseInt(responseCode) >= 300) {
      const errorMessage = parsedData.YGLResponse?.Message?.[0] || "Unknown error";
      console.error("Error from YouGotListings API:", errorMessage);
      return res.status(500).json({ error: errorMessage });
    }

    const listings = parsedData.YGLResponse?.Listings?.[0]?.Listing?.map((listing) => ({
      id: listing.ID?.[0] || "",
      price: listing.Price?.[0] || "",
      location: `${listing.StreetNumber?.[0]} ${listing.StreetName?.[0]}, ${listing.City?.[0]}, ${listing.State?.[0]} ${listing.Zip?.[0]}`,
      beds: listing.Beds?.[0] || "",
      baths: listing.Baths?.[0] || "",
      photos: listing.Photos?.[0]?.Photo || [],
      status: listing.Status?.[0] || "Unknown",
      availableDate: listing.AvailableDate?.[0] || "N/A",
    }));

    res.json({ listings });
  } catch (error) {
    console.error("Error fetching data from YouGotListings API:", error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// Fetch listings from MongoDB
app.get("/api/listings", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    await connectDB();

    const listings = await Listing.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const transformedListings = listings.map((listing) => {
      const { __v, _id, ListingDetails, BasicDetails, Agent, Office, ...rest } = listing;

      const { PropertyType, ...filteredBasicDetails } = BasicDetails || {};

      return {
        ListingKey: ListingDetails?.ProviderListingId || _id,
        Location: listing.Location,
        RentalDetails: listing.RentalDetails,
        BasicDetails: {
          ...filteredBasicDetails,
          propertyType: "Residential Lease",
          PropertySubType: "Residential Lease,Apartment",
        },
        Agent: {
          associatedAgentType: "LIST_AGENT",
          memberFirstName: Agent?.FirstName || "",
          memberLastName: Agent?.LastName || "",
          memberFullName: `${Agent?.FirstName || ""} ${Agent?.LastName || ""}`.trim(),
          memberEmail: Agent?.EmailAddress || "",
          memberPhone: Agent?.OfficeLineNumber || Agent?.MobilePhoneLineNumber || "",
          memberMobilePhone: Agent?.MobilePhoneLineNumber || "",
          memberOfficePhone: Office?.BrokerPhone || "",
          memberPreferredPhone: Agent?.PreferredPhone || "",
        },
        Office: {
          BrokerageName: Office?.BrokerageName || "",
          memberPhone: Office?.BrokerPhone || "",
          memberEmail: Office?.BrokerEmail || "",
          BrokerWebsite: Office?.BrokerWebsite || "",
          memberAddress1: Office?.StreetAddress || "",
          memberCity: Office?.City || "",
          memberStateOrProvince: Office?.State || "",
          memberPostalCode: Office?.Zip || "",
          memberCountry: Office?.Country || "US",
        },
        Neighborhood: listing.Neighborhood,
        RichDetails: listing.RichDetails,
      };
    });

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

//     const transformedListings = listings.map((listing) => {
//       const { __v, _id, ListingDetails, BasicDetails, Agent, Office, ...rest } =
//         listing;

//       // Destructure BasicDetails to exclude PropertyType
//       const { PropertyType, ...filteredBasicDetails } = BasicDetails || {};

//       // Transforming Agent and Office data
//       return {
//         ListingKey: ListingDetails?.ProviderListingId || _id, // Changed to ListingKey
//         Location: listing.Location,
//         RentalDetails: listing.RentalDetails,
//         BasicDetails: {
//           ...filteredBasicDetails,
//           propertyType: "Residential Lease",
//           PropertySubType: "Residential Lease,Apartment",
//         },
//         Agent: {
//           associatedAgentType: "LIST_AGENT",
//           memberFirstName: Agent?.FirstName || "",
//           memberLastName: Agent?.LastName || "",
//           memberFullName: `${Agent?.FirstName || ""} ${Agent?.LastName || ""}`.trim(),
//           memberEmail: Agent?.EmailAddress || "",
//           memberPhone: Agent?.OfficeLineNumber || Agent?.MobilePhoneLineNumber || "",
//           memberMobilePhone: Agent?.MobilePhoneLineNumber || "",
//           memberOfficePhone: Office?.BrokerPhone || "",
//           memberPreferredPhone: Agent?.PreferredPhone || "",
//         },
//         Office: {
//           BrokerageName: Office?.BrokerageName || "",
//           memberPhone: Office?.BrokerPhone || "",
//           memberEmail: Office?.BrokerEmail || "",
//           BrokerWebsite: Office?.BrokerWebsite || "",
//           memberAddress1: Office?.StreetAddress || "",
//           memberCity: Office?.City || "",
//           memberStateOrProvince: Office?.State || "",
//           memberPostalCode: Office?.Zip || "",
//           memberCountry: Office?.Country || "US", // Default to US if undefined
//         },
//         Neighborhood: listing.Neighborhood,
//         RichDetails: listing.RichDetails,
//       };
//     });

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
