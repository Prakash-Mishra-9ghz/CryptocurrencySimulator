import apiClient from "./apiClient";

/**
 * GET /api/market/assets
 * Expected response: array of
 * { assetId, symbol, name, priceInr, change24h }
 */
export function getAssets() {
  return apiClient.get("/market/assets").then((res) => res.data);
}

/**
 * GET /api/market/assets/:id
 */
export function getAssetById(assetId) {
  return apiClient.get(`/market/assets/${assetId}`).then((res) => res.data);
}
