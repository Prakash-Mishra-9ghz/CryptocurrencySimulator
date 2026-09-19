import apiClient from "./apiClient";

/**
 * POST /api/insights/ask
 * Body: { question: string }
 * Expected response: { answer: string, model: string }
 */
export function askInsight(question) {
  return apiClient.post("/insights/ask", { question }).then((res) => res.data);
}
