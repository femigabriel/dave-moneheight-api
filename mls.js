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
const formatPhoneNumber = (phone) => {
  return phone ? `+1-${String(phone).replace(/[^0-9]/g, "")}` : "";
};
// Helper function to map data to MLS-compliant fields
const mapToMLSFields = (listing) => {
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
    Media,
    ...rest
  } = listing;

  const formatPostalCode = (postalCode) =>
    postalCode ? postalCode.toString().padStart(5, "0") : "";

  return {
    ListingKey: (ListingDetails?.ProviderListingId || _id)?.toString(),
    ListingID: ListingDetails?.MLSNumber || null,
    Property: {
      Address: {
        StreetAddress: Location?.StreetAddress || "",
        UnitNumber: Location?.UnitNumber?.toString() || "",
        City: Location?.City || "",
        StateOrProvince: Location?.State || "",
        PostalCode: formatPostalCode(Location?.Zip),
        Country: Location?.Country || "US",
      },
      Geo: {
        Latitude: Location?.Lat || 0,
        Longitude: Location?.Long || 0,
        GeoAccuracy: "High",
      },
    },
    LeaseDetails: {
      AvailabilityDate: RentalDetails?.Availability || "",
      LeaseTerm: RentalDetails?.LeaseTerm || "",
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
      LivingAreaUnits: "SquareFeet",
      PropertyType: "Residential Lease",
      PropertySubType: "Apartment",
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
        PostalCode: formatPostalCode(Office?.Zip),
        Country: Office?.Country || "US",
      },
    },
    Features: RichDetails?.AdditionalFeatures
      ? RichDetails.AdditionalFeatures.split(",")
      : [],
    Neighborhood: Neighborhood?.Name || "",
    Media: Media?.map((media, index) => ({
      MediaURL: media?.MediaURL || "",
      MediaType: media?.MediaType || "Unknown",
      Order: index + 1,
    })) || [],
    ListPrice: ListingDetails?.Price || 0, // Fix applied here
  };
};

// Fetch listings endpoint updated for MLS
app.get("/api/mls-listings", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    await connectDB();

    const listings = await Listing.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Transform listings to MLS format
    const transformedListings = listings.map(mapToMLSFields);

    // Return transformed listings
    res.json(transformedListings);
  } catch (error) {
    console.error("Error fetching MLS listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

// Fetch listings endpoint
app.get("/api/mls-listings", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    await connectDB();

    const listings = await Listing.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Transform listings to RESO format
    // const transformedListings = listings.map(mapToRESOFields);
    const transformedListings = listings.map(mapToMLSFields);

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