const { askAboutPortfolio } = require("../services/aiInsightsService");

async function ask(req, res, next) {
  try {
    const { question } = req.body;
    const result = await askAboutPortfolio(req.userId, question);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { ask };
