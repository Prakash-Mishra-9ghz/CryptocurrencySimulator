const mongoose = require("mongoose");

const ledgerStateSchema = new mongoose.Schema({
  _id: { type: String, default: "GLOBAL" }, // single global chain across all users
  lastHash: { type: String, required: true },
  length: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("LedgerState", ledgerStateSchema);
