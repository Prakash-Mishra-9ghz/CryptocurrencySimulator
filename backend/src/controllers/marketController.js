const { getCachedAssetPrices } = require("../services/marketDataService");
const { isSupportedAsset } = require("../config/supportedAssets");

async function getAssets(req, res) {
  try {
    const assets = await getCachedAssetPrices();
    return res.json(assets);
  } catch (err) {
    return res.status(503).json({ error: err.message });
  }
}

async function getAssetById(req, res) {
  const { id } = req.params;

  if (!isSupportedAsset(id)) {
    return res.status(404).json({ error: "Unsupported or unknown asset." });
  }

  try {
    const assets = await getCachedAssetPrices();
    const asset = assets.find((a) => a.assetId === id);
    return res.json(asset);
  } catch (err) {
    return res.status(503).json({ error: err.message });
  }
}

module.exports = { getAssets, getAssetById };
