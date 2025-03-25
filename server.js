const axios = require("axios");
const xml2js = require("xml2js");
const express = require("express");
const { Builder } = require("xml2js");
const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const app = express();
const PORT = 5000;

// MongoDB URI
const MONGODB_URI =
  "mongodb+srv://Eatsumn:Eatsumn@cluster0.glsj1ah.mongodb.net/dave-moneheight";

// Define schema and model
const ListingSchema = new Schema({}, { strict: false });
const Listing = models.Listing || model("Listing", ListingSchema);

// Middleware to connect to MongoDB
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

// const mapToHotpadsFields = (listing) => {
//   const {
//     ListingDetails = {},
//     BasicDetails = {},
//     Agent = {},
//     Office = {},
//     Location = {},
//     RentalDetails = {},
//     RichDetails = {},
//     Media = [],
//   } = listing;

//   // Helper function to format dates as YYYY-MM-DD (ISO 8601)
//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     return date.toISOString().split("T")[0];
//   };

//   // Ensure state is a valid two-letter state code
//   const validateState = (state) => {
//     const validStates = [
//       "AL",
//       "AK",
//       "AZ",
//       "AR",
//       "CA",
//       "CO",
//       "CT",
//       "DE",
//       "FL",
//       "GA",
//       "HI",
//       "ID",
//       "IL",
//       "IN",
//       "IA",
//       "KS",
//       "KY",
//       "LA",
//       "ME",
//       "MD",
//       "MA",
//       "MI",
//       "MN",
//       "MS",
//       "MO",
//       "MT",
//       "NE",
//       "NV",
//       "NH",
//       "NJ",
//       "NM",
//       "NY",
//       "NC",
//       "ND",
//       "OH",
//       "OK",
//       "OR",
//       "PA",
//       "RI",
//       "SC",
//       "SD",
//       "TN",
//       "TX",
//       "UT",
//       "VT",
//       "VA",
//       "WA",
//       "WV",
//       "WI",
//       "WY",
//     ];
//     return validStates.includes(state?.toUpperCase())
//       ? state.toUpperCase()
//       : "";
//   };

//   // Ensure ZIP is a 5-digit string
//   const formatZip = (zip) => {
//     if (!zip) return "";
//     return zip.toString().padStart(5, "0");
//   };

//   // Generate companyId from brokerage name
//   const companyId = Office?.BrokerageName?.replace(/\s+/g, "") || "company123";

//   // Pets XML structure
//   const petTypeMapping = { SmallDogs: "dogs", LargeDogs: "dogs", Cats: "cats" };
//   const petsAllowed = {};
//   if (RentalDetails?.PetsAllowed) {
//     Object.entries(RentalDetails.PetsAllowed).forEach(([type, allowed]) => {
//       const petType = petTypeMapping[type] || type.toLowerCase();
//       petsAllowed[petType] = allowed === "Yes" || allowed === true;
//     });
//   }
//   const petsXML = Object.entries(petsAllowed)
//     .map(
//       ([petType, allowed]) => `
//       <pet>
//         <petType>${petType}</petType>
//         <allowed>${allowed ? "Yes" : "No"}</allowed>
//       </pet>`
//     )
//     .join("");

//   // Media XML
//   const mediaXML = Media.map(
//     (media) => `
//       <ListingPhoto source="${media?.MediaURL || ""}">
//         <label>${media?.Label || ""}</label>
//         <caption>${media?.Caption || ""}</caption>
//       </ListingPhoto>`
//   ).join("");

//   // Map bathroom counts correctly
//   const numBedrooms = BasicDetails?.Bedrooms || 0;
//   const totalBathrooms = BasicDetails?.Bathrooms || 0;
//   const numFullBaths =
//     BasicDetails?.FullBaths ||
//     (totalBathrooms > 0 ? Math.floor(totalBathrooms) : 1);
//   const numHalfBaths =
//     BasicDetails?.HalfBaths || (totalBathrooms % 1 > 0 ? 1 : 0);

//   // Additional fields
//   const description = BasicDetails?.Description || "";
//   const terms = RentalDetails?.LeaseTerms || "";
//   const leaseTerm = RentalDetails?.LeaseTerm || "";
//   const website = Office?.BrokerWebsite || "";
//   const virtualTourUrl = RichDetails?.VirtualTourURL || "";
//   const isFurnished = RentalDetails?.Furnished || "No";
//   const smokingAllowed = RentalDetails?.SmokingAllowed || "No";
//   const status = ListingDetails?.Status || "Active";

