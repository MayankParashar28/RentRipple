const Booking = require("../models/booking.js");

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
