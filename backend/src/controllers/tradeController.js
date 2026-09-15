const { executeBuy, executeSell } = require("../services/tradingEngine");

async function buy(req, res, next) {
  try {
    const { assetId, quantity } = req.body;
    const result = await executeBuy(req.userId, assetId, Number(quantity));
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function sell(req, res, next) {
  try {
    const { assetId, quantity } = req.body;
    const result = await executeSell(req.userId, assetId, Number(quantity));
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { buy, sell };
