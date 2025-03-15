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
// const formatPhoneNumber = (phone) => {
//   return phone ? `+1-${String(phone).replace(/[^0-9]/g, "")}` : "";
// };
;

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
    Media,
    ...rest
  } = listing;

  const formatPostalCode = (postalCode) =>
    postalCode ? postalCode.toString().padStart(5, "0") : "";

  return {
    ListingKey: (ListingDetails?.ProviderListingId || _id)?.toString(),
    ListingID: ListingDetails?.MLSNumber || null,
    PropertyType: "Residential Lease", // Move this to top level
    PropertySubType: "Apartment",     // Move this to top level
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
  };
};

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

// Helper function to format phone numbers (reused from your existing code)
// const formatPhoneNumber = (phone) => {
//   return phone ? `+1-${String(phone).replace(/[^0-9]/g, "")}` : "";
// };

// Helper function to format postal codes (reused from your existing code)
const formatPostalCode = (postalCode) =>
  postalCode ? postalCode.toString().padStart(5, "0") : "";

// Mapping function for Hotpads format
const mapToHotpadsFieldsJson = (listing) => {
  const {
    ListingDetails,
    BasicDetails,
    Agent,
    Office,
    Location,
    RentalDetails,
    Neighborhood,
    RichDetails,
    Media,
  } = listing;

  // Helper function to format dates as YYYY-MM-DD (ISO 8601)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Ensure state is a valid two-letter state code
  const validateState = (state) => {
    const validStates = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
    return validStates.includes(state?.toUpperCase()) ? state.toUpperCase() : "";
  };

  // Ensure `lease_term` is one of Zillow’s accepted values
  const validateLeaseTerm = (term) => {
    const allowedTerms = ["MonthToMonth", "SixMonths", "OneYear", "TwoYear"];
    return allowedTerms.includes(term) ? term : "OneYear"; // Default to OneYear
  };

  // Ensure ZIP is a 5-digit string
  const formatZip = (zip) => {
    if (!zip) return "";
    return zip.toString().padStart(5, "0");
  };

  // Ensure boolean values for pets_allowed and utilities_included
  const parseBoolean = (value) => value === "Yes";

  return {
    property_id: (ListingDetails?.ProviderListingId || listing._id)?.toString(),
    address: Location?.StreetAddress || "",
    unit: Location?.UnitNumber?.toString() || "",
    city: Location?.City || "",
    state: validateState(Location?.State) || "", // Ensure valid state code
    zip: formatZip(Location?.Zip),
    latitude: Location?.Lat || 0,
    longitude: Location?.Long || 0,
    price: Math.max(0, Number(ListingDetails?.Price)) || 0,
    bedrooms: Number(BasicDetails?.Bedrooms) || 0,
    bathrooms: Number(BasicDetails?.Bathrooms) || 0,
    square_feet: Number(BasicDetails?.LivingArea) || 0,
    description: BasicDetails?.Description || "",
    availability: formatDate(RentalDetails?.Availability) || "",
    lease_term: validateLeaseTerm(RentalDetails?.LeaseTerm),
    lastUpdated: new Date().toISOString(), // Adds ISO 8601 timestamp
    
    pets_allowed: RentalDetails?.PetsAllowed ? {
      small_dogs: parseBoolean(RentalDetails.PetsAllowed.SmallDogs),
      large_dogs: parseBoolean(RentalDetails.PetsAllowed.LargeDogs),
      cats: parseBoolean(RentalDetails.PetsAllowed.Cats),
    } : {},
    
    utilities_included: RentalDetails?.UtilitiesIncluded ? {
      water: parseBoolean(RentalDetails.UtilitiesIncluded.Water),
      electricity: parseBoolean(RentalDetails.UtilitiesIncluded.Electricity),
      gas: parseBoolean(RentalDetails.UtilitiesIncluded.Gas),
    } : {},
    
    features: RichDetails?.AdditionalFeatures
      ? RichDetails.AdditionalFeatures.split(",").filter((feature) => feature.trim())
      : [],
    neighborhood: Neighborhood?.Name || "",
    
    photos: Media?.map((media) => media?.MediaURL || "").filter((url) => url) || ["https://example.com/default-image.jpg"],
    
    contact_name: Agent ? `${Agent?.FirstName || ""} ${Agent?.LastName || ""}`.trim() : "",
    contact_email: Agent?.EmailAddress || "",
    contact_phone: Agent?.MobilePhoneLineNumber ? Agent.MobilePhoneLineNumber.toString() : "",
    
    office_name: Office?.BrokerageName || "",
    office_phone: Office?.BrokerPhone ? Office.BrokerPhone.toString() : "",
    office_email: Office?.BrokerEmail || "",
    office_website: Office?.BrokerWebsite || "",
  };
};

const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  return phone.replace(/[^\d]/g, ""); 
};


