const Transaction = require("../models/Transaction");

async function getTransactions(req, res, next) {
  try {
    let query = Transaction.find({ userId: req.userId }).sort({ timestamp: -1 });

    const limit = Number(req.query.limit);
    if (Number.isInteger(limit) && limit > 0) {
      query = query.limit(limit);
    }

    const transactions = await query.lean();

    const formatted = transactions.map((tx) => ({
      id: tx._id,
      timestamp: tx.timestamp,
      assetId: tx.assetId,
      symbol: tx.symbol,
      type: tx.type,
      quantity: tx.quantity,
      executionPrice: tx.executionPrice,
      tradeValue: tx.totalValue,
      status: tx.status,
    }));

    return res.json(formatted);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getTransactions };
