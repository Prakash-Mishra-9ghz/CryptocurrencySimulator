const Wallet = require("../models/Wallet");
const Holding = require("../models/Holding");
const { getCachedAssetPrices } = require("./marketDataService");
const AppError = require("../utils/AppError");
const {
  round2,
  computeMarketValue,
  computeUnrealizedPnl,
  computeReturnPercent,
  computeTotalPortfolioValue,
} = require("../utils/calculations");

/**
 * Computes the full portfolio view for a user, per the formulas in
 * docs/architecture-decisions.md and spec Section 16 (see
 * src/utils/calculations.js for the single source of truth).
 * Realized P&L, fees, slippage are NOT computed — out of MVP scope.
 */
async function computePortfolio(userId) {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    throw new AppError("Wallet not found for this user.", 404);
  }

  const holdings = await Holding.find({ userId }).lean();

  let currentPrices = [];
  if (holdings.length > 0) {
    // Uses the 30s cache (architecture decision #8) — portfolio valuation
    // doesn't need a fresh-every-time price the way trade execution does.
    currentPrices = await getCachedAssetPrices();
  }

  const priceMap = new Map(currentPrices.map((p) => [p.assetId, p.priceInr]));

  let totalHoldingsValue = 0;
  let totalCostBasis = 0;

  const enrichedHoldings = holdings.map((h) => {
    const currentPrice = priceMap.get(h.assetId) ?? null;
    const costBasis = h.quantity * h.avgCost;
    const marketValue = currentPrice !== null ? computeMarketValue(h.quantity, currentPrice) : null;
    const unrealizedPnl = marketValue !== null ? computeUnrealizedPnl(marketValue, costBasis) : null;

    if (marketValue !== null) {
      totalHoldingsValue += marketValue;
      totalCostBasis += costBasis;
    }

    return {
      assetId: h.assetId,
      symbol: h.symbol,
      quantity: h.quantity,
      avgCost: h.avgCost,
      currentPrice,
      marketValue,
      unrealizedPnl,
      allocationPercent: null, // filled in below, needs totalValue first
    };
  });

  const totalValue = computeTotalPortfolioValue(wallet.virtualCash, totalHoldingsValue);
  const totalPnl = round2(totalHoldingsValue - totalCostBasis);
  const totalPnlPercent = computeReturnPercent(totalPnl, totalCostBasis);

  const holdingsWithAllocation = enrichedHoldings.map((h) => ({
    ...h,
    allocationPercent:
      h.marketValue !== null && totalValue > 0 ? round2((h.marketValue / totalValue) * 100) : 0,
  }));

  return {
    totalValue,
    availableCash: round2(wallet.virtualCash),
    totalPnl,
    totalPnlPercent,
    holdings: holdingsWithAllocation,
  };
}

module.exports = { computePortfolio };
