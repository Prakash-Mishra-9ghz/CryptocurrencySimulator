# Deployment Guide

Backend → a free Node host. Frontend → **Vercel** (free tier, no card).
None of the options below cost anything.

## Why this matters beyond just "going live"

Once the backend has a real public URL, that URL is exactly what a
future mobile app would call too — same endpoints, same JWT auth, no
backend changes needed. Deploying now is also what makes a mobile app
buildable later.

## 1. Production database (MongoDB Atlas)

You're likely already using Atlas for local dev — you can reuse the same
cluster, but create a **separate database** for production data (don't
mix it with your local testing data). Copy its connection string.

## 2. Deploy the backend

Four options — pick the one that fits, all genuinely free:

### Option A: Back4App Containers — Docker-based, no card, no time-boxed trial

[back4app.com](https://www.back4app.com) — free tier: 256MB RAM, 100GB transfer, 600 active hours/month, no credit card. Builds from the `backend/Dockerfile` already in this repo.

1. Push this repo to GitHub.
2. On Back4App: New App → Containers → connect your GitHub repo → set **Root Directory** to `backend` (so it finds `Dockerfile` there, not at the repo root).
3. Back4App detects the `Dockerfile` and builds automatically.
4. Add environment variables in the app settings: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=1d`, `COINGECKO_BASE_URL=https://api.coingecko.com/api/v3`, `MARKET_CACHE_TTL_SECONDS=30`, `STARTING_VIRTUAL_BALANCE_INR=1000000`, `CORS_ORIGIN` (leave blank for now).
5. Deploy. Back4App assigns a public URL. Test: `curl https://<your-back4app-url>/api/health`
6. **Note:** Back4App injects its own `PORT` at runtime — `src/server.js` already reads `process.env.PORT`, so no code change is needed.

### Option B: Bonto — genuinely free forever, no card, no trial credit

[bonto.dev](https://bonto.dev) is purpose-built for Express + MongoDB
apps like this one. No card ever, and it's a recurring monthly free
allotment (75 usage-hours/month, auto-sleep after 30 min idle) rather
than a trial that runs out. Honest trade-off: not always-instantly-live,
fine for demos/evaluation.

1. Bonto expects `package.json` at the repo root. Create a **separate
   GitHub repo containing just the contents of `backend/`** (copy the
   files in directly, don't nest under a folder) — avoids any monorepo
   subdirectory ambiguity.
2. On Bonto: create a new app → connect that GitHub repo (Git
   push-to-deploy), or paste the code directly in their browser editor.
3. Add environment variables in the app settings: `NODE_ENV=production`,
   `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=1d`,
   `COINGECKO_BASE_URL=https://api.coingecko.com/api/v3`,
   `MARKET_CACHE_TTL_SECONDS=30`, `STARTING_VIRTUAL_BALANCE_INR=1000000`,
   `CORS_ORIGIN` (leave blank for now).
4. The app already listens on `process.env.PORT` (see `src/server.js`) — that's what Bonto requires, no code change needed.
5. You get a live URL like `https://your-app.bonto.run`. Test: `curl https://your-app.bonto.run/api/health`

### Option C: Railway — free to start, but a spending *limit*, not a spending *guarantee*

$5 trial credit, then $1/month ongoing credit, no card required. Since
no card is on file you can't actually be charged — but once credit
runs out the service just pauses, which isn't quite the same as
Bonto's genuinely recurring free tier.

1. Push this repo to GitHub.
2. [railway.app](https://railway.app) → New Project → Deploy from GitHub repo → select this repo.
3. In service settings, set **Root Directory** to `backend`. Railway auto-detects Node via `backend/railway.json` + `package.json`.
4. Add the same environment variables as Option A.
5. Railway assigns a public URL (or generate one under Settings → Networking). Test: `curl https://<your-railway-url>/api/health`

### Option D: Render — only if your account doesn't ask for a card

Card-verification prompts seem to be account/region dependent — some
people never see it.

1. [render.com](https://render.com) → New → Blueprint → connect your repo. Render detects `backend/render.yaml` automatically.
2. Set the `sync: false` env vars in the dashboard (`MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`).
3. Deploy. Test: `curl https://<your-render-url>/api/health`

## 3. Deploy the frontend (Vercel)

1. [vercel.com](https://vercel.com) → New Project → import the same repo → set root directory to `frontend`. Vercel detects `frontend/vercel.json` automatically.
2. Set environment variable `VITE_API_BASE_URL` = `https://<your-backend-url>/api` (from whichever option you used above).
3. Deploy. Vercel gives you a URL like `https://crypto-simulator.vercel.app`.

## 4. Close the loop — restrict CORS

Go back to your backend host → environment variables → set
`CORS_ORIGIN` to your Vercel URL. Redeploy the backend. This locks the
API down so only your actual frontend (not just anyone) can call it
from a browser.

Note: CORS only applies to browser requests. A native mobile app
calling the same API directly isn't affected — no change needed when
the mobile app is built later.

## 5. Verify end-to-end

Open your Vercel URL, register a real account, buy an asset, confirm
the dashboard/portfolio/transactions all update correctly against the
live backend — this is the real "it's a working, demoable system"
checkpoint for your evaluation.

## Costs / limits to know

- **Bonto:** 75 hours/month, auto-sleeps after 30 min idle — genuinely free forever, not always-on.
- **Railway:** free credit can run out; service pauses (never charges, since no card is attached) until next cycle.
- **Render:** free tier spins down after inactivity — first request after idle can take 30-60s.
- MongoDB Atlas free tier (M0): 512MB storage cap — plenty for this project's scale.
- CoinGecko free tier has rate limits — the 30s cache (architecture decision #8) already protects against hitting them under normal use.
