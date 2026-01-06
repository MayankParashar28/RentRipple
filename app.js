if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const Listing = require("./models/listing")
const Review = require('./models/review');
const Experience = require('./models/experience');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const multer = require('multer')
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const { isLoggedIn, savedRedirectUrl, isOwner, isReviewAuthor } = require('./middleware/index.js');
const engine = require('ejs-mate');
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeoCoding({ accessToken: mapToken })
const moment = require('moment');


const port = 3000;

const { cloudinary, storage } = require('./config/cloudConfig.js');
const { access } = require('fs');
const upload = multer({ storage });

const dbUrl = process.env.MONGO_URL;

// Connect to MongoDB
mongoose.connect(dbUrl)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("Connection error:", err));

// Set up view engine
app.set('view engine', 'ejs');
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


const sessionOptions = {
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.locals.moment = moment;
app.use((req, res, next) => {
    res.locals.curruser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.mapToken = mapToken;
    res.locals.search = req.query.search;
    res.locals.wishlist = req.user ? req.user.wishlist : [];
    next();
});


const listingController = require("./controllers/listings.js");
const wrapAsync = require("./utils/wrapAsync.js");

const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/users.js");
const bookingRouter = require("./routes/bookings.js");

// Routes Registration
app.use("/", userRouter);
app.use("/bookings", bookingRouter);
// app.use("/listings", listingRouter); // We will mount specific resource routes carefully or handle index explicitly

// Specific Resource Routes that need to remain under /listings for ID, New, Edit
// To avoid conflict with root, we can keep using listingRouter but remove the index route from it, OR just override root.
// Simpler: Mount listingRouter at /listings for everything except index?
// Actually listingRouter has '/' mapped to index. 
// If we map listingRouter to '/listings', then '/listings/' is index.
// PROPOSAL:
// 1. App root "/" handles index.
// 2. "/listings" redirects to "/"
// 3. "/listings/new", "/listings/:id" etc remain.

app.get("/", wrapAsync(listingController.index));

app.get("/listings", (req, res) => {
    res.redirect("/");
});

// Mount other listing routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);


// Start server
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
