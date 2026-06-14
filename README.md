# Ublong — Every Child Belongs

> An autonomous multi-agent AI system that turns a stateless/refugee child's situation into a concrete birth-registration pathway: required documents, legal substitutes, gap analysis, and a ready-to-submit cover letter.
>
> *FAR AWAY Hackathon 2026 — Agentic & Autonomous Systems.*

This is a monorepo with three independent services.

```
ublong/
├── ublong-agents/    # Python · FastAPI · LangGraph — the 3-agent pipeline + RAG  (port 8000)
├── ublong-backend/   # Node · Express · MongoDB — case management, auth, SSE relay (port 3000)
├── ublong-frontend/  # Next.js · React · Tailwind — caseworker dashboard UI        (port 3000 dev)
└── docker-compose.yml
```

---

## Demo mode (frontend only — no backend needed)

For a screen-recorded demo you can run **just the frontend**. It ships with `NEXT_PUBLIC_USE_MOCK=true` (the default), which runs the entire pipeline client-side with mock data — no backend, MongoDB, Docker, or OpenAI key.

```bash
cd ublong-frontend
npm install
npm run dev          # http://localhost:3001
```
Open the site → **Child Registration Intake** → fill the form (try **Current Country: Bangladesh**, location "Kutupalong Camp, Cox's Bazar") → Submit. You'll see the live agent stream and a full result (pathway, document gaps, cover letter). Set `NEXT_PUBLIC_USE_MOCK=false` to drive the real backend instead (see below).

---

## Quick start

### 0. Prerequisites
- Node.js 18+, Python 3.11+, Docker (for MongoDB), and an OpenAI API key (only for the real agent pipeline).

### 1. MongoDB
```bash
docker compose up -d mongodb
```

### 2. Backend (port 3000)
```bash
cd ublong-backend
cp .env.example .env          # set JWT_SECRET; leave USE_MOCK_AGENTS=true for the no-key demo
npm install
npm run seed                  # creates demo user + 3 pre-loaded cases
npm run dev
```
Demo login: `demo@ublong.org` / `demo123`

### 3. Agents service (port 8000) — optional, only for the *real* pipeline
```bash
cd ublong-agents
cp .env.example .env          # set OPENAI_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload
```
Then set `USE_MOCK_AGENTS=false` in the backend `.env` to route cases through the real agents.

### 4. Frontend (port 3001)
```bash
cd ublong-frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL — defaults to http://localhost:3000
npm install
npm run dev
```
The frontend runs on **port 3001** (the backend owns 3000). Open <http://localhost:3001>, scroll to
**Child Registration Intake**, fill the form, and submit — the intake form POSTs to the backend and
streams the live agent run + final result. The backend's `.env.example` ships with `DEMO_MODE=true`,
so no login is required (it uses the seeded demo caseworker). Run `npm run seed` in the backend first.

---

## API keys / secrets you need

| Variable | Service | Required when | Notes |
|---|---|---|---|
| `OPENAI_API_KEY` | agents | Running the **real** agent pipeline (GPT-4o + embeddings) | Not needed in mock mode |
| `JWT_SECRET` | backend | Always | Any long random string |
| `MONGODB_URI` | backend | Always | Defaults to local `mongodb://localhost:27017/ublong` |

**Mock mode (`USE_MOCK_AGENTS=true`, the default) needs no OpenAI key** — the backend serves a built-in deterministic pipeline for the 3 demo countries (Bangladesh, Lebanon, Kenya).

---

## Current integration status (read this)

All three services are now wired end to end:

- **agents ↔ backend** — contract-aligned. The backend relays the agents' SSE stream and stores the result. Defaults to a self-contained mock pipeline, so it is fully usable without the Python service or an OpenAI key.
- **frontend ↔ backend** — the **Child Registration Intake** form POSTs to `POST /cases`, then consumes `POST /cases/:id/process` as a live SSE stream ([src/lib/api.ts](ublong-frontend/src/lib/api.ts)), rendering each agent's progress and the final `CaseResult` ([src/components/CaseResultView.tsx](ublong-frontend/src/components/CaseResultView.tsx)). Auth is bypassed via `DEMO_MODE`.
- The marketing sections (Hero, "Mission Control" showcase, maps, stories) remain a standalone animated demo and are intentionally not backend-driven.

### Legal knowledge base
`ublong-agents/data/legal_docs/` ships with `BD.md`, `LB.md`, and `KE.md` — caseworker-reference legal guidance for Bangladesh, Lebanon, and Kenya. On startup the agents service chunks and embeds these into ChromaDB; the research agent retrieves the top-k chunks filtered by country. Add a new country by dropping in another `XX.md` file. (These are simplified operational references for triage, not legal advice.)

---

See [Ublong_Project_Documentation.md](Ublong_Project_Documentation.md) for the full product/architecture spec.