//   // Parking XML
//   const validateParkingType = (type) => {
//     const validTypes = ["Garage", "Street", "Lot", "None"];
//     const normalizedType = type === "OnStreet" ? "Street" : type;
//     return validTypes.includes(normalizedType) ? normalizedType : "None";
//   };
//   const parkingType = validateParkingType(
//     RichDetails?.ParkingTypes?.ParkingType || "None"
//   );
//   const parkingXML = `
//     <parking>
//       <parkingType>${parkingType}</parkingType>
//     </parking>`;

//   // Laundry XML
//   const validateLaundryType = (type) => {
//     const validTypes = ["In_unit", "On_site", "None"];
//     return validTypes.includes(type)
//       ? type
//       : RichDetails?.OnsiteLaundry === "Yes"
//       ? "On_site"
//       : "None";
//   };
//   const laundryType = validateLaundryType(
//     RichDetails?.LaundryType ||
//       (RichDetails?.OnsiteLaundry === "Yes" ? "On_site" : "None")
//   );
//   const laundryXML = `
//     <ListingTag type="LAUNDRY">
//       <tag></tag>
//     </ListingTag>`;

//   // Heating/Cooling XML (left empty unless explicitly provided)
//   const heatingCoolingXML = `
//     <ListingTag type="HEATING_FUEL">
//       <tag>${RichDetails?.HeatingFuel || ""}</tag>
//     </ListingTag>
//     <ListingTag type="HEATING_SYSTEM">
//       <tag>${RichDetails?.HeatingSystem || ""}</tag>
//     </ListingTag>
//     <ListingTag type="COOLING_SYSTEM">
//       <tag>${RichDetails?.CoolingSystem || ""}</tag>
//     </ListingTag>`;

//   // Additional amenities XML
//   const additionalFeatures = RichDetails?.AdditionalFeatures?.split(",") || [];
//   const additionalAmenitiesXML = additionalFeatures
//     .map((feature) => {
//       const trimmedFeature = feature.trim();
//       const amenityTypeMap = {
//         "Hardwood Floors": "MODEL_AMENITY",
//         "High-Speed Internet": "PROPERTY_AMENITY",
//         "Cable Ready": "MODEL_AMENITY",
//         "Near Public Transportation": "PROPERTY_AMENITY",
//       };
//       const amenityType = amenityTypeMap[trimmedFeature] || "PROPERTY_AMENITY";
//       return `
//         <ListingTag type="${amenityType}">
//           <tag>${trimmedFeature}</tag>
//         </ListingTag>`;
//     })
//     .join("");

//   // Utilities included in rent (left empty unless explicitly provided)
//   const utilitiesIncluded = Array.isArray(RentalDetails?.UtilitiesIncluded)
//     ? RentalDetails.UtilitiesIncluded
//     : [];
//   const utilitiesXML = utilitiesIncluded
//     .map(
//       (utility) => `
//       <ListingTag type="UTILITY">
//         <tag>${utility}</tag>
//       </ListingTag>`
//     )
//     .join("");

//   // Default Appliances (if data is missing)
//   const defaultAppliances = ["Refrigerator", "Stove"];
//   const appliancesFromData = RichDetails?.Appliances?.split(",") || [];
//   const appliances = appliancesFromData.length
//     ? appliancesFromData.map((a) => a.trim())
//     : defaultAppliances;

//   // Generate Appliances XML
//   const appliancesXML = appliances
//     .map(
//       (appliance) => `
//       <ListingTag type="APPLIANCE">
//         <tag>${appliance}</tag>
//       </ListingTag>`
//     )
//     .join("");

