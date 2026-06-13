const mongoose = require("mongoose");
const config = require("./env");

async function connectDB() {
  try {
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error("Start MongoDB with: docker compose up -d");
    process.exit(1);
  }
}

module.exports = { connectDB };
