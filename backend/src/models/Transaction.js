const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assetId: { type: String, required: true },
    symbol: { type: String, required: true },
    type: { type: String, enum: ["BUY", "SELL"], required: true },
    quantity: { type: Number, required: true, min: 0 },
    executionPrice: { type: Number, required: true, min: 0 },
    totalValue: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["COMPLETED", "FAILED"], default: "COMPLETED" },
    timestamp: { type: Date, default: Date.now },

    // Hash-chain fields (see src/utils/hashChain.js). Each transaction
    // links to the one before it system-wide, making the ledger
    // tamper-evident — NOT a distributed blockchain, just a real,
    // working demonstration of the same integrity concept.
    sequenceNumber: { type: Number, required: true },
    previousHash: { type: String, required: true },
    hash: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
