const axios = require('axios');
const xml2js = require('xml2js');
const express = require('express');
const { Builder } = require('xml2js');

const app = express();
const PORT = 5000;

app.get('/listings', async (req, res) => {
    try {
        // Fetch data from the API
        const response = await axios.post(
            'https://www.yougotlistings.com/api/rentals/search.php',
            new URLSearchParams({
                key: 'C0lOBfoG7SWzPbjsQuTLntFKpvrAmY1ewNXhRMig',
                status: 'ONMARKET',
                city: 'Boston',
                pageIndex: '1',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        // Parse the XML response
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(response.data);

        // Extract Listings
        const listings = result?.YGLResponse?.Listings?.Listing || [];

        // Transform listings into Hotpads XML format
        const hotpadsListings = listings.map(listing => ({
            Listing: {
                ListingID: listing.ID,
                Source: listing.Source,
                ExternalID: listing.ExternalID || '',
                Address: `${listing.StreetNumber || ''} ${listing.StreetName || ''}`.trim(),
                Unit: listing.Unit || '',
                City: listing.City,
                Neighborhood: listing.Neighborhood || '',
                State: listing.State,
                Zip: listing.Zip,
                Latitude: parseFloat(listing.Latitude) || 0,
                Longitude: parseFloat(listing.Longitude) || 0,
                CreateDate: listing.CreateDate,
                UpdateDate: listing.UpdateDate,
                StatusDate: listing.StatusDate,
                Beds: parseFloat(listing.Beds) || 0,
                BedInfo: listing.BedInfo || '',
                Room: listing.Room || '0',
                Baths: parseFloat(listing.Baths) || 0,
                AvailableDate: listing.AvailableDate || '',
                Rent: parseFloat(listing.Price) || 0,
                Status: listing.Status,
                Pet: listing.Pet || '',
                Fee: listing.Fee || '',
                FeeAdditionalInfo: listing.FeeAdditionalInfo || '',
                Parking: listing.Parking && typeof listing.Parking === 'object' ? {
                    ParkingAvailability: listing.Parking.ParkingAvailability || '',
                    ParkingNumber: listing.Parking.ParkingNumber || '',
                    ParkingPrice: parseFloat(listing.Parking.ParkingPrice) || 0,
                    ParkingType: listing.Parking.ParkingType || '',
                } : {},
                SquareFootage: parseFloat(listing.SquareFootage) || 0,
                UnitLevel: listing.UnitLevel || '',
                HeatSource: listing.HeatSource || '',
                Laundry: listing.Laundry || '',
                IncludeElectricity: listing.IncludeElectricity === '1',
                IncludeGas: listing.IncludeGas === '1',
                IncludeHeat: listing.IncludeHeat === '1',
                IncludeHotWater: listing.IncludeHotWater === '1',
                ListingAgentID: listing.ListingAgentID || '',
                RentIncludes: listing.RentIncludes
                    ? { RentInclude: Array.isArray(listing.RentIncludes.RentInclude) ? listing.RentIncludes.RentInclude : [listing.RentIncludes.RentInclude] }
                    : { RentInclude: [] },
                Videos: listing.Videos
                    ? { Video: Array.isArray(listing.Videos.Video) ? listing.Videos.Video : [listing.Videos.Video] }
                    : { Video: [] },
                VirtualTours: listing.VirtualTours
                    ? { VirtualTour: Array.isArray(listing.VirtualTours.VirtualTour) ? listing.VirtualTours.VirtualTour : [listing.VirtualTours.VirtualTour] }
                    : { VirtualTour: [] },
                Photos: listing.Photos
                    ? { Photo: Array.isArray(listing.Photos.Photo) ? listing.Photos.Photo : [listing.Photos.Photo] }
                    : { Photo: [] },
            },
        }));

        // Build the final XML response
        const builder = new Builder({ rootName: 'Listings', headless: true });
        const xml = builder.buildObject({ Listings: hotpadsListings });

        // Set the response header to XML
        res.set('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Error fetching listings:', error.message);
        res.status(500).send('<Error>Failed to fetch listings</Error>');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});