//   // Generate the XML
//   const xml = `
//   <Listing id="${
//     ListingDetails?.ProviderListingId || listing._id
//   }" type="RENTAL" companyId="${companyId}" propertyType="Apartment">
//     <restrictions>
//       <seniorHousing/>
//       <studentHousing/>
//       <militaryHousing/>
//       <disabledHousing/>
//       <incomeRestrictedHousing/>
//     </restrictions>
//     ${BasicDetails?.Title ? `<name>${BasicDetails.Title}</name>` : ""}
//     ${Location?.UnitNumber ? `<unit>${Location.UnitNumber}</unit>` : ""}
//     ${
//       Location?.StreetAddress
//         ? `<street hide="false">${Location.StreetAddress}</street>`
//         : ""
//     }
//     ${Location?.City ? `<city>${Location.City}</city>` : ""}
//     ${Location?.State ? `<state>${validateState(Location.State)}</state>` : ""}
//     ${Location?.Zip ? `<zip>${formatZip(Location.Zip)}</zip>` : ""}
//     ${Location?.Lat ? `<latitude>${Location.Lat}</latitude>` : ""}
//     ${Location?.Long ? `<longitude>${Location.Long}</longitude>` : ""}
//     <lastUpdated>${new Date().toISOString()}</lastUpdated>
//     ${
//       Agent
//         ? `<contactName>${Agent?.FirstName || ""} ${
//             Agent?.LastName || ""
//           }</contactName>`
//         : ""
//     }
//     ${
//       Agent?.EmailAddress
//         ? `<contactEmail>${Agent.EmailAddress}</contactEmail>`
//         : ""
//     }
//     ${
//       Agent?.MobilePhoneLineNumber
//         ? `<contactPhone>${String(Agent.MobilePhoneLineNumber)
//             .replace(/\D/g, "")
//             .replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")}</contactPhone>`
//         : ""
//     }
//     ${petsXML ? `<pets>${petsXML}</pets>` : ""}
//     ${mediaXML}
//     ${
//       ListingDetails?.Price
//         ? `<price>${Math.max(0, Number(ListingDetails.Price))}</price>`
//         : ""
//     }
//     <numBedrooms>${numBedrooms}</numBedrooms>
//     <numFullBaths>${numFullBaths}</numFullBaths>
//     <numHalfBaths>${numHalfBaths}</numHalfBaths>
//     ${description ? `<description>${description}</description>` : ""}
//     ${terms ? `<terms>${terms}</terms>` : ""}
//     ${leaseTerm ? `<leaseTerm>${leaseTerm}</leaseTerm>` : ""}
//     ${website ? `<website>${website}</website>` : ""}
//     ${
//       virtualTourUrl ? `<virtualTourUrl>${virtualTourUrl}</virtualTourUrl>` : ""
//     }
//     <isFurnished>${isFurnished}</isFurnished>
//     <smokingAllowed>${smokingAllowed}</smokingAllowed>
//     <status>${status}</status>
//     ${parkingXML}
//     ${laundryXML}
//     ${heatingCoolingXML}
//     ${additionalAmenitiesXML}
//     ${utilitiesXML}
//   </Listing>`;

//   return xml;
// };

// // New endpoint for Hotpads-formatted listings (XML)
// app.get("/hotpads-listings", async (req, res) => {
//   const { page = 1, limit = 10 } = req.query;

//   try {
//     await connectDB();

//     // Fetch listings from MongoDB
//     const listings = await Listing.find()
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .lean();

//     // Transform listings to Hotpads XML format
//     const transformedListings = listings.map(mapToHotpadsFields);

//     // Combine all listings into a single XML string
//     const xmlFeed = `<?xml version="1.0" encoding="UTF-8"?>
// <hotPadsItems version="2.1">
//   ${transformedListings.join("\n")}
// </hotPadsItems>`;

//     // Set the response header to indicate XML content
//     res.set("Content-Type", "application/xml");

//     // Send the XML feed as the response
//     res.send(xmlFeed);
//   } catch (error) {
//     console.error("Error fetching Hotpads listings:", error);
//     res.status(500).json({ error: "Failed to fetch Hotpads listings" });
//   }
// });

