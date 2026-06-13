const express = require("express");
const cors = require("cors");
const config = require("./config/env");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/auth");
const caseRoutes = require("./routes/cases");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { isAgentsServiceHealthy } = require("./services/agentsClient");

const app = express();

app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", async (_req, res) => {
  const agentsHealthy = await isAgentsServiceHealthy();
  res.json({
    status: "ok",
    service: "ublong-backend",
    mongodb: "connected",
    agents_service: agentsHealthy ? "connected" : "mock_mode",
    demo_mode: config.demoMode,
  });
});

app.use("/auth", authRoutes);
app.use("/cases", caseRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`UBlong backend running on http://localhost:${config.port}`);
    console.log(`Mock agents: ${config.useMockAgents ? "enabled" : "disabled"}`);
    console.log(`Demo mode: ${config.demoMode ? "enabled" : "disabled"}`);
  });
}

start();
