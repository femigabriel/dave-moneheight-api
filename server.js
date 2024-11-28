const express = require("express");
const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

// MongoDB URI
const MONGODB_URI = "mongodb+srv://Eatsumn:Eatsumn@cluster0.glsj1ah.mongodb.net/dave-moneheight";

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

      const transformListing = (listing) => ({
        listingId: listing.ListingDetails?.ProviderListingId || listing._id,
        Location: {
            StreetAddress: listing.Location.StreetAddress,
            UnitNumber: listing.Location.UnitNumber || "",
            City: listing.Location.City,
            State: listing.Location.State,
            Zip: listing.Location.Zip,
            Lat: listing.Location.Lat,
            Long: listing.Location.Long,
            DisplayAddress: listing.Location.DisplayAddress === "Yes"
        },
        RentalDetails: {
            Availability: listing.RentalDetails.Availability,
            LeaseTerm: listing.RentalDetails.LeaseTerm,
            UtilitiesIncluded: Object.keys(listing.RentalDetails.UtilitiesIncluded)
                .filter((key) => listing.RentalDetails.UtilitiesIncluded[key] === "Yes"),
            PetsAllowed: Object.keys(listing.RentalDetails.PetsAllowed)
                .filter((key) => listing.RentalDetails.PetsAllowed[key] === "Yes")
        },
        BasicDetails: {
            PropertyType: listing.BasicDetails.PropertyType || "Apartment",
            Title: listing.BasicDetails.Title,
            Description: listing.BasicDetails.Description,
            Bedrooms: listing.BasicDetails.Bedrooms || 0,
            Bathrooms: listing.BasicDetails.Bathrooms || 0,
            LivingArea: listing.BasicDetails.LivingArea || null
        },
        Agent: {
            Name: `${listing.Agent.FirstName} ${listing.Agent.LastName}`,
            Email: listing.Agent.EmailAddress,
            PictureUrl: listing.Agent.PictureUrl,
            MobilePhone: listing.Agent.MobilePhoneLineNumber.toString(),
            OfficePhone: listing.Agent.OfficeLineNumber
        },
        Office: {
            Name: listing.Office.BrokerageName,
            Phone: listing.Office.BrokerPhone,
            Website: listing.Office.BrokerWebsite,
            Email: listing.Office.BrokerEmail,
            Address: `${listing.Office.StreetAddress}, ${listing.Office.City}, ${listing.Office.State}, ${listing.Office.Zip}`
        },
        Neighborhood: listing.Neighborhood?.Name || null,
        RichDetails: {
            Features: listing.RichDetails.AdditionalFeatures.split(","),
            CondoFloorNum: listing.RichDetails.CondoFloorNum,
            ParkingType: listing.RichDetails.ParkingTypes?.ParkingType || null,
            OnsiteLaundry: listing.RichDetails.OnsiteLaundry === "Yes"
        }
    });
    

    res.json({
      page,
      limit,
      total: await Listing.countDocuments(),
      data: transformedListings,
    });
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
