const Transaction = require("../models/Transaction");
const { verifyChain } = require("../utils/hashChain");

async function verifyLedger(req, res, next) {
  try {
    const transactions = await Transaction.find({}).sort({ sequenceNumber: 1 }).lean();
    const result = verifyChain(transactions);
    return res.json({
      valid: result.valid,
      totalTransactions: transactions.length,
      brokenAtSequence: result.brokenAtSequence,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { verifyLedger };
