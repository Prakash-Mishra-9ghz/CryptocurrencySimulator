const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { getPortfolio } = require("../controllers/portfolioController");

const router = express.Router();

router.get("/", requireAuth, getPortfolio);

module.exports = router;
