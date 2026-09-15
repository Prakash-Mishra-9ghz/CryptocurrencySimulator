const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { buy, sell } = require("../controllers/tradeController");

const router = express.Router();

router.post("/buy", requireAuth, buy);
router.post("/sell", requireAuth, sell);

module.exports = router;
