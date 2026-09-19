# Cryptocurrency Simulator

Final-year B.Tech CSE project — a risk-free cryptocurrency trading simulator.
Virtual money only. No real trades, no real crypto custody, no blockchain
implementation.

- `docs/architecture-decisions.md` — approved Phase 0 technical decisions
- `docs/frontend-handoff.md` — page-by-page breakdown of the frontend and the exact endpoints/shapes it expects
- `docs/api-documentation.md` — formal API reference
- `docs/diagrams.md` — architecture, use-case, DFD, ER, and BUY/SELL sequence diagrams (Mermaid)
- `docs/module-descriptions.md` — what each backend/frontend module does, with real file paths
- `docs/testing-results.md` — real captured test output + manual test checklist
- `docs/limitations-and-future-scope.md` — honest accounting of what's built vs. proposed
- `docs/blockchain-module.md` — hash-chained transaction ledger design and honest scoping
- `docs/ai-insights.md` — AI Portfolio Insights (Groq) design, setup, and limitations
- `docs/deployment.md` — how to deploy the backend (free options) and frontend (Vercel)
- `backend/tests/README.md` — how to run unit and integration tests

## Current status

**Deployed and live.** Backend on Back4App Containers, frontend on Vercel — tested end-to-end against production, matching local behavior.

## Live Demo

- Frontend: frontend-1efvq3lbu-crypto-aad0.vercel.app

## Project history

Frontend: all 8 pages, charts, real endpoint calls, no mock data.
Backend: all core endpoints implemented and unit-tested (auth, wallet, market data + price history, trading engine with atomic transactions and Weighted Average Cost, portfolio/P&L, transaction history). 32 unit tests passing (`npm test` in `backend/`).

## Stack

- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Market data: CoinGecko API
- Auth: JWT + bcrypt

## Running the frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open the printed local URL. You'll see the Login page. Every other page
will show error states until the backend endpoints exist — this is
expected, not a bug. See `docs/frontend-handoff.md` for exactly what each
endpoint needs to return.

## Running the backend skeleton

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI (local Mongo or Atlas free tier) and JWT_SECRET
npm install
npm run dev
```

Verify: `curl http://localhost:5000/api/health`

## Project structure

```
crypto-simulator/
├── backend/       Express REST API (skeleton — health check only)
├── frontend/      React app (Vite) — fully built, real endpoint calls
├── docs/
│   ├── architecture-decisions.md   Approved Phase 0 decisions
│   └── frontend-handoff.md         Endpoint contract for backend team
└── README.md
```

## For team members implementing backend endpoints

1. Read `docs/frontend-handoff.md` — find the endpoint you're building.
2. Match the request/response shape exactly (especially field names and the `{ "error": "..." }` error format — the frontend depends on this).
3. Run the frontend locally against your endpoint to confirm the corresponding page goes from an error state to showing real data.
4. If you genuinely need a different shape, say so — don't silently diverge from the doc.
