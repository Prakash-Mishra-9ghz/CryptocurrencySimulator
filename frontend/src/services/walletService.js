import apiClient from "./apiClient";

/**
 * GET /api/wallet
 * Expected response: { virtualCash, ... }
 */
export function getWallet() {
  return apiClient.get("/wallet").then((res) => res.data);
}
