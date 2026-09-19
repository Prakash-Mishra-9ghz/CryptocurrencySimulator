const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { verifyLedger } = require("../controllers/ledgerController");

const router = express.Router();

router.get("/verify", requireAuth, verifyLedger);

module.exports = router;
