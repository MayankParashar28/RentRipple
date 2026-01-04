const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/bookings.js");

// List User Bookings
router.get("/", isLoggedIn, wrapAsync(bookingController.index));

// Show Booking Confirmation
router.get("/:id", isLoggedIn, wrapAsync(bookingController.renderBooking));

module.exports = router;
