const express = require("express");
const cors = require("cors");

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());

/**
 * Health check route.
 * Used to verify the server is running and (once DB is wired up)
 * that the database connection is alive. No business logic here —
 * this exists purely so Phase 1 has something real and testable
 * before auth/market/trading modules are added in later phases.
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "crypto-simulator-backend",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/wallet", require("./routes/wallet.routes"));
app.use("/api/market", require("./routes/market.routes"));
app.use("/api/trades", require("./routes/trade.routes"));
app.use("/api/portfolio", require("./routes/portfolio.routes"));
app.use("/api/transactions", require("./routes/transaction.routes"));

// 404 handler for any unmatched route
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Centralized error handler (kept minimal for now; expanded in Phase 4+
// once real business-logic errors — insufficient cash, invalid asset, etc.
// — need consistent formatting)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || "Internal server error",
  });
});

module.exports = app;
