import apiClient from "./apiClient";

/**
 * POST /api/trades/buy
 * Body: { assetId, quantity }
 * Expected response: { success, transaction, wallet, portfolio }
 *
 * IMPORTANT (spec Section 17): the frontend's estimated trade value is
 * never authoritative. The backend fetches the real execution price and
 * this response is the source of truth. Callers must refresh wallet and
 * portfolio state from this response (or a follow-up fetch), not from
 * whatever estimate was shown before submit.
 */
export function buyAsset({ assetId, quantity }) {
  return apiClient.post("/trades/buy", { assetId, quantity }).then((res) => res.data);
}

/**
 * POST /api/trades/sell
 * Body: { assetId, quantity }
 * Same authoritative-response rule as buyAsset (spec Section 18).
 */
export function sellAsset({ assetId, quantity }) {
  return apiClient.post("/trades/sell", { assetId, quantity }).then((res) => res.data);
}
