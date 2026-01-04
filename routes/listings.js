const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

// Specific redirect for legacy /listings path
router.get("/listings", (req, res) => {
    res.redirect("/");
});

const listingController = require("../controllers/listings.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
// Lazy load multer implementation
let _upload;
const getUpload = () => {
    if (!_upload) {
        console.log("DEBUG: Lazy loading Multer and Cloudinary...");
        const multer = require('multer');
        const { storage } = require('../config/cloudConfig.js');
        _upload = multer({ storage });
    }
    return _upload;
};

// Wrapper for upload.single that initializes multer on first request
const uploadSingle = (fieldName) => (req, res, next) => {
    getUpload().single(fieldName)(req, res, next);
};

// Index and Create routes
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        uploadSingle('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing)
    );

// New route 
router.get("/new", isLoggedIn, listingController.renderNewForm);
// Search Suggestions
router.get("/search/suggestions", wrapAsync(listingController.searchSuggestions));

// Show, Update, Delete routes
router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        uploadSingle('listing[image]'),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing)
    );

// Booking Route
router.get("/:id/checkout", isLoggedIn, wrapAsync(listingController.renderCheckout));
router.post("/:id/book", isLoggedIn, wrapAsync(listingController.createBooking));

// Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
