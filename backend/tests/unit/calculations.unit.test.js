const {
  round2,
  computeWeightedAvgCost,
  computeTradeValue,
  computeMarketValue,
  computeUnrealizedPnl,
  computeReturnPercent,
  computeTotalPortfolioValue,
} = require("../../src/utils/calculations");

describe("round2", () => {
  test("rounds to 2 decimal places", () => {
    expect(round2(10.005)).toBeCloseTo(10.01, 2);
    expect(round2(10.001)).toBe(10);
    expect(round2(10)).toBe(10);
  });
});

describe("computeTradeValue", () => {
  test("quantity x execution price", () => {
    expect(computeTradeValue(2, 5000)).toBe(10000);
    expect(computeTradeValue(0.5, 100)).toBe(50);
  });
});

describe("computeWeightedAvgCost", () => {
  test("first purchase: avg cost equals execution price", () => {
    expect(computeWeightedAvgCost(0, 0, 1, 100)).toBe(100);
  });

  test("known scenario: buy 1 @ 100, then buy 1 @ 200 -> avg 150", () => {
    expect(computeWeightedAvgCost(1, 100, 1, 200)).toBe(150);
  });

  test("known scenario: buy 2 @ 100, then buy 1 @ 400 -> avg 200", () => {
    // (2*100 + 1*400) / 3 = 600/3 = 200
    expect(computeWeightedAvgCost(2, 100, 1, 400)).toBe(200);
  });

  test("throws if resulting quantity is zero or negative", () => {
    expect(() => computeWeightedAvgCost(0, 0, 0, 100)).toThrow();
  });
});

describe("computeMarketValue", () => {
  test("quantity x current price", () => {
    expect(computeMarketValue(3, 1000)).toBe(3000);
  });
});

describe("computeUnrealizedPnl", () => {
  test("positive P&L when market value exceeds cost basis", () => {
    expect(computeUnrealizedPnl(1500, 1000)).toBe(500);
  });
  test("negative P&L when market value is below cost basis", () => {
    expect(computeUnrealizedPnl(800, 1000)).toBe(-200);
  });
});

describe("computeReturnPercent", () => {
  test("known scenario: 500 profit on 1000 cost basis = 50%", () => {
    expect(computeReturnPercent(500, 1000)).toBe(50);
  });
  test("returns 0 when cost basis is 0 (avoids divide-by-zero)", () => {
    expect(computeReturnPercent(500, 0)).toBe(0);
  });
});

describe("computeTotalPortfolioValue", () => {
  test("cash + holdings value", () => {
    expect(computeTotalPortfolioValue(500000, 250000)).toBe(750000);
  });
});
