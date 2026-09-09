# Cryptocurrency Simulator

Final-year B.Tech CSE project — a risk-free cryptocurrency trading simulator.
Virtual money only. No real trades, no real crypto custody, no blockchain
implementation.

- `docs/architecture-decisions.md` — approved Phase 0 technical decisions
- `docs/frontend-handoff.md` — **start here if you're building the backend.** Page-by-page breakdown of the frontend, exact endpoints it calls, and the exact request/response shapes it expects.

## Current status

**Frontend: structurally complete.** All 8 pages built, routed, and calling
real backend endpoints (no mock data anywhere). Since no backend exists
yet, every page currently shows its loading → error state — that's
expected. As each endpoint is implemented to match `docs/frontend-handoff.md`,
its page starts working with no frontend changes needed.

**Backend: skeleton only** (`backend/`). Server boots, DB connection code
exists, health check route works. No auth, no market data, no trading
logic implemented yet — this is what the team builds next, using
`docs/frontend-handoff.md` as the contract.

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

## Contribution Guide

1. Never push directly to `main`.
2. Create a branch: `git checkout -b feature/auth-endpoints`
3. Make your changes, commit: `git add . && git commit -m "Add login endpoint"`
4. Push your branch: `git push origin feature/auth-endpoints`
5. Open a Pull Request on GitHub into `main`.
6. Wait for CI to pass (green check) — a red X means something broke; fix and push again.
7. Get it reviewed/merged — don't merge your own PR without review if possible.

Branch naming: `feature/<short-name>`, `fix/<short-name>`.