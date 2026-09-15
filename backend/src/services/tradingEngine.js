const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const Holding = require("../models/Holding");
const Transaction = require("../models/Transaction");
const AppError = require("../utils/AppError");
const { isSupportedAsset, findSupportedAsset } = require("../config/supportedAssets");
const { getFreshAssetPrice } = require("./marketDataService");

function round2(value) {
  return Math.round(value * 100) / 100;
}

function validateQuantity(quantity) {
  if (typeof quantity !== "number" || Number.isNaN(quantity) || quantity <= 0) {
    throw new AppError("Quantity must be a number greater than zero.", 400);
  }
}

function validateAsset(assetId) {
  if (!assetId || !isSupportedAsset(assetId)) {
    throw new AppError("Unsupported or unknown asset.", 400);
  }
}

/**
 * Runs fn inside a MongoDB session/transaction so wallet, holding and
 * transaction writes either all succeed or all roll back together
 * (spec Section 15: "A failed trade must not partially update the
 * account"). Requires MongoDB to be a replica set (MongoDB Atlas is,
 * by default — a local standalone mongod is not). If transactions
 * aren't supported, this surfaces a clear error rather than silently
 * running non-atomically.
 */
async function runInTransaction(fn) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } catch (err) {
    if (err.message && err.message.includes("Transaction numbers are only allowed")) {
      throw new AppError(
        "Database does not support transactions (requires a MongoDB replica set, e.g. Atlas). " +
          "Cannot safely execute trade.",
        500
      );
    }
    throw err;
  } finally {
    session.endSession();
  }
}

async function executeBuy(userId, assetId, quantity) {
  validateQuantity(quantity);
  validateAsset(assetId);

  const asset = findSupportedAsset(assetId);
  const priceData = await getFreshAssetPrice(assetId); // always fresh, never cached (decision #6)
  const executionPrice = priceData.priceInr;
  const tradeValue = round2(quantity * executionPrice);

  return runInTransaction(async (session) => {
    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) {
      throw new AppError("Wallet not found for this user.", 404);
    }
    if (wallet.virtualCash < tradeValue) {
      throw new AppError("Insufficient virtual cash for this trade.", 409);
    }

    wallet.virtualCash = round2(wallet.virtualCash - tradeValue);
    await wallet.save({ session });

    let holding = await Holding.findOne({ userId, assetId }).session(session);
    if (holding) {
      // Weighted Average Cost (architecture decision #5):
      const newQuantity = holding.quantity + quantity;
      const newAvgCost =
        (holding.quantity * holding.avgCost + quantity * executionPrice) / newQuantity;
      holding.quantity = newQuantity;
      holding.avgCost = round2(newAvgCost);
      await holding.save({ session });
    } else {
      holding = await Holding.create(
        [
          {
            userId,
            assetId,
            symbol: asset.symbol,
            quantity,
            avgCost: executionPrice,
          },
        ],
        { session }
      ).then((docs) => docs[0]);
    }

    const [transaction] = await Transaction.create(
      [
        {
          userId,
          assetId,
          symbol: asset.symbol,
          type: "BUY",
          quantity,
          executionPrice,
          totalValue: tradeValue,
          status: "COMPLETED",
        },
      ],
      { session }
    );

    return { transaction, wallet, holding };
  });
}

async function executeSell(userId, assetId, quantity) {
  validateQuantity(quantity);
  validateAsset(assetId);

  const asset = findSupportedAsset(assetId);
  const priceData = await getFreshAssetPrice(assetId);
  const executionPrice = priceData.priceInr;
  const tradeValue = round2(quantity * executionPrice);

  return runInTransaction(async (session) => {
    const holding = await Holding.findOne({ userId, assetId }).session(session);
    if (!holding || holding.quantity < quantity) {
      throw new AppError("Insufficient holdings for this trade.", 409);
    }

    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) {
      throw new AppError("Wallet not found for this user.", 404);
    }

    wallet.virtualCash = round2(wallet.virtualCash + tradeValue);
    await wallet.save({ session });

    // Selling never changes avgCost (Weighted Average Cost is only
    // recalculated on BUY, per docs/architecture-decisions.md).
    holding.quantity = round2(holding.quantity - quantity);
    if (holding.quantity === 0) {
      await Holding.deleteOne({ _id: holding._id }).session(session);
    } else {
      await holding.save({ session });
    }

    const [transaction] = await Transaction.create(
      [
        {
          userId,
          assetId,
          symbol: asset.symbol,
          type: "SELL",
          quantity,
          executionPrice,
          totalValue: tradeValue,
          status: "COMPLETED",
        },
      ],
      { session }
    );

    return { transaction, wallet, holding: holding.quantity === 0 ? null : holding };
  });
}

module.exports = { executeBuy, executeSell };
