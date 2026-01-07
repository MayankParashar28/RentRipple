const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Welcome to RentRipple!');
            res.redirect("/listings");
        });
    } catch (error) {
        req.flash('error', error.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

module.exports.login = async (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect(res.locals.returnTo || "/listings");
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye! Have a nice day!');
        res.redirect("/listings");
    });
};

const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

module.exports.renderDashboard = async (req, res) => {
    // 1. Fetch Listings and My Trips in parallel
    const [listings, myTrips] = await Promise.all([
        Listing.find({ owner: req.user._id }),
        Booking.find({ booker: req.user._id }).populate('listing').sort({ createdAt: -1 })
    ]);

    // 2. Fetch Incoming Bookings (depends on listings)
    const incomingBookings = await Booking.find({ listing: { $in: listings.map(l => l._id) } })
        .populate('listing')
        .populate('booker')
        .sort({ createdAt: -1 });

    res.render("users/dashboard", { listings, incomingBookings, myTrips });
};

module.exports.toggleWishlist = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    if (user.wishlist.includes(id)) {
        await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: id } });
        req.flash('success', 'Removed from wishlist!');
    } else {
        await User.findByIdAndUpdate(req.user._id, { $addToSet: { wishlist: id } });
        req.flash('success', 'Added to wishlist!');
    }
    res.redirect(req.get('referer') || "/listings");
};

module.exports.renderWishlist = async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.render("users/wishlist", { listings: user.wishlist });
};
