# Approved Architecture Decisions (Phase 0)

Status: **Approved.** Supersedes the "TO BE FINALIZED" placeholders in the
original project specification document. Only revisit if a concrete
technical blocker is discovered during implementation.

| # | Decision | Value |
|---|---|---|
| 1 | Stack | React.js · Node.js + Express · MongoDB · CoinGecko API |
| 2 | Currency | INR (₹) |
| 3 | Starting virtual balance | ₹10,00,000 |
| 4 | Supported assets | BTC, ETH, BNB, SOL, XRP, DOGE (6 fixed assets) |
| 5 | Cost basis | Weighted Average Cost |
| 6 | Trade execution price | Fresh CoinGecko fetch at BUY/SELL time; stored on the transaction |
| 7 | Auth | JWT + bcrypt password hashing |
| 8 | Market-data strategy | Backend-owned; 30s server-side cache for dashboard; single batched CoinGecko call for all 6 coins; trades bypass cache and fetch fresh |
| 9 | Currency conversion | Direct INR from CoinGecko (`vs_currency=inr`), no USD→INR manual conversion |
| 10 | Blockchain | Not implemented — conceptual only |
| 11 | Real money | None — fully virtual |

## Weighted Average Cost formula (for implementation reference)

On BUY:

```
newAvgCost = (oldQty * oldAvgCost + boughtQty * execPrice) / (oldQty + boughtQty)
```

On SELL: holding quantity decreases; weighted average cost per unit is
unchanged. Realized P&L is out of MVP scope — only unrealized P&L on
remaining holdings is required (see main spec, Section 16).

## Explicitly out of scope for MVP

Fees, slippage, realized P&L, order books, leaderboards, backtesting,
blockchain implementation, real-money trading.
