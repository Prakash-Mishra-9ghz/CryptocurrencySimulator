# API Documentation

Base URL: `https://<your-deployed-backend>/api` (or `http://localhost:5000/api` locally)

All authenticated endpoints require header: `Authorization: Bearer <jwt>`
Errors are returned as `{ "error": "message" }` with an appropriate HTTP status code.

---

## Auth

### `POST /auth/register`
Creates a user account and an initial wallet with the approved starting balance (₹10,00,000).

**Body:** `{ "username": string, "email": string, "password": string (min 8 chars) }`
**Success:** `201` — `{ "message": "Account created.", "user": { "id", "username", "email" } }`
**Errors:** `400` missing/invalid fields · `409` email already registered

### `POST /auth/login`
**Body:** `{ "email": string, "password": string }`
**Success:** `200` — `{ "token": string, "user": { "id", "username", "email" } }`
**Errors:** `400` missing fields · `401` invalid credentials

---

## Wallet

### `GET /wallet` *(auth required)*
**Success:** `200` — `{ "virtualCash": number }`
**Errors:** `401` unauthenticated · `404` wallet not found

---

## Market Data

### `GET /market/assets` *(auth required)*
Returns all 6 supported assets with live INR price (30s server-side cache).
**Success:** `200` — `[{ "assetId", "symbol", "name", "priceInr", "change24h" }]`
**Errors:** `503` market data provider unavailable/timeout/rate-limited

### `GET /market/assets/:id` *(auth required)*
**Success:** `200` — single asset object, same shape as above
**Errors:** `404` unsupported asset · `503` provider error

### `GET /market/assets/:id/history?days=1|7|30` *(auth required)*
Historical price series (5-minute cache).
**Success:** `200` — `[{ "timestamp": number (ms epoch), "priceInr": number }]`
**Errors:** `400` invalid `days` value · `404` unsupported asset · `503` provider error

---

## Trading

### `POST /trades/buy` *(auth required)*
Validates, fetches a **fresh** (uncached) price, executes atomically.
**Body:** `{ "assetId": string, "quantity": number }`
**Success:** `201` — `{ "transaction", "wallet", "holding" }`
**Errors:** `400` invalid quantity/asset · `404` wallet not found · `409` insufficient cash · `500` if DB doesn't support transactions

### `POST /trades/sell` *(auth required)*
**Body:** `{ "assetId": string, "quantity": number }`
**Success:** `201` — `{ "transaction", "wallet", "holding" }` (`holding` is `null` if fully sold)
**Errors:** same pattern as BUY, `409` insufficient holdings instead of cash

---

## Portfolio

### `GET /portfolio` *(auth required)*
Computed live from current holdings + cached market prices.
**Success:** `200` — `{ "totalValue", "availableCash", "totalPnl", "totalPnlPercent", "holdings": [{ "assetId", "symbol", "quantity", "avgCost", "currentPrice", "marketValue", "unrealizedPnl", "allocationPercent" }] }`

---

## Transactions

### `GET /transactions?limit=n` *(auth required, `limit` optional)*
Newest-first.
**Success:** `200` — `[{ "id", "timestamp", "assetId", "symbol", "type", "quantity", "executionPrice", "tradeValue", "status" }]`

---

## Ledger Integrity (Hash Chain)

### `GET /ledger/verify` *(auth required)*
Recomputes the entire transaction hash chain from scratch and reports whether it's intact. This is a **hash-chained ledger**, not a distributed blockchain — a real, working demonstration of tamper-evidence, not a claim of decentralized consensus.
**Success:** `200` — `{ "valid": boolean, "totalTransactions": number, "brokenAtSequence": number|null }`

---

## AI Portfolio Insights

### `POST /insights/ask` *(auth required)*
Answers a free-form question about the user's own portfolio, grounded in their real data (see `docs/ai-insights.md`). Requires `GROQ_API_KEY` configured server-side.
**Body:** `{ "question": string }`
**Success:** `200` — `{ "answer": string, "model": string }`
**Errors:** `400` empty/missing question · `503` AI Insights not configured · `502` provider request failed

---

## Health

### `GET /health` *(no auth)*
**Success:** `200` — `{ "status": "ok", "service": "crypto-simulator-backend", "timestamp" }`
