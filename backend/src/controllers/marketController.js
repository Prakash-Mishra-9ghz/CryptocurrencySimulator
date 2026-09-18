const { getCachedAssetPrices, getPriceHistory } = require("../services/marketDataService");
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

const ALLOWED_DAYS = [1, 7, 30];

async function getAssetHistory(req, res) {
  const { id } = req.params;
  const days = Number(req.query.days) || 7;

  if (!isSupportedAsset(id)) {
    return res.status(404).json({ error: "Unsupported or unknown asset." });
  }
  if (!ALLOWED_DAYS.includes(days)) {
    return res.status(400).json({ error: `days must be one of: ${ALLOWED_DAYS.join(", ")}` });
  }

  try {
    const history = await getPriceHistory(id, days);
    return res.json(history);
  } catch (err) {
    return res.status(503).json({ error: err.message });
  }
}

module.exports = { getAssets, getAssetById, getAssetHistory };
