const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        address: Joi.string().allow("", null),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            url: Joi.string().allow("", null).default(""),
            filename: Joi.string().allow("", null).default("")
        }),
        type: Joi.string().allow("", null),
        category: Joi.string().allow("", null),
        guests: Joi.number().min(1).default(1),
        bedrooms: Joi.number().min(0).default(1),
        bathrooms: Joi.number().min(0).default(1),
        checkin: Joi.string().allow("", null),
        checkout: Joi.string().allow("", null),
        amenities: Joi.array().items(Joi.string()).default([]),
        rules: Joi.string().allow("", null),
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required()
});

module.exports.experienceSchema = Joi.object({
    experience: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().allow("", null),
        location: Joi.string().required(),
        price: Joi.number().required().min(0),
    }).required()
});
