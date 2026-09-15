/**
 * The 6 supported assets (approved architecture decision #4).
 * assetId is CoinGecko's own id — used directly in CoinGecko API calls
 * and as the stable identifier the frontend puts in the URL
 * (/market/:assetId), per docs/frontend-handoff.md Section 4.4.
 */
const SUPPORTED_ASSETS = [
  { assetId: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { assetId: "ethereum", symbol: "ETH", name: "Ethereum" },
  { assetId: "binancecoin", symbol: "BNB", name: "BNB" },
  { assetId: "solana", symbol: "SOL", name: "Solana" },
  { assetId: "ripple", symbol: "XRP", name: "XRP" },
  { assetId: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
];

function getSupportedAssetIds() {
  return SUPPORTED_ASSETS.map((a) => a.assetId);
}

function findSupportedAsset(assetId) {
  return SUPPORTED_ASSETS.find((a) => a.assetId === assetId) || null;
}

function isSupportedAsset(assetId) {
  return findSupportedAsset(assetId) !== null;
}

module.exports = { SUPPORTED_ASSETS, getSupportedAssetIds, findSupportedAsset, isSupportedAsset };
