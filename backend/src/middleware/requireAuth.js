const { verifyToken } = require("../utils/auth");

/**
 * Protects a route. On success, attaches req.userId for downstream
 * handlers. On any failure (missing header, invalid token, expired
 * token) responds 401 — the frontend's auto-logout depends on exactly
 * this status code (see docs/frontend-handoff.md, Section 2).
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

module.exports = requireAuth;
