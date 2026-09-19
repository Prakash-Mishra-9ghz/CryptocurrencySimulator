import apiClient from "./apiClient";

/**
 * GET /api/ledger/verify
 * Recomputes the entire hash chain and reports whether it's intact.
 * Expected response: { valid: boolean, totalTransactions: number, brokenAtSequence: number|null }
 */
export function verifyLedger() {
  return apiClient.get("/ledger/verify").then((res) => res.data);
}
