delete process.env.GROQ_API_KEY;

const { askAboutPortfolio } = require("../../src/services/aiInsightsService");

describe("askAboutPortfolio — input validation (runs before any DB/network call)", () => {
  test("rejects an empty question", async () => {
    await expect(askAboutPortfolio("someUserId", "")).rejects.toThrow(/question is required/i);
  });

  test("rejects a whitespace-only question", async () => {
    await expect(askAboutPortfolio("someUserId", "   ")).rejects.toThrow(/question is required/i);
  });

  test("rejects a missing question", async () => {
    await expect(askAboutPortfolio("someUserId", undefined)).rejects.toThrow(
      /question is required/i
    );
  });

  test("rejects a non-string question", async () => {
    await expect(askAboutPortfolio("someUserId", 12345)).rejects.toThrow(/question is required/i);
  });
});

describe("askAboutPortfolio — fails fast when GROQ_API_KEY is not configured", () => {
  test("rejects with a clear 'not configured' error before touching the database", async () => {
    delete process.env.GROQ_API_KEY;
    await expect(askAboutPortfolio("someUserId", "How is my portfolio doing?")).rejects.toThrow(
      /not configured/i
    );
  });
});
