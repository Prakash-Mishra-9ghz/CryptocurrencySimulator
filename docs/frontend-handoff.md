# Cryptocurrency Simulator — Frontend Handoff

**Status:** Frontend is structurally complete and calls real backend endpoints.
**No backend exists yet**, so every page currently shows its error/loading
state — that's expected, not a bug. As each endpoint below gets
implemented, its page will start working with **zero frontend changes**,
as long as the request/response shapes match what's documented here.

This doc describes what is actually built, not what was originally
proposed. If your implementation needs to differ from something here,
change it here too — don't let this doc drift from reality.

---

## 1. How to run the frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in `.env.local` to point at your local backend
(defaults to `http://localhost:5000/api`).

Every page will show a loading spinner then an error state until the
corresponding backend endpoint (below) is implemented and returns data in
the shape described.

---

## 2. Global pieces every page depends on

### Auth (`src/context/AuthContext.jsx`)
- JWT stored in `localStorage` under key `token`, user object under `user`.
- All authenticated API calls automatically attach `Authorization: Bearer <token>` (`src/services/apiClient.js`).
- Any API response with HTTP `401` automatically logs the user out and redirects to `/login`. **Your endpoints must return 401, not 403 or 500, for invalid/expired tokens**, or auto-logout won't trigger correctly.

### Base URL
All endpoints below are relative to `VITE_API_BASE_URL` (default `http://localhost:5000/api`). So `POST /auth/login` means `POST {VITE_API_BASE_URL}/auth/login`.

### Shared states
Every page uses the same three states — implement your endpoints assuming these are how the frontend reacts:
- **Loading:** shown while the request is in flight.
- **Error:** shown on any rejected request. The frontend reads `error.response.data.error` as the display message — **please return errors as `{ "error": "human readable message" }`**, not a bare string or a different key.
- **Empty:** shown when a request succeeds but returns an empty array (e.g. no transactions yet).

---

## 3. Route map

| Route | Page | Auth required |
|---|---|---|
| `/login` | Login | No |
| `/register` | Register | No |
| `/` | Dashboard | Yes |
| `/market` | Market (asset list) | Yes |
| `/market/:assetId` | Asset Detail + Trade | Yes |
| `/portfolio` | Portfolio | Yes |
| `/transactions` | Transaction History | Yes |
| `/profile` | Profile | Yes |

---

## 4. Page-by-page breakdown

### 4.1 Login (`/login`)
**File:** `src/pages/Login/Login.jsx`
**Displays:** Email + password form.
**User actions → endpoint:**

| Action | Endpoint | Request body | Expected response |
|---|---|---|---|
| Submit login form | `POST /auth/login` | `{ "email": string, "password": string }` | `{ "token": string, "user": { "username": string, "email": string, ... } }` |

On success: token/user saved via `AuthContext.login()`, redirect to the page the user originally tried to reach (or `/`).
On failure: shows `error.response.data.error` inline.

---

### 4.2 Register (`/register`)
**File:** `src/pages/Register/Register.jsx`
**Displays:** Username, email, password, confirm-password form.
**User actions → endpoint:**

