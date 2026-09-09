import apiClient from "./apiClient";

/**
 * GET /api/portfolio
 * Expected response: { totalValue, availableCash, totalPnl, totalPnlPercent, holdings: [...] }
 * Each holding: { assetId, symbol, quantity, avgCost, currentPrice, marketValue, unrealizedPnl, allocationPercent }
 */
export function getPortfolio() {
  return apiClient.get("/portfolio").then((res) => res.data);
}
