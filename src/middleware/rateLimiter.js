const rateLimit = require("express-rate-limit");

const tooMany = (message) => (req, res) =>
  res.status(429).json({ success: false, message });

/** Broad safety net for the whole API. */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooMany("Too many requests. Please try again later."),
});

/** Tight limit on the credential endpoints to slow down brute force attempts. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooMany("Too many attempts. Please try again later."),
});

module.exports = { apiLimiter, authLimiter };
