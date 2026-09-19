const LedgerState = require("../models/LedgerState");
const { computeTransactionHash, getTransactionCore, GENESIS_HASH } = require("../utils/hashChain");

/**
 * Must be called inside the same MongoDB session as the trade write it
 * belongs to (see tradingEngine.js). Reading and updating LedgerState
 * within that session means MongoDB's transaction conflict detection
 * naturally serializes concurrent trades — two simultaneous trades
 * can't both link to the same previousHash.
 */
async function appendToChain(session, transactionFields) {
  let state = await LedgerState.findById("GLOBAL").session(session);
  if (!state) {
    [state] = await LedgerState.create([{ _id: "GLOBAL", lastHash: GENESIS_HASH, length: 0 }], {
      session,
    });
  }

  const previousHash = state.lastHash;
  const sequenceNumber = state.length + 1;
  const hash = computeTransactionHash(previousHash, getTransactionCore(transactionFields));

  state.lastHash = hash;
  state.length = sequenceNumber;
  await state.save({ session });

  return { previousHash, hash, sequenceNumber };
}

module.exports = { appendToChain };
