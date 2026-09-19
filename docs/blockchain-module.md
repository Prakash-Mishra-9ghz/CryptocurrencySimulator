# Hash-Chained Transaction Ledger

## What this is

Every completed transaction (BUY or SELL, across all users) is linked
into a single global chain: each transaction's hash is computed from
its own data **plus the hash of the transaction immediately before it**.
Changing any past transaction's data — or its stored hash — breaks the
chain from that point forward, and `GET /api/ledger/verify` detects it
by recomputing every hash from scratch and comparing.

This demonstrates the core integrity idea blockchain is built on:
tamper-evidence through cryptographic linking.

## What this is NOT

This is **not a blockchain** in the full sense, and the project does
not claim it is:

- No distributed consensus — one MongoDB database, not a peer-to-peer network.
- No mining, no proof-of-work/stake, no incentive mechanism.
- No cryptocurrency token or on-chain settlement.
- A determined attacker with direct database write access could rewrite
  the entire chain consistently (recompute every subsequent hash) —
  this protects against **accidental or partial tampering**, not
  against someone with full database control rewriting history end-to-end.

## Design

- **Global chain, not per-user** — a single `LedgerState` singleton
  document (`src/models/LedgerState.js`) tracks the current chain end
  (`lastHash`, `length`). Every trade appends to this same chain
  regardless of which user made it.
- **Atomic with the trade itself** — `appendToChain()`
  (`src/services/ledgerService.js`) runs inside the *same* MongoDB
  session/transaction as the wallet/holding/transaction writes in
  `tradingEngine.js`. If the trade fails, the chain never advances —
  no orphaned or skipped links.
- **Concurrency-safe by construction** — because the chain-state update
  happens inside the trade's transaction, two simultaneous trades can't
  both link to the same `previousHash`: MongoDB's transaction conflict
  detection forces one to retry (`session.withTransaction` retries
  automatically on `TransientTransactionError`).
- **Hash function:** SHA-256 over a deterministic JSON payload of
  `{ previousHash, userId, assetId, symbol, type, quantity,
  executionPrice, totalValue, timestamp }` (`src/utils/hashChain.js`,
  `getTransactionCore()`).
- **Genesis hash:** `"0".repeat(64)` — the first transaction in the
  system links to this fixed value.

## Verifying it yourself

```bash
curl https://<your-backend>/api/ledger/verify \
  -H "Authorization: Bearer <token>"
```

Returns `{ "valid": true, "totalTransactions": N, "brokenAtSequence": null }`
if intact. To see it correctly detect tampering, manually edit a
transaction's `quantity` field directly in the database (bypassing the
API) and call verify again — `valid` becomes `false` and
`brokenAtSequence` points to exactly the transaction you changed.

## Test coverage

`backend/tests/unit/hashChain.unit.test.js` — 8 tests, all pure functions,
no database needed: determinism, a correctly-built chain verifies valid,
and three distinct tamper scenarios (changed data, changed hash, broken
link) are each correctly detected.
