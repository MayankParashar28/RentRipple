const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
    console.error("CRITICAL: STRIPE_SECRET_KEY is missing from environment variables.");
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
