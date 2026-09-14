const Wallet = require("../models/Wallet");

async function getWallet(req, res) {
  const wallet = await Wallet.findOne({ userId: req.userId });

  if (!wallet) {
    return res.status(404).json({ error: "Wallet not found for this user." });
  }

  return res.json({ virtualCash: wallet.virtualCash });
}

module.exports = { getWallet };
