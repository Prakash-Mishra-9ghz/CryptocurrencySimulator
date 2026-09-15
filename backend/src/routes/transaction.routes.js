const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { getTransactions } = require("../controllers/transactionController");

const router = express.Router();

router.get("/", requireAuth, getTransactions);

module.exports = router;
