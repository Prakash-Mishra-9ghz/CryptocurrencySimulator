const {
  SUPPORTED_ASSETS,
  getSupportedAssetIds,
  findSupportedAsset,
  isSupportedAsset,
} = require("../../src/config/supportedAssets");

describe("supportedAssets config", () => {
  test("exactly 6 supported assets, per architecture decision #4", () => {
    expect(SUPPORTED_ASSETS).toHaveLength(6);
  });

  test("includes all 6 approved assets", () => {
    const symbols = SUPPORTED_ASSETS.map((a) => a.symbol);
    expect(symbols).toEqual(expect.arrayContaining(["BTC", "ETH", "BNB", "SOL", "XRP", "DOGE"]));
  });

  test("isSupportedAsset returns true for a known asset", () => {
    expect(isSupportedAsset("bitcoin")).toBe(true);
  });

  test("isSupportedAsset returns false for an unknown asset", () => {
    expect(isSupportedAsset("shibainu")).toBe(false);
  });

  test("findSupportedAsset returns the full asset record", () => {
    expect(findSupportedAsset("ethereum")).toEqual({
      assetId: "ethereum",
      symbol: "ETH",
      name: "Ethereum",
    });
  });

  test("findSupportedAsset returns null for unknown asset", () => {
    expect(findSupportedAsset("not-real")).toBeNull();
  });

  test("getSupportedAssetIds returns all assetIds", () => {
    expect(getSupportedAssetIds()).toHaveLength(6);
  });
});
