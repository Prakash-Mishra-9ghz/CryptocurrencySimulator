const mongoose = require("mongoose");

const holdingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assetId: { type: String, required: true },
    symbol: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    avgCost: { type: Number, required: true, min: 0 }, // Weighted Average Cost per unit
  },
  { timestamps: true }
);

// A user can only have one holding document per asset.
holdingSchema.index({ userId: 1, assetId: 1 }, { unique: true });

module.exports = mongoose.model("Holding", holdingSchema);
