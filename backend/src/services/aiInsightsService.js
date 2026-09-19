const Groq = require("groq-sdk");
const AppError = require("../utils/AppError");
const { computePortfolio } = require("./portfolioService");
const Transaction = require("../models/Transaction");

let client = null;
function getClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new AppError(
      "AI Insights is not configured (GROQ_API_KEY missing). See docs/ai-insights.md.",
      503
    );
  }
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

const SYSTEM_PROMPT = `You are a portfolio insights assistant inside an educational cryptocurrency TRADING SIMULATOR.
All money is virtual — nothing here is real trading or real financial advice.
You are given the user's real simulated portfolio and recent transaction data as JSON. Rules:
- Only use numbers and facts from the provided JSON. Never invent a price, quantity, or figure not present in it.
- If the data doesn't contain what's needed to answer, say so plainly instead of guessing.
- Be concise (a few sentences, not an essay) unless the user clearly asks for detail.
- Always keep in mind this is a simulation with virtual currency — never phrase anything as real financial advice.`;

/**
 * Builds the grounding context for one user, then asks Groq to answer
 * their question using only that data. Model is configurable via
 * GROQ_MODEL — Groq's free-tier model lineup changes fairly often, so
 * this is never hardcoded (see docs/ai-insights.md for how to check
 * and update it).
 */
async function askAboutPortfolio(userId, question) {
  if (!question || typeof question !== "string" || question.trim().length === 0) {
    throw new AppError("A question is required.", 400);
  }

  const groq = getClient(); // fail fast if GROQ_API_KEY isn't configured, before any DB work

  const portfolio = await computePortfolio(userId);
  const recentTransactions = await Transaction.find({ userId })
    .sort({ timestamp: -1 })
    .limit(10)
    .lean();

  const context = {
    portfolio,
    recentTransactions: recentTransactions.map((tx) => ({
      type: tx.type,
      symbol: tx.symbol,
      quantity: tx.quantity,
      executionPrice: tx.executionPrice,
      totalValue: tx.totalValue,
      timestamp: tx.timestamp,
    })),
  };

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Portfolio data (JSON):\n${JSON.stringify(context)}\n\nQuestion: ${question}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });
  } catch (err) {
    throw new AppError(
      `AI Insights request failed: ${err.message || "unknown error from provider"}`,
      502
    );
  }

  const answer = completion.choices?.[0]?.message?.content;
  if (!answer) {
    throw new AppError("AI Insights provider returned an empty response.", 502);
  }

  return { answer, model };
}

module.exports = { askAboutPortfolio };
