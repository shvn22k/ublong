// Thin client for the Ublong Node backend.
// The backend runs in DEMO_MODE (no JWT required) for the hackathon demo, so we
// call /cases directly. Override the base URL with NEXT_PUBLIC_API_URL if needed.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

// Demo mode: run the whole pipeline client-side with mock data (no backend,
// Mongo, or OpenAI). Default ON so a fresh checkout records a working demo with
// zero setup. Set NEXT_PUBLIC_USE_MOCK=false to hit the real backend.
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

// Intake payload — the backend's normalizeIntake accepts these camelCase keys
// and maps them to the agents' CaseInput.
export interface CaseIntake {
  childName?: string;
  dob: string;
  gender?: string;
  fatherName?: string;
  motherName?: string;
  countryOfBirth: string;
  currentCountry: string;
  currentLocation?: string;
  fatherNationality?: string;
  motherNationality?: string;
  documentsHeld?: string[];
  notes?: string;
}

export interface CaseResult {
  case_id: string;
  legal_pathway: string;
  required_documents: string[];
  available_substitutes: string[];
  missing_documents: string[];
  submission_office: string;
  estimated_timeline: string;
  cover_letter_draft: string;
  confidence_score: number;
  country_specific_notes: string[];
  intake_summary?: Record<string, unknown>;
  research_summary?: Record<string, unknown>;
  gap_summary?: Record<string, unknown>;
}

// Unified shape after normalising the backend's mock + real event streams.
export interface StreamEvent {
  type: string; // agent_start | agent_thinking | agent_complete | result | error
  agent?: string;
  message?: string;
  data?: CaseResult;
}

interface CaseDoc {
  _id: string;
  status: string;
}

async function jsonOrThrow(res: Response, context: string) {
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body.error || body.message || JSON.stringify(body);
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new Error(`${context} failed (${res.status}): ${detail}`);
  }
  return res.json();
}

/** Create a case record and return its id. */
export async function createCase(intake: CaseIntake): Promise<CaseDoc> {
  const res = await fetch(`${API_BASE}/cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(intake),
  });
  return jsonOrThrow(res, "Create case");
}

/**
 * Trigger the agent pipeline for a case and stream events as they arrive.
 * Uses fetch streaming (POST + SSE) since EventSource only supports GET.
 * Returns the final CaseResult once the stream completes.
 */
export async function processCase(
  caseId: string,
  onEvent: (ev: StreamEvent) => void,
  signal?: AbortSignal
): Promise<CaseResult | null> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
  });

  if (!res.ok || !res.body) {
    await jsonOrThrow(res, "Process case");
    return null;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult: CaseResult | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const raw = line.slice(5).trim();
      if (!raw) continue;

      try {
        const ev = JSON.parse(raw) as StreamEvent;
        if (ev.type === "result" && ev.data) {
          finalResult = ev.data;
        }
        onEvent(ev);
      } catch {
        // ignore malformed chunks
      }
    }
  }

  return finalResult;
}

/** Convenience: create a case then run the pipeline, streaming events. */
export async function submitAndProcess(
  intake: CaseIntake,
  onEvent: (ev: StreamEvent) => void,
  signal?: AbortSignal
): Promise<CaseResult | null> {
  if (USE_MOCK) {
    // Lazy import so the mock data is only pulled in when needed.
    const { runMockPipeline } = await import("./mockPipeline");
    return runMockPipeline(intake, onEvent, signal);
  }
  const caseDoc = await createCase(intake);
  return processCase(caseDoc._id, onEvent, signal);
}
