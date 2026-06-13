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

### 4. Frontend (port 3000)
```bash
cd ublong-frontend
npm install
npm run dev
```

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

The three services were built in parallel and are at different integration depths:

- **agents ↔ backend** — wired and contract-aligned. The backend relays the agents' SSE stream and stores the result. Defaults to a self-contained mock pipeline so the backend is fully usable without the Python service or an OpenAI key.
- **frontend** — currently a **standalone, self-contained demo**. The pipeline animation is client-side (`runCaseSimulation` in `ublong-frontend/src/context/AppContext.tsx`); it does **not** yet call the backend. Wiring it to the backend (auth → `POST /cases` → SSE → results) is the remaining integration task.

### Known content gap
`ublong-agents/data/legal_docs/` ships empty. The research agent runs but has no jurisdiction-specific legal context until `BD.md` / `LB.md` / `KE.md` are added — the RAG layer degrades gracefully to general principles.

---

See [Ublong_Project_Documentation.md](Ublong_Project_Documentation.md) for the full product/architecture spec.
