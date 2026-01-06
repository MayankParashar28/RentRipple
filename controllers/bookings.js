const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");


module.exports.index = async (req, res) => {
    const bookings = await Booking.find({ booker: req.user._id })
        .populate('listing')
        .sort({ createdAt: -1 }); // Newest first
    res.render("bookings/index", { bookings });
};

module.exports.renderBooking = async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate({
        path: 'listing',
        populate: { path: 'owner' }
    });

    if (!booking) {
        req.flash('error', 'Booking not found!');
        return res.redirect('/');
    }


    res.render("bookings/success", { booking });
};

module.exports.hostIndex = async (req, res) => {
    // 1. Find all listings owned by the current user
    const listings = await Listing.find({ owner: req.user._id });
    const listingIds = listings.map(l => l._id);

    // 2. Find all bookings for those listings
    const bookings = await Booking.find({ listing: { $in: listingIds } })
        .populate('listing')
        .populate('booker')
        .sort({ createdAt: -1 }); // Newest first

    res.render("bookings/host", { bookings });
};
