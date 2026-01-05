const Listing = require("../models/listing.js");

// Lazy load Mapbox SDK only when needed
let geocodingClient;
const getGeocodingClient = () => {
    if (!geocodingClient) {
        console.log("DEBUG: Lazy loading Mapbox SDK...");
        const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
        geocodingClient = mbxGeoCoding({ accessToken: process.env.MAP_TOKEN });
    }
    return geocodingClient;
};

module.exports.index = async (req, res) => {
    let allListings;
    const { search, category, minPrice, maxPrice } = req.query;
    const mapToken = process.env.MAP_TOKEN; // Keep mapToken for rendering

    let filter = {};

    if (category) {
        // Map UI categories to database types
        const categoryMap = {
            "Rooms": ["Apartment", "Loft", "Brownstone", "Room"],
            "Mountains": ["Cabin", "Chalet", "Log Cabin", "Mountain"],
            "Cities": ["Penthouse", "Condo", "Loft", "Apartment", "City"],
            "Pools": ["Villa", "Pool", "Pools"],
            "Castle": ["Castle", "Castles"],
            "Camping": ["Treehouse", "Camping", "Tent", "Campground"],
            "Farms": ["Farm", "Lodge", "Tractor", "Farms"],
            "Arctic": ["Arctic", "Chalet", "Igloo", "Ice"],
            "Deserts": ["Desert", "Deserts"]
        };

        if (categoryMap[category]) {
            filter.type = { $in: categoryMap[category] };
        } else {
            filter.type = category;
        }
    }

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } }
        ];
    }

    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(filter)
        .select("name price image owner location type geometry reviews")
        .populate("owner", "username")
        .populate("reviews", "rating")
        .lean();

    res.render("listings/index", { listings, mapToken, category, minPrice, maxPrice, search });
};

module.exports.searchSuggestions = async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const suggestions = await Listing.find({
        $or: [
            { name: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } }
        ]
    }).limit(8).select("name location").lean();

    // Map to a cleaner format and remove duplicates if any
    const results = suggestions.map(s => s.name.toLowerCase().includes(q.toLowerCase()) ? s.name : s.location);
    res.json([...new Set(results)]);
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new", { bodyClass: 'w-full p-0 flex-grow' });
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    console.log(`DEBUG: showListing called with id: ${id}`);
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
                select: "username"
            },
            options: { sort: { createdAt: -1 } } // Show latest reviews first
        })
        .populate("owner", "username email");

    if (!listing) {
        req.flash('error', 'Listing not found');
        return res.redirect('/');
    }

    const coordinates = (listing.geometry && Array.isArray(listing.geometry.coordinates) && listing.geometry.coordinates.length === 2)
        ? listing.geometry.coordinates
        : [77.209, 28.6139];

    const mapToken = process.env.MAP_TOKEN;
    if (!mapToken) console.error("⚠️ MAP_TOKEN is undefined in controller!");

    const bookings = await Booking.find({ listing: id, status: { $ne: 'cancelled' } }).select('checkIn checkOut');

    res.render("listings/show", { listing, coordinates, mapToken, bookings });
};

module.exports.createListing = async (req, res, next) => {
    let geoFeature;
    try {
        const response = await getGeocodingClient().forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        }).send();
        geoFeature = response.body.features[0];
    } catch (geoErr) {
        console.error("⚠️ Mapbox Geocoding failed:", geoErr.message);
    }

    const listingData = req.body.listing;
    const newlisting = new Listing(listingData);
    newlisting.owner = req.user._id;

    if (req.file) {
        newlisting.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    if (geoFeature && Array.isArray(geoFeature.geometry.coordinates)) {
        newlisting.geometry = geoFeature.geometry;
    } else {
        newlisting.geometry = {
            type: "Point",
            coordinates: [77.209, 28.6139],
        };
    }

    await newlisting.save();
    req.flash('success', 'Listing created successfully!');
    res.redirect("/");
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Listing not found');
        return res.redirect('/');
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("listings/edit", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== 'undefined') {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash('success', 'Listing updated successfully!');
    res.redirect(`/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted successfully!');
    res.redirect("/");
};

// Booking Controller Logic
const Booking = require("../models/booking.js");

module.exports.renderCheckout = async (req, res) => {
    const { id } = req.params;
    const { booking } = req.query; // Expecting booking[checkIn], etc. from GET form

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/');
    }

    // Pass data to checkout view
    // Calculate basics again for safety/display
    let checkIn, checkOut, guests, nights, totalPrice, basePrice;

    if (booking && booking.checkIn && booking.checkOut) {
        checkIn = new Date(booking.checkIn);
        checkOut = new Date(booking.checkOut);
        guests = booking.guests || 1;

        const oneDay = 24 * 60 * 60 * 1000;
        nights = Math.round(Math.abs((new Date(booking.checkOut) - new Date(booking.checkIn)) / oneDay));
        basePrice = listing.price * nights;
        totalPrice = basePrice + 1500 + 850;
    }

    // Check for overlapping bookings
    if (checkIn && checkOut) {
        const existingBooking = await Booking.findOne({
            listing: id,
            status: { $ne: 'cancelled' },
            $or: [
                { checkIn: { $lt: checkOut, $gte: checkIn } }, // Existing starts during request
                { checkOut: { $gt: checkIn, $lte: checkOut } }, // Existing ends during request
                { checkIn: { $lte: checkIn }, checkOut: { $gte: checkOut } } // Existing fully overlaps
            ]
        });

        if (existingBooking) {
            req.flash('error', 'Dates are no longer available!');
            return res.redirect(`/${id}`);
        }
    }

    res.render("bookings/checkout", { listing, checkIn: booking.checkIn, checkOut: booking.checkOut, guests, nights, basePrice, totalPrice });
};

module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const { booking } = req.body;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/');
    }

    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const guests = booking.guests || 1;

    // Basic Validation
    if (checkIn >= checkOut) {
        req.flash('error', 'Check-out date must be after Check-in date!');
        return res.redirect(`/${id}`);
    }

    // Check availability again (Race Condition check)
    const existingBooking = await Booking.findOne({
        listing: id,
        status: { $ne: 'cancelled' },
        $or: [
            { checkIn: { $lt: checkOut, $gte: checkIn } },
            { checkOut: { $gt: checkIn, $lte: checkOut } },
            { checkIn: { $lte: checkIn }, checkOut: { $gte: checkOut } }
        ]
    });

    if (existingBooking) {
        req.flash('error', 'Sorry, these dates were just booked by someone else!');
        return res.redirect(`/${id}`);
    }

    // Calculate Price
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(Math.abs((checkOut - checkIn) / oneDay));
    const totalPrice = (listing.price * diffDays) + 1500 + 850; // Base + Cleaning + Service (Hardcoded for demo)

    const newBooking = new Booking({
        listing: id,
        booker: req.user._id,
        checkIn: checkIn,
        checkOut: checkOut,
        guests: guests,
        totalPrice: totalPrice
    });

    await newBooking.save();

    // Redirect to the dedicated success page (PRG Pattern)
    res.redirect(`/bookings/${newBooking._id}`);
};
