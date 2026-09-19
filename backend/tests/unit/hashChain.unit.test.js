const {
  GENESIS_HASH,
  computeTransactionHash,
  getTransactionCore,
  verifyChain,
} = require("../../src/utils/hashChain");

function makeTx(overrides) {
  return {
    userId: "507f1f77bcf86cd799439011",
    assetId: "bitcoin",
    symbol: "BTC",
    type: "BUY",
    quantity: 0.01,
    executionPrice: 5000000,
    totalValue: 50000,
    timestamp: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("computeTransactionHash", () => {
  test("is deterministic — same input always produces the same hash", () => {
    const core = getTransactionCore(makeTx({}));
    const h1 = computeTransactionHash(GENESIS_HASH, core);
    const h2 = computeTransactionHash(GENESIS_HASH, core);
    expect(h1).toBe(h2);
  });

  test("a different previousHash produces a different hash", () => {
    const core = getTransactionCore(makeTx({}));
    const h1 = computeTransactionHash(GENESIS_HASH, core);
    const h2 = computeTransactionHash("a".repeat(64), core);
    expect(h1).not.toBe(h2);
  });

  test("changing any transaction field changes the hash", () => {
    const core1 = getTransactionCore(makeTx({ quantity: 0.01 }));
    const core2 = getTransactionCore(makeTx({ quantity: 0.02 }));
    expect(computeTransactionHash(GENESIS_HASH, core1)).not.toBe(
      computeTransactionHash(GENESIS_HASH, core2)
    );
  });
});

describe("verifyChain", () => {
  function buildValidChain(count) {
    const chain = [];
    let previousHash = GENESIS_HASH;
    for (let i = 1; i <= count; i++) {
      const tx = makeTx({ quantity: i * 0.001, sequenceNumber: i });
      const hash = computeTransactionHash(previousHash, getTransactionCore(tx));
      chain.push({ ...tx, previousHash, hash });
      previousHash = hash;
    }
    return chain;
  }

  test("a correctly built chain verifies as valid", () => {
    const chain = buildValidChain(5);
    expect(verifyChain(chain)).toEqual({ valid: true, brokenAtSequence: null });
  });

  test("an empty chain is trivially valid", () => {
    expect(verifyChain([])).toEqual({ valid: true, brokenAtSequence: null });
  });

  test("tampering with a transaction's data breaks verification from that point on", () => {
    const chain = buildValidChain(5);
    chain[2].quantity = 999; // tamper with transaction #3's data, hash left unchanged
    const result = verifyChain(chain);
    expect(result.valid).toBe(false);
    expect(result.brokenAtSequence).toBe(3);
  });

  test("tampering with a stored hash directly is also detected", () => {
    const chain = buildValidChain(5);
    chain[1].hash = "f".repeat(64);
    const result = verifyChain(chain);
    expect(result.valid).toBe(false);
    expect(result.brokenAtSequence).toBe(2);
  });

  test("a broken link (wrong previousHash) is detected", () => {
    const chain = buildValidChain(5);
    chain[3].previousHash = "0".repeat(64); // should be chain[2].hash
    const result = verifyChain(chain);
    expect(result.valid).toBe(false);
    expect(result.brokenAtSequence).toBe(4);
  });
});
