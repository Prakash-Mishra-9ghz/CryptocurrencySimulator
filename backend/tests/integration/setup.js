const mongoose = require("mongoose");

/**
 * Integration tests need a real MongoDB connection (Atlas or local
 * replica set — trade tests use transactions, which require one).
 * Set TEST_MONGODB_URI before running `npm run test:integration`.
 * NEVER point this at your real/dev database — these tests wipe
 * collections between runs.
 */
async function connectTestDB() {
  const uri = process.env.TEST_MONGODB_URI;
  if (!uri) {
    throw new Error(
      "TEST_MONGODB_URI is not set. Integration tests require a dedicated test database " +
        "(see backend/tests/README.md)."
    );
  }
  await mongoose.connect(uri);
}

async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

async function disconnectTestDB() {
  await mongoose.connection.close();
}

module.exports = { connectTestDB, clearTestDB, disconnectTestDB };
