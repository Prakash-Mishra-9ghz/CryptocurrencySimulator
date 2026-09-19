const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { ask } = require("../controllers/insightsController");

const router = express.Router();

router.post("/ask", requireAuth, ask);

module.exports = router;
