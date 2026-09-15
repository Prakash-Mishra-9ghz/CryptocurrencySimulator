const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { getAssets, getAssetById } = require("../controllers/marketController");

const router = express.Router();

router.get("/assets", requireAuth, getAssets);
router.get("/assets/:id", requireAuth, getAssetById);

module.exports = router;
