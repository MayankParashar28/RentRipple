const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
}

module.exports.savedRedirectUrl = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).select("owner");
    if (!listing || !listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    try {
        const review = await Review.findById(reviewId).select("author");

        if (!review) {
            req.flash("error", "Review not found!");
            return res.redirect(`/listings/${id}`);
        }

        if (!review.author.equals(req.user._id)) {
            req.flash("error", "You are not authorized to do that!");
            return res.redirect(`/listings/${id}`);
        }

        // Proceed if the user is the author
        next();
    } catch (error) {
        console.error("Authorization error:", error);
        req.flash("error", "Something went wrong!");
        if (id) {
            return res.redirect(`/listings/${id}`);
        } else {
            return res.redirect('/listings');
        }
    }
};

const { listingSchema, reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");

module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};
