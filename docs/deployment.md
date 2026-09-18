# Deployment Guide

Backend → **Render** (free tier). Frontend → **Vercel** (free tier).
Neither costs money at this project's scale.

## Why this matters beyond just "going live"

Once the backend has a real public URL (e.g. `https://crypto-simulator-backend.onrender.com`),
that URL is exactly what a future mobile app would call too — same
endpoints, same JWT auth, no backend changes needed. Deploying now is
also what makes a mobile app buildable later.

## 1. Production database (MongoDB Atlas)

You're likely already using Atlas for local dev — you can reuse the same
cluster, but create a **separate database** for production data (don't
mix it with your local testing data). Copy its connection string.

## 2. Deploy the backend (Render)

1. Push this repo to GitHub (if not already).
2. Go to [render.com](https://render.com) → New → Blueprint → connect your repo. Render will detect `backend/render.yaml` automatically.
   - If you'd rather set it up manually instead of using the Blueprint: New → Web Service → root directory `backend` → build command `npm install` → start command `npm start`.
3. Set these environment variables in the Render dashboard (marked `sync: false` in `render.yaml`, meaning Render won't auto-fill them):
   - `MONGODB_URI` — your Atlas production connection string
   - `JWT_SECRET` — a long random string (generate one, don't reuse your local dev one)
   - `CORS_ORIGIN` — leave blank for now, you'll set this after deploying the frontend
4. Deploy. Once live, test: `curl https://<your-render-url>/api/health`

## 3. Deploy the frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → New Project → import the same repo → set root directory to `frontend`. Vercel will detect `frontend/vercel.json` automatically.
2. Set environment variable:
   - `VITE_API_BASE_URL` = `https://<your-render-url>/api`
3. Deploy. Vercel gives you a URL like `https://crypto-simulator.vercel.app`.

## 4. Close the loop — restrict CORS

Go back to Render → your backend service → environment variables →
set `CORS_ORIGIN` to your Vercel URL (e.g.
`https://crypto-simulator.vercel.app`). Redeploy the backend. This
locks the API down so only your actual frontend (not just anyone) can
call it from a browser.

Note: CORS only applies to browser requests. A native mobile app calling
the same API directly isn't affected by this setting — so this step
doesn't need to be redone when the mobile app is built later.

## 5. Verify end-to-end

Open your Vercel URL, register a real account, buy an asset, confirm
the dashboard/portfolio/transactions all update correctly against the
live backend — this is the actual "it's a working, demoable system"
checkpoint for your evaluation.

## Costs / limits to know

- Render free tier spins down after inactivity — first request after
  idle can take 30-60s to wake up. Fine for a demo, mention it if your
  evaluator hits a slow first load.
- MongoDB Atlas free tier (M0) has a 512MB storage cap — plenty for
  this project's scale.
- CoinGecko's free tier has rate limits — the 30s cache (architecture
  decision #8) already protects against hitting them under normal use.
