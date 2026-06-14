<div align="center">

# Ublong

### *Every Child Belongs.*

**An autonomous multi-agent AI system that converts a stateless or refugee child's situation into a concrete, grounded birth-registration plan — legal pathway, required documents, accepted substitutes, gap analysis, and a ready-to-submit cover letter — in under two minutes.**

`Python` · `FastAPI` · `LangGraph` · `OpenAI GPT-4o` · `ChromaDB` · `Node.js` · `Express` · `MongoDB` · `Next.js` · `React` · `Tailwind`

*FAR AWAY Hackathon 2026 — Agentic & Autonomous Systems*

</div>

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [The Solution](#2-the-solution)
3. [Key Features](#3-key-features)
4. [System Architecture (HLD)](#4-system-architecture-hld)
5. [The Agent Pipeline](#5-the-agent-pipeline)
6. [Request Lifecycle / Data Flow](#6-request-lifecycle--data-flow)
7. [Data Contracts](#7-data-contracts)
8. [RAG Design](#8-rag-design)
9. [Streaming Design (SSE)](#9-streaming-design-sse)
10. [Tech Stack](#10-tech-stack)
11. [Repository Structure](#11-repository-structure)
12. [API Reference](#12-api-reference)
13. [Getting Started](#13-getting-started)
14. [Configuration](#14-configuration)
15. [Supported Countries](#15-supported-countries)
16. [Design Decisions & Trade-offs](#16-design-decisions--trade-offs)
17. [Roadmap & Known Limitations](#17-roadmap--known-limitations)
18. [Disclaimer](#18-disclaimer)

---

## 1. The Problem

> **An estimated 150 million children under five have never been registered at birth.** Without a birth certificate, a child cannot enrol in school, access healthcare, be protected from trafficking or detention, or ever prove who they are.

The children most affected are those of refugees, stateless people, and undocumented migrants. The cruel irony: to register a child, most governments require proof of the parents' identity — which displaced families often lack. The child stays legally invisible.

This is not an awareness problem; it is an **execution** problem. The legal pathway to register a child is:

- **Different in every country**, full of exceptions only experienced lawyers know.
- **Dependent on which documents a family happens to still have.**
- **Constantly changing** as governments update policy.

A caseworker in a refugee camp can spend **six hours** determining the correct process for **one** child — while carrying hundreds of cases. The system fails because human bandwidth runs out.

---

## 2. The Solution

Ublong is **not a chatbot and not a search engine.** It is a pipeline of specialised AI agents, each doing one job, that together replace hours of expert research with an automated, grounded, and auditable output.

The name: **You + Belong = Ublong.** Because every child belongs — in a school, a clinic, a legal record, the world.

For every case, Ublong returns:

- The **legal framework** that applies to this specific child.
- A **step-by-step registration pathway** for the country and case type.
- The **complete list of required documents**.
- **Legally accepted substitutes** when originals are missing.
- A **gap analysis**: what the family has, what's covered by a substitute, what is genuinely blocked.
- A **professionally drafted cover letter**, ready to submit.
- The **submission office**, **estimated timeline**, and a **confidence score**.
- Automatic **escalation flagging** for high-complexity cases that need a human lawyer.

Crucially, the Research Agent is **RAG-grounded**: it answers *only* from a curated corpus of legal documents and explicitly states when context is insufficient. It does not invent law.

---

## 3. Key Features

| Capability | Detail |
|---|---|
| **Multi-agent orchestration** | A LangGraph `StateGraph` runs Intake → Research → Gap Analysis with conditional human-review routing. |
| **Grounded legal reasoning** | RAG over per-country legal corpora (ChromaDB + OpenAI embeddings); no hallucinated statutes. |
| **Real-time reasoning stream** | Every agent's thinking is streamed token-by-token to the UI over SSE. |
| **Document gap analysis** | Compares required vs. held documents and classifies each gap as *substitutable* or *blocked*. |
| **Auto-drafted cover letters** | Compassionate, legally-anchored letters generated per case. |
| **Escalation flagging** | Cases with `complexity_score > 4` are flagged for human legal review. |
| **Zero-setup demo mode** | The frontend can run the entire flow client-side with mock data — no backend, DB, or API key. |
| **Pluggable countries** | Add a jurisdiction by dropping one Markdown file into the legal corpus. |

---

## 4. System Architecture (HLD)

Ublong is a **three-service architecture**. Each service is independently runnable and has a clean contract with its neighbours.

```
                                   ┌──────────────────────────────────────────────┐
                                   │                   CASEWORKER                   │
                                   │            (browser, refugee camp)             │
                                   └───────────────────────┬──────────────────────┘
                                                           │  HTTPS
                                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│  FRONTEND  ·  Next.js 15 + React 19 + Tailwind        (port 3001)                                  │
│  ─────────────────────────────────────────────────────────────────────────────                   │
│  • Intake form  • Live agent console  • Result + cover-letter view                                 │
│  • lib/api.ts  ── NEXT_PUBLIC_USE_MOCK ──┐                                                          │
│                                          │                                                          │
│             ┌────────────────────────────┴───────────────────────────┐                            │
│             │ true  → lib/mockPipeline.ts (fully client-side, no net)  │                            │
│             │ false → fetch() POST + SSE stream  ────────────────────┐ │                            │
│             └────────────────────────────────────────────────────────┘ │                           │
└─────────────────────────────────────────────────────────────────────────┼────────────────────────┘
                                                                            │  REST + SSE
                                                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│  BACKEND  ·  Node.js + Express + Mongoose             (port 3000)                                  │
│  ─────────────────────────────────────────────────────────────────────────────                   │
│  • JWT auth / DEMO_MODE     • Case CRUD      • SSE relay & event translation                       │
│  • USE_MOCK_AGENTS ──┐                                                                             │
│      ┌───────────────┴───────────────┐                  ┌───────────────────────────┐             │
│      │ true  → services/mockAgents.js │                  │        MongoDB            │             │
│      │ false → services/agentsClient  │◄──── stores ────►│  (port 27017)             │             │
│      └───────────────┬───────────────┘                  │  cases · users            │             │
└──────────────────────┼──────────────────────────────────└───────────────────────────┘────────────┘
                       │  HTTP POST  /api/agents/process-case   (SSE back)
                       ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AGENTS SERVICE  ·  Python + FastAPI + LangGraph      (port 8000)                                  │
│  ─────────────────────────────────────────────────────────────────────────────                   │
│                                                                                                    │
│   CaseInput ─► [ Intake ] ─► [ Research ] ─► [ Gap Analysis ] ─► [ Assemble ] ─► CaseResult        │
│                                  │                                                                  │
│                                  ▼  retrieve(k=5, filter=country)                                   │
│                         ┌──────────────────┐      ┌───────────────────────────────┐                │
│                         │   ChromaDB       │◄─────│  data/legal_docs/ BD·LB·KE .md │                │
│                         │  (embedded)      │      └───────────────────────────────┘                │
│                         └──────────────────┘                                                        │
│                                  ▲                                                                  │
│                                  │  embeddings + completion                                         │
│                         ┌──────────────────┐                                                        │
│                         │   OpenAI API     │   GPT-4o · text-embedding-3-small                      │
│                         └──────────────────┘                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Two independent "mock switches"** make the system demoable at any depth:

| Switch | Service | Effect when ON |
|---|---|---|
| `NEXT_PUBLIC_USE_MOCK` | frontend | Entire pipeline runs in-browser with mock data — no backend at all. |
| `USE_MOCK_AGENTS` | backend | Backend serves a deterministic mock pipeline — no Python service or OpenAI key. |

---

## 5. The Agent Pipeline

The orchestrator (`ublong-agents/app/agents/orchestrator.py`) is a compiled LangGraph `StateGraph` over a shared `AgentState`. Each node enriches the state; a `contextvar` carries the live event queue into every node so agents can stream without polluting state.

```
            ┌─────────┐
   START ──►│ intake  │   classify jurisdiction, case_type, flags, complexity_score (1–5)
            └────┬────┘
                 │
                 ▼
            ┌──────────┐
            │ research │   RAG retrieve (k=5, country filter) ─► pathway, required_docs,
            └────┬─────┘   legal_basis, substitutes   (grounded ONLY in retrieved context)
                 │
                 ▼
          ┌──────────────┐
          │ gap_analysis │  held vs required ─► missing, covered_by_substitutes,
          └──────┬───────┘  truly_blocked, cover_letter, recommendation
                 │
                 ▼
           ⟨ complexity_score > 4 ? ⟩
            │                    │
       yes  │                    │  no
            ▼                    │
      ┌─────────────┐            │
      │ flag_review │            │   emit human-review warning event
      └──────┬──────┘            │
             │                   │
             └────────►┌─────────▼──────┐
                       │    assemble    │   build final CaseResult:
                       └────────┬───────┘   pathway, docs, substitutes, blockers,
                                │            office, timeline, confidence, notes,
                                ▼            cover letter + per-agent summaries
                              END  ─────────► CaseResult
```

### Agent responsibilities

| Agent | Model / temp | Input | Output (`*Result`) |
|---|---|---|---|
| **Intake** | GPT-4o · 0.0 | `CaseInput` | `jurisdiction`, `case_type`, `flags[]`, `complexity_score` |
| **Research** | GPT-4o · 0.0 | `IntakeResult` + `CaseInput` + RAG context | `pathway_steps[]`, `required_docs[]`, `legal_basis`, `substitutes{}` |
| **Gap Analysis** | GPT-4o · 0.2 | `ResearchResult` + `CaseInput` | `missing_docs[]`, `covered_by_substitutes[]`, `truly_blocked[]`, `cover_letter`, `recommendation` |

Each agent uses a `PydanticOutputParser` for structured output and falls back to a safe default object if parsing fails, so a single malformed LLM response never crashes the pipeline.

`confidence_score = 1.0 − (len(truly_blocked) / max(len(required_docs), 1))`.

---

## 6. Request Lifecycle / Data Flow

End-to-end, with the real backend (`USE_MOCK_AGENTS=false`, `NEXT_PUBLIC_USE_MOCK=false`):

```
Caseworker            Frontend (3001)        Backend (3000)         Agents (8000)        Mongo
    │                      │                      │                      │                 │
    │  fill + submit       │                      │                      │                 │
    ├─────────────────────►│  POST /cases         │                      │                 │
    │                      ├─────────────────────►│  validate + create   │                 │
    │                      │                      ├──────────────────────┼────────────────►│ insert case (pending)
    │                      │◄─────────────────────┤  201 { _id }         │                 │
    │                      │  POST /cases/:id/process                     │                 │
    │                      ├─────────────────────►│  set status=processing                  │
    │                      │                      ├─────────────────────►│ POST /api/agents/process-case
    │                      │                      │                      │  run StateGraph │
    │                      │   SSE: agent_thinking │◄───── SSE AgentEvent─┤  (token stream) │
    │   live console ◄─────┤◄─────(translated)─────┤                      │                 │
    │                      │   SSE: result         │◄───── result event ──┤                 │
    │                      │                      ├──────────────────────┼────────────────►│ save CaseResult,
    │   result + letter ◄──┤◄─────────────────────┤  status=completed /   │                 │ status update
    │                      │                      │  flagged_for_review   │                 │
```

The backend's `agentsClient.js` translates the agents' native `AgentEvent` shape (`event_type` / `agent_name` / `content`) into the `{ type, agent, message, data }` shape the frontend consumes, and parses the final `CaseResult` JSON out of the terminal `result` event.

---

## 7. Data Contracts

### `CaseInput` (intake)
The Pydantic model accepts both agents-native and backend-canonical field names via aliases.

```jsonc
{
  "child_birth_country": "Bangladesh",   // alias: country_of_birth
  "child_birth_date":    "2024-11-03",   // alias: date_of_birth
  "child_current_country": "Bangladesh", // alias: current_country
  "father_nationality":  "Myanmar (Rohingya)",
  "mother_nationality":  "Myanmar (Rohingya)",
  "parents_documents_held": ["UNHCR Family Registration Card"],
  "child_age_months":    7,
  "additional_context":  "Father missing since 2023; camp birth, no health record."
}
```

### `CaseResult` (final output)

```jsonc
{
  "case_id": "uuid",
  "legal_pathway": "1. …\n2. …",
  "required_documents": ["…"],
  "available_substitutes": ["…"],
  "missing_documents": ["…"],          // the truly-blocked set
  "submission_office": "…",
  "estimated_timeline": "2–4 weeks",
  "cover_letter_draft": "…",
  "confidence_score": 0.82,
  "country_specific_notes": ["late_registration", "…"],
  "intake_summary":   { "jurisdiction": "…", "case_type": "…", "flags": ["…"], "complexity_score": 4 },
  "research_summary": { "legal_basis": "…" },
  "gap_summary":      { "recommendation": "…" }
}
```

### `AgentEvent` (stream frame, agents service)

```jsonc
{ "event_type": "thinking" | "result" | "error", "agent_name": "research", "content": "…", "timestamp": "ISO-8601" }
```

---

## 8. RAG Design

```
data/legal_docs/{BD,LB,KE}.md
        │
        │  RecursiveCharacterTextSplitter(chunk_size=500, overlap=50)
        ▼
   chunks ── tagged metadata { country_code: "BD", source }
        │
        │  OpenAIEmbeddings("text-embedding-3-small")
        ▼
   ChromaDB (embedded, persisted to data/chroma_db)
        ▲
        │  retriever: k=5, filter={ country_code }
        │
 Research Agent query: "birth registration {case_type} refugee stateless {jurisdiction}"
```

- Documents are loaded and embedded once at FastAPI startup (`load_all_documents`), with `reload_document(country_code)` for hot-reloading a single jurisdiction.
- **Country normalisation:** cases carry full names (`"Bangladesh"`); chunks are tagged with file codes (`"BD"`). `retriever.normalize_country_code` maps `Bangladesh → BD`, `Lebanon → LB`, `Kenya → KE` so the metadata filter matches.
- If no documents match, the Research Agent is told context is insufficient and degrades to general principles rather than fabricating law.

---

## 9. Streaming Design (SSE)

Server-Sent Events were chosen over WebSockets: the data flow is strictly **server → client**, so SSE gives reliable, proxy-friendly, auto-reconnecting streaming with zero handshake complexity.

- The agents service emits `AgentEvent` frames onto an `asyncio.Queue`; the FastAPI route drains the queue to the HTTP response as `data: {json}\n\n`.
- The backend relays and **translates** frames, then persists the final result.
- The frontend reads the POST response body with a streaming `fetch` reader (not `EventSource`, which is GET-only), parses `data:` lines, and updates the live console + result view.

---

## 10. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Agents | **Python · FastAPI** | Native home for LangChain/LangGraph; first-class async + streaming. |
| Orchestration | **LangGraph `StateGraph`** | Explicit multi-agent state machine with conditional routing. |
| LLM | **OpenAI GPT-4o** | Strong structured-output and legal-reasoning instruction following. |
| Embeddings | **text-embedding-3-small** | Cheap, fast, accurate retrieval. |
| Vector store | **ChromaDB (embedded)** | No separate server; trivial to run and persist. |
| Backend | **Node.js · Express · Mongoose** | Fast JSON APIs, easy Mongo integration, SSE relay. |
| Database | **MongoDB** | Flexible schema for variable-shape case documents. |
| Auth | **JWT · bcryptjs** | Stateless token auth; `DEMO_MODE` bypass for demos. |
| Frontend | **Next.js 15 · React 19 · Tailwind v4** | App Router, Turbopack, modern component model. |
| UI/Motion | **framer-motion · GSAP · Lenis · Leaflet** | Polished, cinematic caseworker dashboard. |
| Infra | **Docker Compose** | One command for MongoDB + agents. |

---

## 11. Repository Structure

```
ublong/
├── README.md
├── docker-compose.yml                  # MongoDB + agents service
├── Ublong_Project_Documentation.md     # product/architecture spec
│
├── ublong-agents/                      # ── Python · FastAPI · LangGraph (8000)
│   ├── main.py                         # app entrypoint; loads RAG corpus on startup
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── app/
│   │   ├── agents/
│   │   │   ├── orchestrator.py         # LangGraph StateGraph + run_pipeline
│   │   │   ├── intake_agent.py         # Agent 1 — classification
│   │   │   ├── research_agent.py       # Agent 2 — RAG legal pathway
│   │   │   └── gap_analysis_agent.py   # Agent 3 — gap analysis + cover letter
│   │   ├── rag/
│   │   │   ├── loader.py               # chunk + embed → ChromaDB
│   │   │   └── retriever.py            # per-country filtered retriever
│   │   ├── models/case.py              # Pydantic: CaseInput, CaseResult, AgentEvent
│   │   ├── api/routes.py               # POST /api/agents/process-case (SSE)
│   │   └── utils/streaming.py          # event/queue helpers
│   └── data/legal_docs/                # BD.md, LB.md, KE.md (RAG corpus)
│
├── ublong-backend/                     # ── Node · Express · MongoDB (3000)
│   └── src/
│       ├── index.js                    # app bootstrap, health, CORS
│       ├── config/                     # env.js, db.js
│       ├── middleware/                 # auth.js (JWT/DEMO_MODE), errorHandler.js
│       ├── models/                     # Case.js, User.js
│       ├── routes/                     # auth.js, cases.js
│       ├── services/                   # agentsClient.js (relay), mockAgents.js
│       ├── scripts/seed.js             # demo user + 3 pre-loaded cases
│       └── utils/                      # validation.js, helpers.js (SSE)
│
└── ublong-frontend/                    # ── Next.js · React · Tailwind (3001)
    └── src/
        ├── app/                        # App Router pages, layout, globals
        ├── components/
        │   ├── ChildRegistrationForm.tsx   # intake + live stream + result
        │   ├── CaseResultView.tsx          # structured result + cover letter
        │   └── …                           # Hero, AgentActivityShowcase, maps, …
        ├── context/AppContext.tsx      # theme, language, demo simulation state
        └── lib/
            ├── api.ts                  # backend client + mock switch
            └── mockPipeline.ts         # fully client-side mock pipeline
```

---

## 12. API Reference

### Agents Service — `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Liveness check. |
| `GET` | `/api/agents/health` | Agent roster + status. |
| `POST` | `/api/agents/process-case` | Accepts `CaseInput`; returns an **SSE stream** of `AgentEvent`s. Final frame is `event_type:"result"` with the serialised `CaseResult`. |

### Backend — `http://localhost:3000`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Create caseworker account → JWT. |
| `POST` | `/auth/login` | — | Login → JWT. |
| `POST` | `/cases` | JWT/Demo | Create a case from intake. |
| `GET` | `/cases` | JWT/Demo | List the caseworker's cases. |
| `GET` | `/cases/:id` | JWT/Demo | Fetch a single case + result. |
| `PATCH` | `/cases/:id` | JWT/Demo | Update case status. |
| `POST` | `/cases/:id/process` | JWT/Demo | Run the pipeline; returns an **SSE stream**. |
| `GET` | `/cases/:id/documents` | JWT/Demo | Generated documents (cover letter, checklist, pathway). |

---

## 13. Getting Started

### Prerequisites
Node.js 18+, Python 3.11+, Docker (for MongoDB), and — only for the real agent pipeline — an OpenAI API key.

### Option A — Frontend-only demo (zero setup)
The frontend ships with `NEXT_PUBLIC_USE_MOCK=true`, running the whole flow in-browser with mock data. No backend, DB, Docker, or API key.

```bash
cd ublong-frontend
npm install
npm run dev            # http://localhost:3001
```
Open the site → **Child Registration Intake** → fill the form → **Submit**. Watch the live agent stream and the generated result + cover letter.

### Option B — Full stack

```bash
# 1) MongoDB
docker compose up -d mongodb

# 2) Backend (port 3000)
cd ublong-backend
cp .env.example .env          # ships with DEMO_MODE=true, USE_MOCK_AGENTS=true
npm install
npm run seed                  # demo user + 3 pre-loaded cases
npm run dev

# 3) Agents service (port 8000) — only if USE_MOCK_AGENTS=false
cd ../ublong-agents
cp .env.example .env          # set OPENAI_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload

# 4) Frontend (port 3001)
cd ../ublong-frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_USE_MOCK=false to hit the backend
npm install
npm run dev
```

Demo login (when not in `DEMO_MODE`): `demo@ublong.org` / `demo123`.

> **Ports:** frontend `3001`, backend `3000`, agents `8000`, MongoDB `27017`. The frontend runs on 3001 because the backend owns 3000; the backend's CORS allow-list already includes `localhost:3001`.

---

## 14. Configuration

### Backend (`ublong-backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port. |
| `MONGODB_URI` | `mongodb://localhost:27017/ublong` | Mongo connection string. |
| `JWT_SECRET` | — | Token signing secret (set in production). |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime. |
| `AGENTS_SERVICE_URL` | `http://localhost:8000` | Python agents base URL. |
| `USE_MOCK_AGENTS` | `true` | Serve the built-in mock pipeline instead of calling Python. |
| `DEMO_MODE` | `true` | Bypass JWT auth using the seeded demo user. |
| `CORS_ORIGINS` | `…:3000,3001,5173` | Allowed origins. |

### Agents (`ublong-agents/.env`)

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | — | Required for real GPT-4o + embeddings. |
| `CHROMA_PERSIST_DIR` | `./data/chroma_db` | Vector store path. |
| `LEGAL_DOCS_DIR` | `./data/legal_docs` | RAG corpus path. |
| `PORT` | `8000` | HTTP port. |

### Frontend (`ublong-frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_USE_MOCK` | `true` | Run the pipeline client-side with mock data. |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | Backend URL (used when mock is off). |

---

## 15. Supported Countries

Deep legal data is pre-loaded for three jurisdictions. Add another by dropping an `XX.md` file into `ublong-agents/data/legal_docs/`.

| Code | Country | Primary population | Key legal framework |
|---|---|---|---|
| `BD` | Bangladesh | Rohingya refugees, Cox's Bazar (1M+) | RRRC Proof-of-Birth process; UNHCR/RRRC registration |
| `LB` | Lebanon | Syrian (1.5M) & Palestinian refugees | Civil Code Decree 3260; MoI facilitation circulars |
| `KE` | Kenya | Dadaab & Kakuma residents (650K+) | Births & Deaths Registration Act; Refugees Act 2021 |

---

## 16. Design Decisions & Trade-offs

- **LangGraph over ad-hoc function calls** — an explicit `StateGraph` makes the pipeline inspectable, gives conditional routing (human-review) for free, and keeps per-agent state isolated.
- **RAG-grounded research** — the Research Agent answers only from retrieved legal text and declares insufficiency, trading some recall for trustworthiness (essential in a legal context).
- **Two mock layers** — frontend and backend mocks let any layer be demoed or developed in isolation, and keep the live demo resilient to backend/Docker issues.
- **SSE over WebSockets** — one-directional streaming with less operational overhead.
- **Microservices** — Python owns AI, Node owns persistence/auth, React owns UX; each team and runtime evolves independently behind stable contracts.
- **Graceful LLM fallbacks** — every agent returns a safe default on parse failure, so one bad generation never breaks a case.

---

## 17. Roadmap & Known Limitations

- **Token-level stream noise** — the real agents emit per-token `thinking` events; these can be batched into per-agent summaries for a cleaner live console.
- **Marketing vs. app** — the landing-page sections (Hero, Mission Control showcase, maps) remain standalone animations and are intentionally not backend-driven; the **intake form** is the live, wired surface.
- **Legal corpus depth** — the three country documents are simplified operational references; production use requires lawyer-reviewed source material.
- **Out of MVP scope** — real government submission, follow-up tracking, cover-letter translation, mobile app, and production hosting.
- **Containerisation** — `docker-compose.yml` covers MongoDB + agents; the backend and frontend currently run via `npm` (Dockerfiles pending).

---

## 18. Disclaimer

Ublong is decision-support tooling for caseworkers, **not legal advice**. The bundled legal documents are simplified references for triage and demonstration. Always verify against current, authoritative sources and escalate complex or contested cases to a qualified legal professional. High-complexity cases are flagged automatically for exactly this reason.

<div align="center">

---

**Ublong** — *Every Child Belongs.*

</div>
