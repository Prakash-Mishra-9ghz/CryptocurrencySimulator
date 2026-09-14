const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { getWallet } = require("../controllers/walletController");

const router = express.Router();

router.get("/", requireAuth, getWallet);

module.exports = router;
