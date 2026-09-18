function round2(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Weighted Average Cost (architecture decision #5).
 * newAvgCost = (oldQty*oldAvgCost + boughtQty*execPrice) / (oldQty+boughtQty)
 */
function computeWeightedAvgCost(oldQuantity, oldAvgCost, boughtQuantity, executionPrice) {
  const newQuantity = oldQuantity + boughtQuantity;
  if (newQuantity <= 0) {
    throw new Error("Resulting quantity must be greater than zero.");
  }
  const newAvgCost =
    (oldQuantity * oldAvgCost + boughtQuantity * executionPrice) / newQuantity;
  return round2(newAvgCost);
}

/** Trade Value = quantity × execution price (spec Section 16) */
function computeTradeValue(quantity, executionPrice) {
  return round2(quantity * executionPrice);
}

/** Holding Market Value = quantity held × current market price (spec Section 16) */
function computeMarketValue(quantity, currentPrice) {
  return round2(quantity * currentPrice);
}

/** Unrealized P&L = current holding value − cost basis (spec Section 16) */
function computeUnrealizedPnl(marketValue, costBasis) {
  return round2(marketValue - costBasis);
}

/** Return % = P&L ÷ cost basis × 100 (spec Section 16). Returns 0 if cost basis is 0. */
function computeReturnPercent(pnl, costBasis) {
  if (costBasis <= 0) return 0;
  return round2((pnl / costBasis) * 100);
}

/** Total Portfolio Value = available virtual cash + sum of holding market values (spec Section 16) */
function computeTotalPortfolioValue(availableCash, totalHoldingsValue) {
  return round2(availableCash + totalHoldingsValue);
}

module.exports = {
  round2,
  computeWeightedAvgCost,
  computeTradeValue,
  computeMarketValue,
  computeUnrealizedPnl,
  computeReturnPercent,
  computeTotalPortfolioValue,
};
