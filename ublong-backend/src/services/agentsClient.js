const config = require("../config/env");
const { streamMockAgentPipeline } = require("./mockAgents");
const { sendSSE } = require("../utils/helpers");

async function isAgentsServiceHealthy() {
  if (config.useMockAgents) return false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${config.agentsServiceUrl}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Process a case through the agent pipeline.
 * Relays SSE from Python service when available, otherwise uses mock.
 */
async function processCase(intake, res, onComplete) {
  const healthy = await isAgentsServiceHealthy();

  if (!healthy) {
    console.log("Using mock agent pipeline (Python service unavailable or USE_MOCK_AGENTS=true)");
    await streamMockAgentPipeline(
      intake,
      (event) => sendSSE(res, event),
      onComplete
    );
    return;
  }

  const agentRes = await fetch(`${config.agentsServiceUrl}/api/agents/process-case`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(intake),
  });

  if (!agentRes.ok || !agentRes.body) {
    throw new Error(`Agents service returned ${agentRes.status}`);
  }

  const reader = agentRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (!raw) continue;

      try {
        const event = JSON.parse(raw);
        sendSSE(res, event);
        if (event.type === "result") {
          finalResult = event.data;
        }
      } catch {
        // skip malformed chunks
      }
    }
  }

  if (finalResult) {
    onComplete(finalResult);
  }
}

module.exports = { processCase, isAgentsServiceHealthy };
