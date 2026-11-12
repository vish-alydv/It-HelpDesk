const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const connectMongoDB = async () => {
    try {
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/helpdesk_nosql";
        await mongoose.connect(uri);
        console.log("MongoDB connected successfully to:", uri);
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
};

module.exports = connectMongoDB;