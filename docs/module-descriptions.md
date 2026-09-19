# Module Descriptions

Maps to the original spec's Major Modules table (Section 13). Describes
what is actually implemented, with the real file paths.

## Authentication & User Management
**Files:** `src/models/User.js`, `src/controllers/authController.js`, `src/routes/auth.routes.js`, `src/utils/auth.js`, `src/middleware/requireAuth.js`
Registration hashes passwords with bcrypt (never stored plain-text), issues JWTs on login, and `requireAuth` middleware protects all routes that need an authenticated user, returning 401 on missing/invalid/expired tokens.

## Market Data
**Files:** `src/services/marketDataService.js`, `src/controllers/marketController.js`, `src/config/supportedAssets.js`
Fetches live prices for all 6 supported assets from CoinGecko in a single batched call, cached in-memory for 30 seconds (dashboard/list reads) or 5 minutes (price history). A separate always-fresh path bypasses the cache for trade execution. Handles timeout, rate-limiting, and incomplete-response failures explicitly.

## Trading Engine
**Files:** `src/services/tradingEngine.js`, `src/utils/validators.js`, `src/utils/calculations.js`, `src/controllers/tradeController.js`
Validates quantity/asset, fetches a fresh execution price, and applies Weighted Average Cost on BUY. Every trade's wallet + holding + transaction writes are wrapped in a single MongoDB session transaction — a failed trade cannot partially update the account (requires a MongoDB replica set, e.g. Atlas).

## Wallet
**Files:** `src/models/Wallet.js`, `src/controllers/walletController.js`
Tracks each user's virtual cash balance. Created automatically at registration with the approved starting balance.

## Portfolio
**Files:** `src/services/portfolioService.js`, `src/controllers/portfolioController.js`
Computes live portfolio valuation and unrealized P&L per holding using the formulas in `src/utils/calculations.js` — the single source of truth shared with the trading engine, so the two can never disagree.

## Transaction Ledger
**Files:** `src/models/Transaction.js`, `src/controllers/transactionController.js`
Immutable record of every completed trade. Listed newest-first, with an optional `limit` for the dashboard's recent-activity widget.

## Hash-Chained Ledger (Optional Phase 15)
**Files:** `src/utils/hashChain.js`, `src/models/LedgerState.js`, `src/services/ledgerService.js`, `src/controllers/ledgerController.js`
Each transaction cryptographically links to the one before it (SHA-256), atomically within the same DB transaction as the trade itself. `GET /api/ledger/verify` recomputes the whole chain and reports tampering. See `docs/blockchain-module.md` for full design and an honest scoping of what this is/isn't.

## AI Portfolio Insights (Optional differentiator)
**Files:** `src/services/aiInsightsService.js`, `src/controllers/insightsController.js`, `src/routes/insights.routes.js`
Free-form question answering grounded in the user's real portfolio/transaction data, via Groq's free LLM API. See `docs/ai-insights.md` for design, setup, and honest limitations (not financial advice, model-name caveat).

## REST API Layer
**Files:** `src/routes/*.routes.js`, `src/app.js`
All routes mounted under `/api`. See `docs/api-documentation.md` for the full contract.

## Database Layer
**Files:** `src/models/*.js`, `src/config/db.js`
Mongoose schemas for User, Wallet, Holding, Transaction. Connection exits the process on failure rather than running in a half-connected state.

## Frontend
**Files:** `frontend/src/pages/*`, `frontend/src/services/*`, `frontend/src/context/AuthContext.jsx`
8 pages (Login, Register, Dashboard, Market, Asset Detail, Portfolio, Transactions, Profile), each calling its real backend endpoint through a dedicated service file — no mock data anywhere. Auth state in React Context, JWT persisted in localStorage, auto-logout on any 401.

## Testing & Deployment
**Files:** `backend/tests/`, `backend/Dockerfile`, `backend/render.yaml`, `backend/railway.json`
32 automated unit tests (calculations, validation, auth, config). Integration tests written for the full HTTP flow (require a live test database + internet, documented in `backend/tests/README.md`). Deployed via Back4App Containers (backend) and Vercel (frontend) — see `docs/deployment.md`.
