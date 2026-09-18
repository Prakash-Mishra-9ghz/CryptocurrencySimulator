const { validateQuantity, validateAsset } = require("../../src/utils/validators");

describe("validateQuantity", () => {
  test("accepts a positive number", () => {
    expect(() => validateQuantity(1)).not.toThrow();
    expect(() => validateQuantity(0.001)).not.toThrow();
  });

  test("rejects zero", () => {
    expect(() => validateQuantity(0)).toThrow(/greater than zero/);
  });

  test("rejects negative numbers", () => {
    expect(() => validateQuantity(-5)).toThrow(/greater than zero/);
  });

  test("rejects non-numeric input", () => {
    expect(() => validateQuantity("abc")).toThrow();
    expect(() => validateQuantity(NaN)).toThrow();
    expect(() => validateQuantity(undefined)).toThrow();
  });
});

describe("validateAsset", () => {
  test("accepts a supported asset id", () => {
    expect(() => validateAsset("bitcoin")).not.toThrow();
  });

  test("rejects an unsupported asset id", () => {
    expect(() => validateAsset("dogecoin-but-fake")).toThrow(/Unsupported/);
  });

  test("rejects empty/missing asset id", () => {
    expect(() => validateAsset("")).toThrow();
    expect(() => validateAsset(undefined)).toThrow();
  });
});
