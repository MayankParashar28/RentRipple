if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const mongoose = require("mongoose");
const initdata = require("../init/data");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.MONGO_URL;

// Function to connect to the database
async function connectDB() {
    try {
        await mongoose.connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000
        });
        console.log("MongoDB connected");

        // Initialize the database (insert data)
        await initdb();

        // Close the connection after the operations are complete
        await mongoose.disconnect();
        console.log("MongoDB disconnected");
    } catch (err) {
        console.error("Connection error:", err);
    }
}

// Function to initialize the database with data
const initdb = async () => {
    try {
        // Delete existing listings
        await Listing.deleteMany();

        // Ensure geometry.type and category type is set for each data entry
        initdata.data = initdata.data.map((data) => {
            if (!data.geometry || !data.geometry.type) {
                // console.warn(`Missing geometry.type for entry: ${JSON.stringify(data)}`); // Silence detailed logs
                data.geometry = data.geometry || {};
                data.geometry.type = "Point";
            }

            // Assign category based on keywords
            const name = data.name.toLowerCase();
            const desc = data.description.toLowerCase();
            let type = "City"; // Default

            if (name.includes("beach") || desc.includes("beach") || name.includes("ocean") || name.includes("island")) {
                type = "Beach";
            } else if (name.includes("pool") || name.includes("villa") || desc.includes("pool")) {
                type = "Pools";
            } else if (name.includes("mountain") || name.includes("cabin") || name.includes("ski") || name.includes("chalet")) {
                type = "Mountain";
            } else if (name.includes("castle")) {
                type = "Castle";
            } else if (name.includes("camp") || name.includes("treehouse") || name.includes("lodge") || name.includes("nature")) {
                type = "Camping";
            } else if (name.includes("farm") || name.includes("cottage")) {
                type = "Farms";
            } else if (name.includes("arctic") || name.includes("igloo") || name.includes("snow")) {
                type = "Arctic";
            } else if (name.includes("desert")) {
                type = "Deserts";
            }

            // Correction for Villa falling into Pools or Beach
            if (name.includes("villa") && !type) type = "Villa";

            return {
                ...data,
                owner: "685c34edbe022a3252689bb9",
                type: type
            };
        });

        console.log("Data prepared for insertion");

        // Insert the modified data into the Listing collection
        await Listing.insertMany(initdata.data);
        console.log("Data inserted/updated");
    } catch (err) {
        console.error("Error initializing database:", err);
    }
};


// Ensure database connection is established before initializing data
connectDB();