app.get("/listings", async (req, res) => {
  try {
    // Fetch data from the API
    const response = await axios.post(
      "https://www.yougotlistings.com/api/rentals/search.php",
      new URLSearchParams({
        key: "C0lOBfoG7SWzPbjsQuTLntFKpvrAmY1ewNXhRMig",
        status: "ONMARKET",
        city: "Boston",
        pageIndex: "1",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Parse the XML response
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);

    // Extract Listings
    const listings = result?.YGLResponse?.Listings?.Listing || [];

    // Function to fetch agent details if ListingAgentID exists
    const getAgentDetails = async (listingAgentID) => {
      if (!listingAgentID) {
        return {
          Name: "Encore Realty",
          Email: "info@allaccessboston.com",
          Phone: "617-981-6900",
        };
      }

      try {
        const agentResponse = await axios.get(
          `https://www.yougotlistings.com/api/users/search.php?key=YOUR_API_KEY&id=${listingAgentID}`
        );
        const agentResult = await parser.parseStringPromise(agentResponse.data);
        return {
          Name: agentResult?.YGLResponse?.Users?.User?.Name || "Encore Realty",
          Email:
            agentResult?.YGLResponse?.Users?.User?.Email ||
            "info@allaccessboston.com",
          Phone: agentResult?.YGLResponse?.Users?.User?.Phone || "617-981-6900",
        };
      } catch (error) {
        console.error("Error fetching agent details:", error.message);
        return {
          Name: "Encore Realty",
          Email: "info@allaccessboston.com",
          Phone: "617-981-6900",
        };
      }
    };

    // Transform listings into Zillow XML format with required adjustments
    const zillowListings = await Promise.all(
      listings.map(async (listing) => {
        const agentDetails = await getAgentDetails(listing.ListingAgentID);

        // Default values for missing fields
        const propertyType = listing.BuildingType || "Apartment";
        const petPolicy = listing.Pet || "No Pets";
        const rentIncludes = listing.RentIncludes
          ? Array.isArray(listing.RentIncludes.RentInclude)
            ? listing.RentIncludes.RentInclude
            : [listing.RentIncludes.RentInclude]
          : ["None"];

        // Generate descriptions if empty
        const buildingDescription =
          listing.BuildingDescription ||
          `Well-maintained ${propertyType} building in ${
            listing.Neighborhood || "Boston"
          }`;
        const unitDescription =
          listing.UnitDescription ||
          `${listing.Beds || "0"} bed, ${listing.Baths || "0"} bath unit`;

        return {
          Listing: {
            ListingID: listing.ID,
            ExternalID: listing.ExternalID || "",
            Address: `${listing.StreetNumber || ""} ${
              listing.StreetName || ""
            }`.trim(),
            Unit: listing.Unit || "",
            City: listing.City,
            Neighborhood: listing.Neighborhood || "",
            State: listing.State,
            Zip: listing.Zip,
            Latitude: parseFloat(listing.Latitude) || 0,
            Longitude: parseFloat(listing.Longitude) || 0,
            CreateDate: listing.CreateDate,
            UpdateDate: listing.UpdateDate,
            StatusDate: listing.StatusDate,
            Beds: parseFloat(listing.Beds) || 0,
            BedInfo: listing.BedInfo || "",
            Room: listing.Room || "0",
            Baths: parseFloat(listing.Baths) || 0,
            AvailableDate: listing.AvailableDate || "",
            Rent: parseFloat(listing.Price) || 0,
            Status: listing.Status,
            Pet: petPolicy,
            Fee: listing.Fee || "",
            FeeAdditionalInfo: listing.FeeAdditionalInfo || "",
            Parking: {
              ParkingType:
                (listing.Parking && listing.Parking.ParkingType) || "None",
              ParkingAvailability:
                (listing.Parking && listing.Parking.ParkingAvailability) || "",
              ParkingNumber:
                (listing.Parking && listing.Parking.ParkingNumber) || "",
              ParkingPrice:
                (listing.Parking && parseFloat(listing.Parking.ParkingPrice)) ||
                0,
            },
            SquareFootage: parseFloat(listing.SquareFootage) || 0,
            UnitLevel: listing.UnitLevel || "",
            HeatSource: listing.HeatSource || "",
            Laundry: listing.Laundry || "",
            IncludeElectricity: listing.IncludeElectricity === "1",
            IncludeGas: listing.IncludeGas === "1",
            IncludeHeat: listing.IncludeHeat === "1",
            IncludeHotWater: listing.IncludeHotWater === "1",
            ListingAgentID: listing.ListingAgentID || "",
            BuildingDescription: buildingDescription,
            UnitDescription: unitDescription,
            ContactInformation: {
              Name: agentDetails.Name,
              Email: agentDetails.Email,
              Phone: agentDetails.Phone,
            },
            leaseTerm: "OneYear",
            PropertyType: propertyType,
            isFurnished: "No",
            smokingAllowed: "No",
            RentIncludes: { RentInclude: rentIncludes },
            restrictions: {
              seniorHousing: "",
              studentHousing: "",
              militaryHousing: "",
              disabledHousing: "",
              incomeRestrictedHousing: "",
            },
            description: `${unitDescription}. ${buildingDescription}`,
            website: "http://www.allaccessboston.com",
            Videos: listing.Videos
              ? {
                  Video: Array.isArray(listing.Videos.Video)
                    ? listing.Videos.Video
                    : [listing.Videos.Video],
                }
              : { Video: [] },
            VirtualTours: listing.VirtualTours
              ? {
                  VirtualTour: Array.isArray(listing.VirtualTours.VirtualTour)
                    ? listing.VirtualTours.VirtualTour
                    : [listing.VirtualTours.VirtualTour],
                }
              : { VirtualTour: [] },
            Photos: listing.Photos
              ? {
                  Photo: Array.isArray(listing.Photos.Photo)
                    ? listing.Photos.Photo
                    : [listing.Photos.Photo],
                }
              : { Photo: [] },
            AllowedToPost: true,
          },
        };
      })
    );

    // Build the final XML response
    const builder = new Builder({ rootName: "Listings", headless: true });
    const xml = builder.buildObject({ Listings: zillowListings });

    // Set the response header to XML
    res.set("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Error fetching listings:", error.message);
    res.status(500).send("<Error>Failed to fetch listings</Error>");
  }
});

app.get("/hotpads-listings", async (req, res) => {
  try {
    // Fetch live data from YGL API
    const response = await axios.post(
      "https://www.yougotlistings.com/api/rentals/search.php",
      new URLSearchParams({
        key: "C0lOBfoG7SWzPbjsQuTLntFKpvrAmY1ewNXhRMig",
        status: "ONMARKET",
        city: "Boston",
        pageIndex: "1",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Parse XML response
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);
    const listings = result?.YGLResponse?.Listings?.Listing || [];

    // Transform YGL listings to Hotpads XML format
    const transformedListings = listings.map((listing) => {
      // Calculate bathroom counts
      const baths = parseFloat(listing.Baths) || 0;
      const numFullBaths = Math.floor(baths);
      const hasHalfBath = baths % 1 >= 0.5;

      // Determine parking type from YGL data
      const parkingType = listing.MlsParking?.GarageSpaces > 0 ? "garage" : 
                         listing.MlsParking?.CoveredSpaces > 0 ? "coveredlot" : 
                         listing.MlsParking?.Total > 0 ? "surfacelot" : "none";

      // Map rent includes to Zillow's standard values
      const rentIncludes = [];
      if (listing.RentIncludes?.RentInclude) {
        const includes = Array.isArray(listing.RentIncludes.RentInclude)
          ? listing.RentIncludes.RentInclude
          : [listing.RentIncludes.RentInclude];

        includes.forEach((include) => {
          if (include.match(/heat/i)) rentIncludes.push("Heat");
          if (include.match(/water/i)) rentIncludes.push("Water");
          if (include.match(/gas/i)) rentIncludes.push("Gas");
          if (include.match(/snow/i)) rentIncludes.push("Snow Removal");
          if (include.match(/garden/i)) rentIncludes.push("Gardener");
        });
      }

      // Generate XML
      let listingXml = `
  <Listing id="${listing.ID}" type="RENTAL" companyId="EncoreRealty" propertyType="Apartment">
    <restrictions>
      <seniorHousing/>
      <studentHousing/>
      <militaryHousing/>
      <disabledHousing/>
      <incomeRestrictedHousing/>
      <incomeRestrictions>
        <onePersonHouseholdIncomePerMonth/>
        <twoPersonHouseholdIncomePerMonth/>
        <threePersonHouseholdIncomePerMonth/>
        <fourPersonHouseholdIncomePerMonth/>
        <fivePersonHouseholdIncomePerMonth/>
        <sixPersonHouseholdIncomePerMonth/>
        <sevenPersonHouseholdIncomePerMonth/>
        <eightPersonHouseholdIncomePerMonth/>
      </incomeRestrictions>
    </restrictions>
    <name>${listing.Beds}BR at ${listing.StreetName}</name>
    <unit>${listing.Unit || ""}</unit>
    <street hide="false">${listing.StreetNumber} ${listing.StreetName}</street>
    <city>${listing.City}</city>
    <state>${listing.State}</state>
    <zip>${listing.Zip}</zip>
    <latitude>${listing.Latitude}</latitude>
    <longitude>${listing.Longitude}</longitude>
    <lastUpdated>${new Date(listing.UpdateDate || listing.CreateDate).toISOString()}</lastUpdated>
    <contactName>${listing.MlsAgentName || "Encore Realty"}</contactName>
    <contactEmail>info@allaccessboston.com</contactEmail>
    <contactPhone>${listing.MlsAgentPhone || "617-981-6900"}</contactPhone>
    <price>${listing.Price}</price>
    <numBedrooms>${listing.Beds}</numBedrooms>
    <numFullBaths>${numFullBaths}</numFullBaths>`;

      // Only include half bath if exists
      if (hasHalfBath) {
        listingXml += `
    <numHalfBaths>1</numHalfBaths>`;
      } else {
        listingXml += `
    <numHalfBaths>0</numHalfBaths>`;
      }

      listingXml += `
    <description>${listing.Beds} bed, ${listing.Baths} bath in ${listing.City}</description>
    <leaseTerm>OneYear</leaseTerm>
    <website>http://www.allaccessboston.com</website>
    <isFurnished>No</isFurnished>
    <smokingAllowed>No</smokingAllowed>
    <status>For Rent</status>
    <parking>
      <parkingType>${parkingType}</parkingType>
    </parking>`;

      // Add mandatory fees section
      listingXml += `
    <fees>
      <fee>
        <feeCalculationType value="0" valueType="flatFee"/>
        <feeType>applicationFee</feeType>
        <feeRequirementType>mandatory</feeRequirementType>
      </fee>
    </fees>`;

      // Add pet policy if exists
      if (listing.Pet) {
        const allowsPets = listing.Pet.toLowerCase().includes("yes");
        listingXml += `
    <pets>
      <pet>
        <petType>dogs</petType>
        <allowed>${allowsPets ? "Yes" : "No"}</allowed>
      </pet>
      <pet>
        <petType>cats</petType>
        <allowed>${allowsPets ? "Yes" : "No"}</allowed>
      </pet>
    </pets>`;
      }

      // Add rent includes
      rentIncludes.forEach((include) => {
        listingXml += `
    <ListingTag type="RENT_INCLUDES">
      <tag>${include}</tag>
    </ListingTag>`;
      });

      // Add laundry if exists
      if (listing.Laundry) {
        listingXml += `
    <ListingTag type="LAUNDRY">
      <tag>${listing.Laundry.includes("Unit") ? "IN_UNIT" : "SHARED"}</tag>
    </ListingTag>`;
      }

      // Add photos
      if (listing.Photos?.Photo) {
        const photos = Array.isArray(listing.Photos.Photo)
          ? listing.Photos.Photo
          : [listing.Photos.Photo];
        photos.forEach((photo) => {
          listingXml += `
    <ListingPhoto source="${photo}">
      <label>Property Photo</label>
    </ListingPhoto>`;
        });
      }

      // Add virtual tour if available
      if (listing.VirtualTours?.VirtualTour) {
        const tour = Array.isArray(listing.VirtualTours.VirtualTour)
          ? listing.VirtualTours.VirtualTour[0]
          : listing.VirtualTours.VirtualTour;
        listingXml += `
    <virtualTourUrl>${tour}</virtualTourUrl>`;
      }

      listingXml += `
  </Listing>`;

      return listingXml;
    });

    // Final XML feed with proper Hotpads wrapper
    const xmlFeed = `<?xml version="1.0" encoding="UTF-8"?>
<hotPadsItems version="2.1">
  ${transformedListings.join("\n")}
</hotPadsItems>`;

    res.set("Content-Type", "application/xml");
    res.send(xmlFeed);
  } catch (error) {
    console.error("Error generating Hotpads feed:", error);
    res.status(500).send("<Error>Failed to generate feed</Error>");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
