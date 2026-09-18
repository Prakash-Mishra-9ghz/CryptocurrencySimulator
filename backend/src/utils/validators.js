const AppError = require("./AppError");
const { isSupportedAsset } = require("../config/supportedAssets");

function validateQuantity(quantity) {
  if (typeof quantity !== "number" || Number.isNaN(quantity) || quantity <= 0) {
    throw new AppError("Quantity must be a number greater than zero.", 400);
  }
}

function validateAsset(assetId) {
  if (!assetId || !isSupportedAsset(assetId)) {
    throw new AppError("Unsupported or unknown asset.", 400);
  }
}

module.exports = { validateQuantity, validateAsset };
