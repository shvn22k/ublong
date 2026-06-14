const jwt = require("jsonwebtoken");
const config = require("../config/env");
const User = require("../models/User");

async function authenticate(req, res, next) {
  if (config.demoMode) {
    const demo = await User.findOne({ email: "demo@ublong.org" });
    if (!demo) {
      return res.status(503).json({
        error: "Demo mode enabled but demo user not found. Run: npm run seed",
      });
    }
    req.user = { _id: demo._id, email: demo.email, name: demo.name };
    return next();
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { _id: payload.sub, email: payload.email, name: payload.name };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { authenticate };