const mapToHotpadsFields = (listing) => {
  const {
    ListingDetails = {},
    BasicDetails = {},
    Agent = {},
    Office = {},
    Location = {},
    RentalDetails = {},
    Neighborhood = {},
    RichDetails = {},
    Media = [],
  } = listing;

  // Helper function to format dates as YYYY-MM-DD (ISO 8601)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Ensure state is a valid two-letter state code
  const validateState = (state) => {
    const validStates = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
    return validStates.includes(state?.toUpperCase()) ? state.toUpperCase() : "";
  };

  // Ensure ZIP is a 5-digit string
  const formatZip = (zip) => {
    if (!zip) return "";
    return zip.toString().padStart(5, "0");
  };

  // Generate companyId from brokerage name
  const companyId = Office?.BrokerageName?.replace(/\s+/g, "") || "company123";

  // Pets XML structure
  const petTypeMapping = { SmallDogs: "dogs", LargeDogs: "dogs", Cats: "cats" };
  const petsAllowed = {};
  if (RentalDetails?.PetsAllowed) {
    Object.entries(RentalDetails.PetsAllowed).forEach(([type, allowed]) => {
      const petType = petTypeMapping[type] || type.toLowerCase();
      // Convert "Yes"/"No" strings to boolean for consistency
      petsAllowed[petType] = allowed === "Yes" || allowed === true;
    });
  }
  const petsXML = Object.entries(petsAllowed)
    .map(([petType, allowed]) => `
      <pet>
        <petType>${petType}</petType>
        <allowed>${allowed ? "Yes" : "No"}</allowed>
      </pet>`)
    .join("");

  // Media XML
  const mediaXML = Media.map((media) => `
      <ListingPhoto source="${media?.MediaURL || ""}">
        <label>${media?.Label || ""}</label>
        <caption>${media?.Caption || ""}</caption>
      </ListingPhoto>`).join("");

  // Fix 1: Map bathroom counts correctly from BasicDetails.Bathrooms
  const numBedrooms = BasicDetails?.Bedrooms || 0;
  const totalBathrooms = BasicDetails?.Bathrooms || 0;
  const numFullBaths = BasicDetails?.FullBaths || (totalBathrooms > 0 ? Math.floor(totalBathrooms) : 1); // Use Bathrooms if FullBaths missing
  const numHalfBaths = BasicDetails?.HalfBaths || (totalBathrooms % 1 > 0 ? 1 : 0); // Assume half bath if fractional

  // Additional fields
  const description = BasicDetails?.Description || "";
  const terms = RentalDetails?.LeaseTerms || "";
  const leaseTerm = RentalDetails?.LeaseTerm || "";
  const website = Office?.BrokerWebsite || "";
  const virtualTourUrl = RichDetails?.VirtualTourURL || "";
  const isFurnished = RentalDetails?.Furnished || "No";
  const smokingAllowed = RentalDetails?.SmokingAllowed || "No";
  const status = ListingDetails?.Status || "Active";

  // Fix 2: Map amenities from data
 // Fix 2: Map amenities from data
const validateParkingType = (type) => {
  const validTypes = ["Garage", "Street", "Lot", "None"];
  // Normalize "OnStreet" to "Street" for Hotpads compatibility
  const normalizedType = type === "OnStreet" ? "Street" : type;
  return validTypes.includes(normalizedType) ? normalizedType : "None";
};
const parkingType = validateParkingType(RichDetails?.ParkingTypes?.ParkingType || "None");
const parkingXML = `
  <parking>
    <parkingType>${parkingType}</parkingType>
  </parking>`;

const validateLaundryType = (type) => {
  const validTypes = ["In_unit", "On_site", "None"];
  return validTypes.includes(type) ? type : (RichDetails?.OnsiteLaundry === "Yes" ? "On_site" : "None");
};
const laundryType = validateLaundryType(RichDetails?.LaundryType || (RichDetails?.OnsiteLaundry === "Yes" ? "On_site" : "None"));
const laundryXML = `
  <ListingTag type="LAUNDRY">
    <tag></tag>
  </ListingTag>`;
  // Default to "None" for heating/cooling if no data exists
  const validateHeatingFuel = (fuel) => {
    const validFuels = ["Coal", "Electric", "Gas", "Oil", "PropaneButane", "Solar", "WoodPellet", "Other"];
    return validFuels.includes(fuel) ? fuel : "";
  };
  const heatingFuel = validateHeatingFuel(RichDetails?.HeatingFuel || "");
  
  const validateHeatingSystem = (system) => {
    const validSystems = ["Baseboard", "ForcedAir", "HeatPump", "Radiant", "Stove", "Wall", "Other"];
    return validSystems.includes(system) ? system : "";
  };
  const heatingSystem = validateHeatingSystem(RichDetails?.HeatingSystem || "");
  
  const validateCoolingSystem = (system) => {
    const validSystems = ["Central", "Evaporative", "Geothermal", "Wall", "Solar", "Other"];
    return validSystems.includes(system) ? system : "";
  };
  const coolingSystem = validateCoolingSystem(RichDetails?.CoolingSystem || "");
  

  const heatingCoolingXML = `
    <ListingTag type="HEATING_FUEL">
      <tag>${heatingFuel}</tag>
    </ListingTag>
    <ListingTag type="HEATING_SYSTEM">
      <tag>${heatingSystem}</tag>
    </ListingTag>
    <ListingTag type="COOLING_SYSTEM">
      <tag>${coolingSystem}</tag>
    </ListingTag>`;

  // Fix 3: Map additional amenities from RichDetails.AdditionalFeatures
  const additionalFeatures = RichDetails?.AdditionalFeatures?.split(",") || [];
  const additionalAmenitiesXML = additionalFeatures
    .map((feature) => {
      const trimmedFeature = feature.trim();
      // Map to Hotpads amenity types (customize as needed)
      const amenityTypeMap = {
        "Hardwood Floors": "MODEL_AMENITY",
        "High-Speed Internet": "PROPERTY_AMENITY",
        "Cable Ready": "MODEL_AMENITY",
        "Near Public Transportation": "PROPERTY_AMENITY",
      };
      const amenityType = amenityTypeMap[trimmedFeature] || "PROPERTY_AMENITY";
      return `
        <ListingTag type="${amenityType}">
          <tag>${trimmedFeature}</tag>
        </ListingTag>`;
    })
    .join("");

  // Generate the XML
  const xml = `
  <Listing id="${ListingDetails?.ProviderListingId || listing._id}" type="RENTAL" companyId="${companyId}" propertyType="Apartment">
    <restrictions>
      <seniorHousing/>
      <studentHousing/>
      <militaryHousing/>
      <disabledHousing/>
      <incomeRestrictedHousing/>
    </restrictions>
    ${BasicDetails?.Title ? `<name>${BasicDetails.Title}</name>` : ""}
    ${Location?.UnitNumber ? `<unit>${Location.UnitNumber}</unit>` : ""}
    ${Location?.StreetAddress ? `<street hide="false">${Location.StreetAddress}</street>` : ""}
    ${Location?.City ? `<city>${Location.City}</city>` : ""}
    ${Location?.State ? `<state>${validateState(Location.State)}</state>` : ""}
    ${Location?.Zip ? `<zip>${formatZip(Location.Zip)}</zip>` : ""}
    ${Location?.Lat ? `<latitude>${Location.Lat}</latitude>` : ""}
    ${Location?.Long ? `<longitude>${Location.Long}</longitude>` : ""}
    <lastUpdated>${new Date().toISOString()}</lastUpdated>
    ${Agent ? `<contactName>${Agent?.FirstName || ""} ${Agent?.LastName || ""}</contactName>` : ""}
    ${Agent?.EmailAddress ? `<contactEmail>${Agent.EmailAddress}</contactEmail>` : ""}
    ${Agent?.MobilePhoneLineNumber ? `<contactPhone>${String(Agent.MobilePhoneLineNumber).replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")}</contactPhone>` : ""}
    ${petsXML ? `<pets>${petsXML}</pets>` : ""}
    ${mediaXML}
    ${ListingDetails?.Price ? `<price>${Math.max(0, Number(ListingDetails.Price))}</price>` : ""}
    <numBedrooms>${numBedrooms}</numBedrooms>
    <numFullBaths>${numFullBaths}</numFullBaths>
    <numHalfBaths>${numHalfBaths}</numHalfBaths>
    ${description ? `<description>${description}</description>` : ""}
    ${terms ? `<terms>${terms}</terms>` : ""}
    ${leaseTerm ? `<leaseTerm>${leaseTerm}</leaseTerm>` : ""}
    ${website ? `<website>${website}</website>` : ""}
    ${virtualTourUrl ? `<virtualTourUrl>${virtualTourUrl}</virtualTourUrl>` : ""}
    <isFurnished>${isFurnished}</isFurnished>
    <smokingAllowed>${smokingAllowed}</smokingAllowed>
    <status>${status}</status>
    ${parkingXML}
    ${laundryXML}
    ${heatingCoolingXML}
    ${additionalAmenitiesXML}
  </Listing>`;

  return xml;
};



// New endpoint for Hotpads-formatted listings (XML)
app.get("/api/hotpads-listings", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    await connectDB();

    // Fetch listings from MongoDB
    const listings = await Listing.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Transform listings to Hotpads XML format
    const transformedListings = listings.map(mapToHotpadsFields);

    // Combine all listings into a single XML string
    const xmlFeed = `<?xml version="1.0" encoding="UTF-8"?>
<hotPadsItems version="2.1">
  ${transformedListings.join("\n")}
</hotPadsItems>`;

    // Set the response header to indicate XML content
    res.set("Content-Type", "application/xml");

    // Send the XML feed as the response
    res.send(xmlFeed);
  } catch (error) {
    console.error("Error fetching Hotpads listings:", error);
    res.status(500).json({ error: "Failed to fetch Hotpads listings" });
  }
});



// New endpoint for Hotpads-formatted listings
app.get("/api/hotpadsjson-listings", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    await connectDB();

    const listings = await Listing.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Transform listings to Hotpads format
    const transformedListings = listings.map(mapToHotpadsFieldsJson);

    // Return transformed listings
    res.json(transformedListings);
  } catch (error) {
    console.error("Error fetching Hotpads listings:", error);
    res.status(500).json({ error: "Failed to fetch Hotpads listings" });
  }
});


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

// Fetch listings endpoint
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