| Action | Endpoint | Request body | Expected response |
|---|---|---|---|
| Submit register form | `POST /auth/register` | `{ "username": string, "email": string, "password": string }` | Success response (exact shape not yet critical — frontend just checks the call didn't throw) |

On success: shows a confirmation message, redirects to `/login` after ~1.2s.
Frontend validates passwords match client-side before submitting; **also validate server-side** (never trust client validation alone, per project security rules).

---

### 4.3 Dashboard (`/`)
**File:** `src/pages/Dashboard/Dashboard.jsx`
**Displays:** Portfolio summary cards, a market snapshot list, recent transactions.
**Endpoints hit on page load (all three fire independently, each with its own loading/error state):**

| Purpose | Endpoint | Response shape used |
|---|---|---|
| Portfolio summary | `GET /portfolio` | `{ "totalValue": number, "availableCash": number, "totalPnl": number, "totalPnlPercent": number, "holdings": [...] }` |
| Market snapshot | `GET /market/assets` | `[{ "assetId": string, "symbol": string, "name": string, "priceInr": number, "change24h": number }]` |
| Recent transactions | `GET /transactions?limit=5` | `[{ "id": string, "type": "BUY"\|"SELL", "quantity": number, "symbol": string, "executionPrice": number, ... }]` (frontend currently just displays whatever array comes back — a `limit` query param is a nice-to-have, not required for MVP) |

No write actions on this page — links out to Market/Transactions for those.

---

### 4.4 Market (`/market`)
**File:** `src/pages/Market/Market.jsx`
**Displays:** Table of all 6 supported assets (BTC, ETH, BNB, SOL, XRP, DOGE) with price and 24h change.

| Purpose | Endpoint | Response shape |
|---|---|---|
| Asset list | `GET /market/assets` | `[{ "assetId": string, "symbol": string, "name": string, "priceInr": number, "change24h": number }]` |

**`assetId` must be a stable identifier** the frontend can put directly into the URL (`/market/:assetId`) and pass back on `GET /market/assets/:id` — e.g. `"bitcoin"` (CoinGecko's own id) is a reasonable choice since the backend already talks to CoinGecko.

Each row links to `/market/:assetId` (Trade action).

---

### 4.5 Asset Detail + Trade (`/market/:assetId`)
**File:** `src/pages/AssetDetail/AssetDetail.jsx` + `src/components/trading/TradeForm.jsx`
**This is the core trading page.** Displays asset name/symbol/price/24h change, then a BUY/SELL form.

| Purpose | Endpoint | Request | Response |
|---|---|---|---|
| Load asset detail | `GET /market/assets/:id` | — | `{ "assetId": string, "symbol": string, "name": string, "priceInr": number, "change24h": number }` |
| Price history (chart) | `GET /market/assets/:id/history?days=1\|7\|30` | — | `[{ "timestamp": number (ms epoch), "priceInr": number }]` — added in Phase 9 |
| Execute BUY | `POST /trades/buy` | `{ "assetId": string, "quantity": number }` | `{ "transaction": { "executionPrice": number, ... }, ... }` (see note below) |
| Execute SELL | `POST /trades/sell` | `{ "assetId": string, "quantity": number }` | Same shape as BUY |

**Important behavior the frontend already implements:** the "estimated value" shown before submit is calculated client-side from the last-loaded price purely as a convenience preview. It is **never** treated as authoritative. After a successful BUY/SELL, the frontend re-fetches the asset (and relies on you to have updated wallet/holdings server-side) rather than trusting any client-side math. Your backend response must include at least `transaction.executionPrice` so the success message can display it.

**Validation the backend must enforce (frontend does basic checks but backend is the real gate, per security rules):** quantity > 0, sufficient cash (BUY), sufficient holdings (SELL), valid `assetId`. Return errors as `{ "error": "..." }` with an appropriate 4xx status so they display correctly.

---

### 4.6 Portfolio (`/portfolio`)
**File:** `src/pages/Portfolio/Portfolio.jsx`
**Displays:** Summary cards (total value, cash, P&L) + holdings table.

| Purpose | Endpoint | Response shape |
|---|---|---|
| Portfolio + holdings | `GET /portfolio` | `{ "totalValue": number, "availableCash": number, "totalPnl": number, "totalPnlPercent": number, "holdings": [{ "assetId": string, "symbol": string, "quantity": number, "avgCost": number, "currentPrice": number, "marketValue": number, "unrealizedPnl": number, "allocationPercent": number }] }` |

`avgCost` must be the **Weighted Average Cost** as defined in the architecture decisions doc — not FIFO, not last-purchase price.
Empty `holdings` array → frontend shows an empty state, not an error. Don't return an error for "no holdings yet."

---

### 4.7 Transaction History (`/transactions`)
**File:** `src/pages/Transactions/Transactions.jsx`
**Displays:** Full trade history table.

| Purpose | Endpoint | Response shape |
|---|---|---|
| Transaction list | `GET /transactions` | `[{ "id": string, "timestamp": ISO8601 string, "type": "BUY"\|"SELL", "symbol": string, "quantity": number, "executionPrice": number, "tradeValue": number, "status": string }]` |

Frontend sorts/displays whatever order the array comes back in — **return newest-first** unless we agree otherwise, since that's the more useful default for a history view.

---

### 4.8 Profile (`/profile`)
**File:** `src/pages/Profile/Profile.jsx`
**Displays:** Username/email from the `user` object already stored in `AuthContext` at login time. **Currently makes no API call of its own** — it just reads what `/auth/login` returned. If you want a dedicated `GET /users/me` later, tell me and I'll wire it in; not required for MVP.

---

## 5. Endpoint summary (all in one place)

| Method | Endpoint | Auth | Used by |
|---|---|---|---|
| POST | `/auth/register` | No | Register page |
| POST | `/auth/login` | No | Login page |
| GET | `/market/assets` | Yes | Dashboard, Market |
| GET | `/market/assets/:id` | Yes | Asset Detail |
| GET | `/market/assets/:id/history` | Yes | Asset Detail (price chart) |
| GET | `/wallet` | Yes | AppLayout (virtual cash indicator, shown on every authenticated page) |
| GET | `/portfolio` | Yes | Dashboard, Portfolio |
| GET | `/transactions` | Yes | Dashboard, Transactions |
| POST | `/trades/buy` | Yes | Asset Detail (Trade form) |
| POST | `/trades/sell` | Yes | Asset Detail (Trade form) |
| GET | `/ledger/verify` | Yes | Transactions (integrity indicator) |
| POST | `/insights/ask` | Yes | Portfolio (Ask your portfolio widget) |

Every "Yes" (auth-required) endpoint must reject requests without a valid `Authorization: Bearer <token>` header with **HTTP 401** — the frontend's auto-logout depends on this exact status code.

---

## 6. What's NOT built yet / explicitly out of scope

- No mock data anywhere — every page hits a real endpoint and will show an error state until that endpoint exists. This is intentional (team decision: avoid a mock→real migration step).
- No charts yet (planned for after the core pages are validated against real data).
- No pagination on transactions.
- No fees, slippage, or realized P&L — matches the project's MVP scope.

## 7. If your backend needs a different shape than documented here

Don't silently change your response format to something else. Either:
1. Match the shape above exactly, or
2. Tell whoever owns the frontend (currently me) so the corresponding service file (`src/services/*.js`) gets updated to match — that's a one-file change, not a page rewrite.
