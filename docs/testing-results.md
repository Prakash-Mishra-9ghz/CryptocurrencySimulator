# Testing & Results

## Automated Unit Tests

Run: `npm test` in `backend/`. **No database or network required** —
pure logic only.

**Actual output (captured — not fabricated):**

```
PASS tests/unit/auth.unit.test.js
  password hashing
    ✓ hash is not the same as the plain password (152 ms)
    ✓ comparePassword returns true for the correct password (177 ms)
    ✓ comparePassword returns false for the wrong password (178 ms)
  JWT sign/verify
    ✓ signed token can be verified and contains the userId (4 ms)
    ✓ verifyToken throws on a tampered token (4 ms)
    ✓ verifyToken throws on garbage input (1 ms)

PASS tests/unit/calculations.unit.test.js
  round2
    ✓ rounds to 2 decimal places (4 ms)
  computeTradeValue
    ✓ quantity x execution price (2 ms)
  computeWeightedAvgCost
    ✓ first purchase: avg cost equals execution price
    ✓ known scenario: buy 1 @ 100, then buy 1 @ 200 -> avg 150 (1 ms)
    ✓ known scenario: buy 2 @ 100, then buy 1 @ 400 -> avg 200
    ✓ throws if resulting quantity is zero or negative (2 ms)
  computeMarketValue
    ✓ quantity x current price (1 ms)
  computeUnrealizedPnl
    ✓ positive P&L when market value exceeds cost basis
    ✓ negative P&L when market value is below cost basis (3 ms)
  computeReturnPercent
    ✓ known scenario: 500 profit on 1000 cost basis = 50% (1 ms)
    ✓ returns 0 when cost basis is 0 (avoids divide-by-zero)
  computeTotalPortfolioValue
    ✓ cash + holdings value

PASS tests/unit/validators.unit.test.js
  validateQuantity
    ✓ accepts a positive number (2 ms)
    ✓ rejects zero (2 ms)
    ✓ rejects negative numbers (1 ms)
    ✓ rejects non-numeric input (2 ms)
  validateAsset
    ✓ accepts a supported asset id (1 ms)
    ✓ rejects an unsupported asset id (1 ms)
    ✓ rejects empty/missing asset id (1 ms)

PASS tests/unit/supportedAssets.unit.test.js
  supportedAssets config
    ✓ exactly 6 supported assets, per architecture decision #4 (1 ms)
    ✓ includes all 6 approved assets (1 ms)
    ✓ isSupportedAsset returns true for a known asset
    ✓ isSupportedAsset returns false for an unknown asset
    ✓ findSupportedAsset returns the full asset record (5 ms)
    ✓ findSupportedAsset returns null for unknown asset
    ✓ getSupportedAssetIds returns all assetIds (2 ms)

Test Suites: 4 passed, 4 total
Tests:       32 passed, 32 total
Snapshots:   0 total
Time:        1.43 s
```

## Integration Tests

Written in `backend/tests/integration/` (auth flow, BUY/SELL, insufficient
cash/holdings, cross-user authorization). Require a dedicated test
MongoDB and internet access (real CoinGecko calls — no mocking, per
project decision), so run them locally per `backend/tests/README.md`:
`npm run test:integration`. Paste your actual local output here once run
— don't claim results that weren't actually observed.

## Manual Test Log (fill in with real dates/results as you run these)

| Spec Section 22 scenario | Method | Result |
|---|---|---|
| Valid registration/login | Integration test | — |
| Invalid credentials | Integration test | — |
| Valid BUY (cash↓, holding↑, transaction recorded) | Integration test + manual UI check | — |
| BUY with insufficient cash (no partial update) | Integration test | — |
| Valid SELL (holding↓, cash↑, transaction recorded) | Integration test + manual UI check | — |
| SELL more than owned | Integration test | — |
| Zero/negative quantity | Unit + integration test | ✅ Automated, passing |
| Portfolio matches manual calculation | Unit test (formulas) + manual spot-check | ✅ Unit tests passing |
| P&L matches documented formula | Unit test | ✅ Automated, passing |
| Persistence after restart/re-login | Manual — restart server, re-login, confirm data intact | — |
| Authorization (access another user's data) | Integration test | — |
| Market API provider unavailable | Manual — temporarily break `COINGECKO_BASE_URL`, confirm clean error not a crash | — |
| Password storage (not plain text) | Unit test + manual DB inspection | ✅ Unit test passing |

**Note for the final report:** replace the `—` rows with your actual
observed results once you run `npm run test:integration` and the manual
checks locally. Do not fill these in without actually running them.
