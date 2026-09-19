# Limitations & Future Scope

## Current Limitations

- No real-money trading, no real cryptocurrency custody, no blockchain implementation (by design — see architecture decision #10-11).
- Market data availability depends on CoinGecko's uptime and free-tier rate limits. The 30-second cache mitigates but doesn't eliminate this.
- No order book, matching engine, liquidity modeling, slippage, fees, or taxes — none of these are implemented.
- Only Unrealized P&L is calculated. Realized P&L is not tracked (out of MVP scope per architecture decisions).
- 6 fixed supported assets (BTC, ETH, BNB, SOL, XRP, DOGE) — not user-extensible without a code change.
- Free-tier hosting (Back4App/Bonto/Railway) may sleep after inactivity, causing a slow first request after idle periods.
- Integration tests require manual setup (a dedicated test database) — not run automatically in CI as of this writing.

## Future Scope

Directly from the approved roadmap (in order of priority):

1. **Visual Polish** *(done)* — vibrant themed UI with per-asset accent colors.
2. **Charts** *(done)* — price history and portfolio allocation.
3. **Multi-Asset Expansion (Indian Stocks)** *(proposed, not started)* — would require a new data provider (NSE/BSE API), a redesigned Asset model (exchange, sector, market hours), and careful scoping since it changes what the project claims to be. Planned as a strictly optional phase after core evaluation.
4. **Mobile App** *(proposed, not started)* — the backend is a stateless JWT REST API, so a React Native/Flutter app would call the exact same endpoints as the web frontend with zero backend changes.
5. **Optional Blockchain Module** *(done)* — implemented as a hash-chained transaction ledger (SHA-256, each transaction links to the previous one, atomic with the trade itself, verifiable via `GET /api/ledger/verify`). See `docs/blockchain-module.md` for the full design and an explicit statement of what this is and isn't — it demonstrates blockchain's core integrity concept honestly, without claiming distributed consensus or real blockchain infrastructure.
6. **AI Portfolio Insights** *(done)* — a free-form "ask your portfolio" question box on the Portfolio page, grounded in the user's real portfolio/transaction data via Groq's free LLM API. See `docs/ai-insights.md` for design and honest limitations (not financial advice, can still misinterpret questions even when grounded).
7. Trading fees, slippage simulation, advanced order types, leaderboards, strategy backtesting — all explicitly out of MVP scope, listed here only as possibilities, none implemented.

## What This Project Does NOT Claim

Per the original spec's Section 31 (Rules for AI-Assisted Development)
and Section 32 (Definition of Done): this document describes only what
is actually implemented and verified. Any item above marked "proposed,
not started" is exactly that — not implemented, not partially built,
not planned-but-secretly-done. If asked in viva, the honest answer for
any of these is "not implemented — here's why, and here's what it would
take."
