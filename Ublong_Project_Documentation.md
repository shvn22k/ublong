# Ublong — Project Documentation
**Every Child Belongs.**
*FAR AWAY Hackathon 2026 | Agentic & Autonomous Systems | Team of 5*

---

## Table of Contents
1. [The Problem](#1-the-problem)
2. [Our Solution — What Is Ublong?](#2-our-solution--what-is-ublong)
3. [Who Uses Ublong?](#3-who-uses-ublong)
4. [How The System Works — End to End](#4-how-the-system-works--end-to-end)
5. [The Agent Pipeline — Detailed Walkthrough](#5-the-agent-pipeline--detailed-walkthrough)
6. [System Architecture](#6-system-architecture)
7. [Tech Stack](#7-tech-stack)
8. [Repository Structure](#8-repository-structure)
9. [MongoDB Schemas](#9-mongodb-schemas)
10. [API Reference](#10-api-reference)
11. [The 3 Supported Countries (MVP Scope)](#11-the-3-supported-countries-mvp-scope)
12. [Team Roles & Responsibilities](#12-team-roles--responsibilities)
13. [Demo Script](#13-demo-script)
14. [What We Are NOT Building (MVP Limits)](#14-what-we-are-not-building-mvp-limits)

---

## 1. The Problem

> **150 million children under age 5 were never registered at birth. They are legally invisible — no name in any government's records, no access to healthcare, education, or legal protection.**

These are not hypothetical children. They are the children of refugees, conflict survivors, stateless people, and undocumented migrants. Their parents are overwhelmed, often do not speak the host country's language, and are navigating a legal maze that changes by country, by year, and by case type.

### The Cruel Irony

To register a child, most governments require proof of the parent's identity. Refugees often have nothing. The child stays invisible. Without a birth certificate, a child cannot:

- Enrol in school
- Access healthcare
- Be legally protected from trafficking or detention
- Apply for any status document as they grow up
- Prove who they are — ever

### Why Hasn't This Been Solved?

It is not a lack of awareness. UNICEF, UNHCR, and the UN have been writing reports about this for decades. The problem is execution. The legal pathway to register a child is:

- Different in every country
- Full of exceptions that only experienced lawyers know about
- Dependent on what documents a family happens to still have
- Constantly changing as governments update policies

A caseworker at an NGO in Cox's Bazar, Bangladesh can spend 6 hours just figuring out which form to file — for one child. They have hundreds of cases. The system fails because human bandwidth runs out.

### The Gap In Existing Tools

| Tool / Organisation | What They Do | Why It Fails Caseworkers |
|---|---|---|
| UNICEF / Open CRVS | Helps governments build registration systems | Backend infrastructure. Doesn't help individual families |
| UNHCR Guides | PDF guides for each country | Static, outdated, requires expert to interpret |
| RefAid App | Directory of nearby legal aid offices | Just a phone book. No autonomous action |
| SkipLegal / Legal.io | AI immigration tools | US-only. Not statelessness-specific |
| Manual casework | Trained humans navigate cases | Doesn't scale. 1 caseworker, hundreds of cases |

---

## 2. Our Solution — What Is Ublong?

> **Ublong is an autonomous multi-agent AI system that takes a child's specific situation as input and outputs the exact legal pathway, required documents, available substitutes, and a drafted application letter — in minutes.**

The name comes from **You + Belong = Ublong.** Because every child belongs — in a school, in a clinic, in a legal record, in the world.

Ublong is not a chatbot. It is not a search engine. It is a pipeline of specialised AI agents that each do one job — and together, they replace hours of expert caseworker research with an automated, grounded, accurate output.

### What Ublong Outputs For Every Case

- The exact legal framework that applies to this child's situation
- A step-by-step registration pathway specific to the country and case type
- A list of all required documents
- What substitute documents are legally accepted when originals are missing
- Which of the family's documents cover which requirements
- What is genuinely blocked vs what has a workaround
- A professionally drafted cover letter ready to submit
- Which government office to submit to, and estimated timeline

All of this in under 2 minutes. For any caseworker. In any of our supported countries.

---

## 3. Who Uses Ublong?

Ublong is built for **caseworkers** — the humans on the ground at NGOs, refugee camps, legal aid clinics, and humanitarian organisations. They are not lawyers. They are often stretched across dozens of cases. They need fast, accurate, actionable guidance.

| Who | Where They Work | Their Problem |
|---|---|---|
| NGO Caseworker | Refugee camps, field offices | No time, no legal training, too many cases |
| Legal Aid Volunteer | Community clinics, legal centres | Inconsistent knowledge across countries |
| UNHCR Field Officer | Country operations | Needs to triage cases quickly |
| Social Worker | Urban refugee settlements | Clients are mobile, documentation scattered |

Ublong is **NOT** meant to replace lawyers. For highly complex or contested cases, Ublong flags the case for human legal review. Ublong handles the 80% of cases that are solvable — if you know the right process.

---

## 4. How The System Works — End to End

Here is the complete flow from a caseworker opening the app to receiving a finished output. No technical knowledge needed to understand this section.

### Step 1 — Caseworker Fills The Intake Form

The caseworker opens the Ublong dashboard and fills in 8 fields:

| # | Field | Example Value |
|---|---|---|
| 1 | Child's country of birth | Bangladesh |
| 2 | Child's date of birth | 2024-03-15 |
| 3 | Child's current country of residence | Bangladesh |
| 4 | Father's nationality | Myanmar (Rohingya) |
| 5 | Mother's nationality | Myanmar (Rohingya) |
| 6 | Documents the parents currently hold | UNHCR Family Registration Card |
| 7 | Child's age in months | 14 |
| 8 | Additional context (optional) | Father missing since 2023 |

### Step 2 — Caseworker Hits 'Process Case'

The caseworker clicks the button. The form data is sent to the backend. The agent pipeline starts. The caseworker sees a **live panel showing each agent's thinking in real time** — like watching the system reason through the case.

### Step 3 — Three AI Agents Run In Sequence

Three specialist agents run one after another (explained in full detail in Section 5):

- The **Intake Agent** classifies the case and identifies the legal jurisdiction
- The **Research Agent** finds the exact legal pathway for this specific situation
- The **Gap Analysis Agent** compares what the family has against what is required

### Step 4 — Results Are Displayed

The caseworker sees a structured results panel with:

- Legal pathway — numbered steps
- Document checklist — what's needed, what's missing, what substitutes
- A ready-to-submit cover letter
- Which office to go to and estimated timeline

### Step 5 — Caseworker Downloads and Acts

The caseworker downloads the cover letter, prints the checklist, and begins gathering documents. The case is saved to the dashboard for tracking.

---

## 5. The Agent Pipeline — Detailed Walkthrough

This section is for technical team members. It explains exactly what each agent does, what it receives as input, and what it produces as output.

> All three agents are Python-based, built with LangChain and orchestrated by a LangGraph StateGraph. They run in sequence. Each agent's output becomes the next agent's input.

---

### Agent 1 — The Intake Agent
**File:** `ublong-agents/app/agents/intake_agent.py`

**Purpose:** Understand the case at a high level. Classify it. Identify what legal framework applies.

**Input:** The raw `CaseInput` (all 8 form fields)

**What it does:**
- Reads the child's birth country, current country, and parent nationalities
- Determines which jurisdiction is primary (the country the child is currently in takes precedence)
- Classifies the case type — e.g. "Rohingya child in Bangladesh camp", "Syrian refugee child in Lebanon"
- Raises flags — e.g. "late registration", "absent father", "undocumented parents", "high complexity"
- Assigns a complexity score from 1 to 5

**Output — `IntakeResult`:**

| Field | Type | Example |
|---|---|---|
| `jurisdiction` | string | `Bangladesh` |
| `case_type` | string | `Rohingya refugee child — late registration` |
| `flags` | list of strings | `["late_registration", "absent_father"]` |
| `complexity_score` | integer 1–5 | `4` |

---

### Agent 2 — The Research Agent
**File:** `ublong-agents/app/agents/research_agent.py`

**Purpose:** Find the exact legal pathway for this case. This agent uses **RAG (Retrieval-Augmented Generation)** — it only answers based on real legal documents we have loaded. It does not make up laws.

**Input:** `IntakeResult` + `CaseInput`

**What it does:**
- Queries the ChromaDB vector database for legal documents matching the jurisdiction
- Retrieves the top 5 most relevant chunks from our pre-loaded country legal files
- Synthesises a step-by-step registration pathway based **only** on the retrieved context
- Lists every required document per the law
- Identifies all legal substitutes and exceptions — e.g. "if no passport, UNHCR card is accepted"
- **Never invents a legal rule.** If it is not in the source documents, it says so

**Output — `ResearchResult`:**

| Field | Type | Example |
|---|---|---|
| `pathway_steps` | list of strings | `["Gather UNHCR FRC", "Visit RRRC office", "Submit Form PB-1", ...]` |
| `required_docs` | list of strings | `["UNHCR Family Registration Card", "Birth record from health facility"]` |
| `legal_basis` | string | `RRRC Circular 2018 — Proof of Birth for camp-born children` |
| `substitutes` | dict (string → string) | `{"Health record": "Witness statement from block leader + camp leader countersignature"}` |

---

### Agent 3 — The Gap Analysis Agent
**File:** `ublong-agents/app/agents/gap_analysis_agent.py`

**Purpose:** Compare what the family actually has against what is legally required. Then write the cover letter.

**Input:** `ResearchResult` + `CaseInput` (specifically `parents_documents_held`)

**What it does:**
- Takes the `required_docs` list from the Research Agent
- Compares it against `parents_documents_held` from the form
- For each missing document, checks whether a substitute exists
- Classifies each missing doc as either "covered by substitute" or "truly blocked"
- Drafts a professional cover letter in plain English addressed to the relevant registration authority
- Writes a recommendation — the most actionable next step for the caseworker

**Output — `GapResult`:**

| Field | Type | Example |
|---|---|---|
| `missing_docs` | list of strings | `["Birth health record", "Father ID"]` |
| `covered_by_substitutes` | list of strings | `["Birth health record — substitute: witness statement from block leader"]` |
| `truly_blocked` | list of strings | `["Father ID — no substitute available, escalate to supervisor"]` |
| `cover_letter` | string | Full drafted letter (400–600 words) |
| `recommendation` | string | `Proceed with RRRC submission using UNHCR card and witness statement. Flag father absence to supervisor.` |

---

### The Orchestrator
**File:** `ublong-agents/app/agents/orchestrator.py`

The orchestrator is a **LangGraph StateGraph** that connects all three agents. It:

- Defines a shared `AgentState` object that all agents read from and write to
- Runs Agent 1 → Agent 2 → Agent 3 in sequence
- If `complexity_score > 4`, adds a "flag for human review" note before assembling the final result
- Assembles the final `CaseResult` from all three agents' outputs
- **Streams every agent's thinking step in real time** to the frontend via SSE (Server-Sent Events)

**Final output — `CaseResult` (what the frontend displays):**

| Field | Description |
|---|---|
| `case_id` | Unique UUID for this case |
| `legal_pathway` | Numbered step-by-step process as one readable string |
| `required_documents` | Full list of documents needed |
| `available_substitutes` | Documents that are missing but covered by a legal substitute |
| `missing_documents` | Documents that are truly missing with no substitute |
| `submission_office` | The specific government office to submit to |
| `estimated_timeline` | How long the process typically takes |
| `cover_letter_draft` | The full ready-to-submit cover letter |
| `confidence_score` | 0.0 to 1.0 — how solvable the case is based on available docs |
| `country_specific_notes` | Flags, warnings, and special notes. Human review flag if complexity > 4 |

---

## 6. System Architecture

Ublong uses a **microservices architecture** for the MVP. Two services communicate over HTTP.

```
React Frontend (5173)
       ↓
Node/Express Backend (3000) ←→ MongoDB (27017)
       ↓
Python FastAPI Agents Service (8000)
       ↓
ChromaDB (embedded) ← legal_docs/BD.md, LB.md, KE.md
```

| Service | Port | Responsibility |
|---|---|---|
| React Frontend | 5173 | Caseworker UI — intake form, live agent stream, results dashboard |
| Node/Express Backend | 3000 | Case management, MongoDB CRUD, JWT auth, relays SSE from agents service |
| Python FastAPI (Agents) | 8000 | LangGraph orchestrator, all 3 agents, RAG pipeline, ChromaDB |
| MongoDB | 27017 | Case storage, user auth, document records |
| ChromaDB | embedded | Vector store for legal documents — embedded in Python service |

### Data Flow For A Single Case

1. Caseworker submits intake form → React POSTs to Node backend `/cases/:id/process`
2. Node backend saves case to MongoDB, then POSTs `CaseInput` to Python service `/api/agents/process-case`
3. Python service starts LangGraph pipeline, streams `AgentEvent`s back via SSE
4. Node backend relays the SSE stream to the React frontend
5. Frontend displays each `AgentEvent` in the live thinking panel as they arrive
6. When the final `result` event arrives, frontend renders the full `CaseResult`
7. Node backend saves the `CaseResult` to MongoDB

---

## 7. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Fast to build, clean component model, vibe-code friendly |
| Backend | Node.js + Express | MERN stack, fast JSON APIs, easy MongoDB integration |
| Database | MongoDB | Flexible schema, good for case documents with variable fields |
| Agents Service | Python + FastAPI | LangChain/LangGraph native language, async support |
| Agent Framework | LangGraph | StateGraph for multi-agent orchestration, built-in streaming |
| LLM | OpenAI GPT-4o | Best instruction following for structured legal reasoning |
| Embeddings | OpenAI text-embedding-3-small | Cheap, fast, accurate for RAG retrieval |
| Vector Store | ChromaDB | Embedded, no separate server, easy for hackathon |
| Streaming | SSE (Server-Sent Events) | Simple, reliable, no WebSocket complexity needed |
| Auth | JWT | Simple token-based auth for caseworker logins |
| Containerisation | Docker + Docker Compose | Both services run with one command |

---

## 8. Repository Structure

Repo: `github.com/shvn22k/ublong`

```
ublong/
├── ublong-agents/                  # Python FastAPI microservice
│   ├── main.py                     # App entrypoint, startup loads RAG docs
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   ├── app/
│   │   ├── agents/
│   │   │   ├── orchestrator.py     # LangGraph StateGraph — connects all agents
│   │   │   ├── intake_agent.py     # Agent 1 — case classification
│   │   │   ├── research_agent.py   # Agent 2 — legal pathway RAG
│   │   │   └── gap_analysis_agent.py # Agent 3 — gap analysis + cover letter
│   │   ├── rag/
│   │   │   ├── loader.py           # Loads .md legal docs into ChromaDB
│   │   │   └── retriever.py        # Returns filtered retriever by country code
│   │   ├── models/
│   │   │   └── case.py             # Pydantic models: CaseInput, CaseResult, AgentEvent
│   │   ├── api/
│   │   │   └── routes.py           # POST /api/agents/process-case
│   │   └── utils/
│   │       └── streaming.py        # SSE streaming helpers
│   └── data/
│       ├── legal_docs/             # BD.md, LB.md, KE.md — RAG source documents
│       └── chroma_db/              # Auto-generated vector store (gitignored)
│
├── ublong-backend/                 # Node/Express backend (to be built)
│   ├── server.js
│   ├── routes/
│   ├── models/
│   └── middleware/
│
├── ublong-frontend/                # React frontend (to be built)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── store/
│   └── public/
│
└── docker-compose.yml              # Runs all services together
```

---

## 9. MongoDB Schemas

### Collection: `cases`
One document per case submitted.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated MongoDB ID |
| `case_id` | String | UUID from the agents service — links MongoDB record to agent output |
| `created_by` | ObjectId | Ref to `users` — which caseworker created this |
| `status` | String | `pending` \| `processing` \| `completed` \| `flagged_for_review` |
| `intake` | Object | The raw `CaseInput` fields stored as submitted |
| `result` | Object | The full `CaseResult` from the agents — null until complete |
| `created_at` | Date | Timestamp |
| `updated_at` | Date | Timestamp |

### Collection: `users`
Caseworker accounts.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated MongoDB ID |
| `name` | String | Caseworker full name |
| `email` | String | Login email — unique |
| `password_hash` | String | bcrypt hashed password |
| `organisation` | String | e.g. UNHCR, MSF, local NGO name |
| `created_at` | Date | Timestamp |

---

## 10. API Reference

### Python Agents Service — Port 8000

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health check |
| `GET` | `/api/agents/health` | Agent status — returns list of active agents |
| `POST` | `/api/agents/process-case` | Accepts `CaseInput` JSON, returns SSE stream of `AgentEvent`s. Final event is `type=result` containing full `CaseResult` |

### Node/Express Backend — Port 3000

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create caseworker account |
| `POST` | `/auth/login` | Login — returns JWT |
| `POST` | `/cases` | Create new case, returns case `_id` |
| `GET` | `/cases` | Get all cases for logged-in caseworker |
| `GET` | `/cases/:id` | Get single case with full result |
| `POST` | `/cases/:id/process` | Trigger agent pipeline — returns SSE stream |
| `GET` | `/cases/:id/documents` | Get generated documents for a case |
| `PATCH` | `/cases/:id` | Update case status |

### AgentEvent Shape (SSE stream)
Every event streamed from the agents service looks like this:

```json
{
  "event_type": "thinking",
  "agent_name": "research_agent",
  "content": "Retrieving legal documents for Bangladesh jurisdiction...",
  "timestamp": "2026-06-10T10:45:00Z"
}
```

`event_type` is one of: `thinking` | `result` | `error`

The final event has `event_type: "result"` and `content` contains the full serialised `CaseResult`.

---

## 11. The 3 Supported Countries (MVP Scope)

We pre-load deep legal data for exactly 3 countries. The demo uses these 3 only. The architecture supports adding more countries by simply adding a new `.md` file to `data/legal_docs/`.

| Code | Country | Primary Population | Key Legal Framework |
|---|---|---|---|
| `BD` | Bangladesh | Rohingya refugees in Cox's Bazar (1M+) | RRRC Circular 2018, UNHCR biometric registration |
| `LB` | Lebanon | Syrian refugees (1.5M), Palestinians (UNRWA) | Lebanese Civil Code Decree 3260, MoI Circular 2015 |
| `KE` | Kenya | Dadaab & Kakuma camp residents (650K+) | Births & Deaths Registration Act, Refugees Act 2021 |

> **Important for demo:** Always use Bangladesh as the primary demo case. The Rohingya situation is the most documented, the legal pathway is clear, and the story is emotionally compelling for judges.

---

## 12. Team Roles & Responsibilities

| Member | Role | Owns |
|---|---|---|
| ML Dev 1 | Agent Architecture | LangGraph orchestrator, all 3 agents, SSE streaming, StateGraph |
| ML Dev 2 | RAG & Documents | ChromaDB setup, legal docs (BD/LB/KE), document generation, translation, prompt quality |
| Fullstack Dev 1 | Backend | Node/Express server, MongoDB schemas, all REST APIs, JWT auth, Docker Compose |
| Fullstack Dev 2 | Frontend Dashboard | React app, intake form, live agent streaming panel, results view, document preview |
| Fullstack Dev 3 | Demo & Integration | Demo mode, 3 pre-loaded test cases, frontend-backend wiring, error handling, GitHub/submission |

---

## 13. Demo Script

> This is the exact story we tell in the demo. Every team member should know this cold.

---

Meet **Ayesha**. She is 14 months old. She was born in Kutupalong camp, Cox's Bazar, Bangladesh. Her parents are Rohingya — stateless by Myanmar law, unrecognised by Bangladesh. In the eyes of every government in the world, **Ayesha does not exist.**

The caseworker opens Ublong. Fills in Ayesha's details. Her parents have one document: a UNHCR Family Registration Card. That is it.

Watch what happens.

1. **Intake Agent fires** — classifies: Rohingya child, late registration, Cox's Bazar jurisdiction, complexity 4/5
2. **Research Agent fires** — retrieves RRRC Circular 2018 from our legal database, maps out the full Proof of Birth pathway
3. **Gap Analysis Agent fires** — UNHCR FRC covers the primary ID requirement. No health record, but a witness statement from the block leader is a legal substitute. One blocker: father needs to be present at RRRC — agent flags this and drafts a contingency clause in the cover letter
4. **Result arrives** — Ayesha has a pathway. 4 steps. 2 documents to gather. A cover letter ready to print. RRRC office address. 2–4 week timeline.

In 90 seconds, Ublong did what would take a caseworker 6 hours.

That caseworker has 47 other cases today. Ublong just gave her the time to get through them.

---

## 14. What We Are NOT Building (MVP Limits)

Be very clear about scope. Do not build anything not on this list.

| ✅ In Scope — Build This | ❌ Out of Scope — Do Not Touch |
|---|---|
| 3 countries: Bangladesh, Lebanon, Kenya | Real document submission to governments |
| Intake form (8 fields) | More than 3 countries |
| 3-agent pipeline with real-time streaming | Follow-up tracking / automated reminders |
| Cover letter generation | Translation of cover letters (nice-to-have only if time allows) |
| Document checklist with gap analysis | Mobile app |
| Case dashboard (view + save cases) | User roles / permissions system |
| Simple JWT auth for caseworkers | Payments or subscriptions |
| Demo mode with 3 pre-loaded cases | Integration with UNHCR databases |
| Docker Compose for local dev | Production deployment / cloud hosting |

---

*Ublong — FAR AWAY Hackathon 2026 | Every Child Belongs.*
