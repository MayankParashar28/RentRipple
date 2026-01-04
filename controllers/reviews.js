const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    // Save review and update listing in parallel for speed
    await Promise.all([
        newReview.save(),
        Listing.findByIdAndUpdate(id, { $push: { reviews: newReview._id } })
    ]);

    req.flash('success', 'Listing reviewed successfully!');
    res.redirect(`/${id}`);
};

module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/${id}`);
};
