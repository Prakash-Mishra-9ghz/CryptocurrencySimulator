import { useState } from "react";
import { askInsight } from "../../services/insightsService";
import { LoadingState, ErrorState } from "../common/States";

const SUGGESTIONS = [
  "How is my portfolio performing overall?",
  "Which of my holdings is doing best?",
  "Summarize my recent trades.",
];

export default function PortfolioInsights() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleAsk(q) {
    const finalQuestion = (q ?? question).trim();
    if (!finalQuestion) return;

    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const result = await askInsight(finalQuestion);
      setAnswer(result.answer);
    } catch (err) {
      setError(
        err?.response?.data?.error || err?.message || "Couldn't get insights right now."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="insights-widget">
      <h2>Ask your portfolio</h2>

      <div className="insights-suggestions">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="suggestion-chip"
            onClick={() => {
              setQuestion(s);
              handleAsk(s);
            }}
            disabled={loading}
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="insights-form"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your portfolio..."
        />
        <button type="submit" disabled={loading || !question.trim()}>
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {loading && <LoadingState message="Analyzing your portfolio..." />}
      {error && <ErrorState message={error} />}
      {answer && <p className="insights-answer">{answer}</p>}

      <p className="insights-disclaimer">
        Generated from your real simulated portfolio data — not real financial advice.
      </p>
    </div>
  );
}
