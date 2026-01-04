if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const dbUrl = process.env.MONGO_URL;

console.log("Testing connection to:", dbUrl ? dbUrl.replace(/:([^:@]+)@/, ":****@") : "UNDEFINED");

async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("SUCCESS: Connected to Cloud Database!");
        console.log("Connection State:", mongoose.connection.readyState);
        await mongoose.disconnect();
    } catch (err) {
        console.error("FAILURE: Could not connect.", err);
    }
}

main();
