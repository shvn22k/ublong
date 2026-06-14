require("dotenv").config();

module.exports = {
  port: parseInt(process.env.PORT || "3000", 10),
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/ublong",
  jwtSecret: process.env.JWT_SECRET || "ublong-dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  agentsServiceUrl: process.env.AGENTS_SERVICE_URL || "http://localhost:8000",
  useMockAgents: process.env.USE_MOCK_AGENTS !== "false",
  demoMode: process.env.DEMO_MODE === "true",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001,http://localhost:5173")
    .split(",")
    .map((o) => o.trim()),
};
