import apiClient from "./apiClient";

/**
 * GET /api/transactions
 * Optional query params for filtering/pagination once backend implements them.
 * Expected response: array of
 * { id, timestamp, assetId, symbol, type, quantity, executionPrice, tradeValue, status }
 */
export function getTransactions(params = {}) {
  return apiClient.get("/transactions", { params }).then((res) => res.data);
}
