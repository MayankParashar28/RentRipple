const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    address: String,
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    type: String,
    guests: Number,
    bedrooms: Number,
    bathrooms: Number,
    checkin: String,
    checkout: String,
    amenities: [String],
    category: {
        type: String,
        enum: ['Beach', 'Mountains', 'Cities', 'Castles', 'Pools', 'Camping', 'Farms', 'Arctic', 'Deserts'],
        required: false
    },
    rules: String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
            type: String,  // type is a field within geometry
            enum: ['Point'],  // Enum to restrict to "Point"
            required: false,
        },
        coordinates: {
            type: [Number],  // Array of numbers [longitude, latitude]
            required: false,
        },
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

listingSchema.virtual('averageRating').get(function () {
    if (!this.reviews || this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / this.reviews.length).toFixed(1);
});

listingSchema.virtual('popUpMarkup').get(function () {
    return `
    <strong><a href="/listings/${this._id}" style="text-decoration: none; color: black;">${this.name}</a></strong>
    <p>${this.location}</p>`
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
