const { computePortfolio } = require("../services/portfolioService");

async function getPortfolio(req, res, next) {
  try {
    const portfolio = await computePortfolio(req.userId);
    return res.json(portfolio);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getPortfolio };
