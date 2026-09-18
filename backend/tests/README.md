# Backend Testing

## Unit tests — `npm test`

Pure logic only (calculations, validation, password hashing, JWT,
supported-assets config). **No database or network needed.** Run anytime:

```bash
npm test
```

## Integration tests — `npm run test:integration`

Full HTTP request/response tests against a real Express app + real
database, covering the scenarios in the main spec's Testing Plan
(Section 22): registration, login, authorization, BUY/SELL validation,
insufficient cash/holdings, portfolio consistency, cross-user access.

**Requirements:**
- A **dedicated test MongoDB database** — never point this at your real
  data, tests wipe all collections between runs. A separate free Atlas
  cluster/database works well.
- **Internet access** — trade tests call the real CoinGecko API (no
  mocking, per project decision).
- Must be a **replica set** (Atlas is by default) — trade tests use
  MongoDB transactions.

**Setup:**

```bash
cp .env.test.example .env.test
# Edit .env.test: set TEST_MONGODB_URI to your test database
```

Then run:

```bash
npm run test:integration
```

## What's covered vs. what still needs manual checking

| Spec Section 22 scenario | Automated? |
|---|---|
| Valid registration/login | Yes — integration |
| Invalid credentials | Yes — integration |
| Valid BUY / insufficient cash | Yes — integration |
| Valid SELL / sell more than owned | Yes — integration |
| Zero/negative quantity | Yes — unit + integration |
| Portfolio matches manual calculation | Yes — unit (calculation formulas) |
| P&L matches documented formula | Yes — unit |
| Authorization (access another user's data) | Yes — integration |
| Persistence (restart/re-login) | **Manual** — restart the server, confirm holdings/transactions/wallet are still correct after logging back in |
| Market API provider unavailable | **Manual** — temporarily set an invalid `COINGECKO_BASE_URL` and confirm the app returns a clean error, not a crash |
| Security: password storage | Partially automated (hash != plaintext, unit test) — also manually inspect the database directly to confirm no plaintext password is ever stored |
