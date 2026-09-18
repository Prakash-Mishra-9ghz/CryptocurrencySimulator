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

/**
 * GET /api/market/assets/:id/history?days=7
 * days must be one of 1, 7, 30.
 * Expected response: array of { timestamp: number (ms epoch), priceInr: number }
 */
export function getAssetHistory(assetId, days = 7) {
  return apiClient
    .get(`/market/assets/${assetId}/history`, { params: { days } })
    .then((res) => res.data);
}
