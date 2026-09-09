const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the URI from environment variables.
 * Exits the process on failure so the app never runs in a
 * half-connected, silently-broken state (consistency requirement
 * from the project spec, Section 10).
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("MONGODB_URI is not set in the environment (.env file).");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
