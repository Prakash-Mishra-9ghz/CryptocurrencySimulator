const crypto = require("crypto");

const GENESIS_HASH = "0".repeat(64);

/**
 * Deterministic subset of a transaction's fields used for hashing.
 * MUST stay identical between the moment a hash is created and any
 * later verification, or verification will always report tampering
 * that never actually happened.
 */
function getTransactionCore(tx) {
  return {
    userId: String(tx.userId),
    assetId: tx.assetId,
    symbol: tx.symbol,
    type: tx.type,
    quantity: tx.quantity,
    executionPrice: tx.executionPrice,
    totalValue: tx.totalValue,
    timestamp: new Date(tx.timestamp).toISOString(),
  };
}

function computeTransactionHash(previousHash, transactionCore) {
  const payload = JSON.stringify({ previousHash, ...transactionCore });
  return crypto.createHash("sha256").update(payload).digest("hex");
}

/**
 * Walks a list of transactions (must be in ascending sequenceNumber
 * order) and recomputes every hash from scratch, confirming each
 * transaction's stored hash matches what its data actually produces,
 * and that each links correctly to the previous one. This is what
 * makes the chain tamper-evident: editing any past transaction's data
 * (or its hash) breaks verification for it and every transaction after it.
 */
function verifyChain(transactionsInOrder) {
  let expectedPrevious = GENESIS_HASH;

  for (const tx of transactionsInOrder) {
    if (tx.previousHash !== expectedPrevious) {
      return { valid: false, brokenAtSequence: tx.sequenceNumber };
    }
    const recomputed = computeTransactionHash(expectedPrevious, getTransactionCore(tx));
    if (recomputed !== tx.hash) {
      return { valid: false, brokenAtSequence: tx.sequenceNumber };
    }
    expectedPrevious = tx.hash;
  }

  return { valid: true, brokenAtSequence: null };
}

module.exports = { GENESIS_HASH, getTransactionCore, computeTransactionHash, verifyChain };
