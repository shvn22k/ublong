import asyncio
import contextvars
import uuid
from typing import TypedDict, Optional

from langgraph.graph import StateGraph, START, END

from app.models.case import CaseInput, AgentEvent, CaseResult
from app.agents.intake_agent import run_intake_agent, IntakeResult
from app.agents.research_agent import run_research_agent, ResearchResult
from app.agents.gap_analysis_agent import run_gap_analysis_agent, GapResult
from app.utils.streaming import emit

# Carries the live queue into each LangGraph node without polluting state.
_queue_ctx: contextvars.ContextVar[asyncio.Queue] = contextvars.ContextVar("pipeline_queue")


class AgentState(TypedDict):
    case_input: CaseInput
    intake_result: Optional[IntakeResult]
    research_result: Optional[ResearchResult]
    gap_result: Optional[GapResult]
    events: list[AgentEvent]
    final_result: Optional[CaseResult]
    error: Optional[str]


# ── Nodes ─────────────────────────────────────────────────────────────────────

async def intake_node(state: AgentState) -> dict:
    queue = _queue_ctx.get()
    result = await run_intake_agent(state["case_input"], queue)
    return {"intake_result": result}


async def research_node(state: AgentState) -> dict:
    queue = _queue_ctx.get()
    result = await run_research_agent(state["intake_result"], state["case_input"], queue)  # type: ignore[arg-type]
    return {"research_result": result}


async def gap_analysis_node(state: AgentState) -> dict:
    queue = _queue_ctx.get()
    result = await run_gap_analysis_agent(state["research_result"], state["case_input"], queue)  # type: ignore[arg-type]
    return {"gap_result": result}


async def flag_review_node(state: AgentState) -> dict:
    queue = _queue_ctx.get()
    score = state["intake_result"].complexity_score  # type: ignore[union-attr]
    await emit(
        queue,
        "thinking",
        "orchestrator",
        f"⚠️ High complexity case (score {score}/5) — flagged for human expert review.",
    )
    return {}


async def assemble_node(state: AgentState) -> dict:
    intake: IntakeResult = state["intake_result"]  # type: ignore[assignment]
    research: ResearchResult = state["research_result"]  # type: ignore[assignment]
    gap: GapResult = state["gap_result"]  # type: ignore[assignment]

    legal_pathway = "\n".join(
        f"{i + 1}. {step}" for i, step in enumerate(research.pathway_steps)
    )

    first_sentence = research.legal_basis.split(".")[0].strip()
    submission_office = (first_sentence + ".") if first_sentence else "See local civil registration authority."

    truly_blocked = gap.truly_blocked
    confidence = round(1.0 - (len(truly_blocked) / max(len(research.required_docs), 1)), 2)

    notes = list(intake.flags)
    if intake.complexity_score > 4:
        notes.append("FLAGGED FOR HUMAN LEGAL REVIEW — complexity score exceeds threshold")

    result = CaseResult(
        case_id=str(uuid.uuid4()),
        legal_pathway=legal_pathway,
        required_documents=research.required_docs,
        available_substitutes=gap.covered_by_substitutes,
        missing_documents=truly_blocked,
        submission_office=submission_office,
        estimated_timeline="4–8 weeks depending on document availability.",
        cover_letter_draft=gap.cover_letter,
        confidence_score=confidence,
        country_specific_notes=notes,
        intake_summary={
            "jurisdiction": intake.jurisdiction,
            "case_type": intake.case_type,
            "flags": intake.flags,
            "complexity_score": intake.complexity_score,
        },
        research_summary={
            "legal_basis": research.legal_basis,
            "substitutes": research.substitutes,
        },
        gap_summary={
            "recommendation": gap.recommendation,
        },
    )
    return {"final_result": result}


# ── Routing ───────────────────────────────────────────────────────────────────

def _route_after_gap(state: AgentState) -> str:
    intake = state.get("intake_result")
    if intake and intake.complexity_score > 4:
        return "flag_review"
    return "assemble"


# ── Build graph ───────────────────────────────────────────────────────────────

def _build_graph():
    wf = StateGraph(AgentState)
    wf.add_node("intake", intake_node)
    wf.add_node("research", research_node)
    wf.add_node("gap_analysis", gap_analysis_node)
    wf.add_node("flag_review", flag_review_node)
    wf.add_node("assemble", assemble_node)

    wf.add_edge(START, "intake")
    wf.add_edge("intake", "research")
    wf.add_edge("research", "gap_analysis")
    wf.add_conditional_edges("gap_analysis", _route_after_gap, {
        "flag_review": "flag_review",
        "assemble": "assemble",
    })
    wf.add_edge("flag_review", "assemble")
    wf.add_edge("assemble", END)

    return wf.compile()


_PIPELINE = _build_graph()


# ── Public entry point ────────────────────────────────────────────────────────

async def run_pipeline(case_input: CaseInput, event_queue: asyncio.Queue) -> CaseResult:
    _queue_ctx.set(event_queue)

    initial: AgentState = {
        "case_input": case_input,
        "intake_result": None,
        "research_result": None,
        "gap_result": None,
        "events": [],
        "final_result": None,
        "error": None,
    }

    try:
        final = await _PIPELINE.ainvoke(initial)
        return final["final_result"]
    except Exception as exc:
        await emit(event_queue, "error", "orchestrator", f"Pipeline error: {exc}")
        raise


# ── Manual test ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    async def _main():
        queue: asyncio.Queue = asyncio.Queue()
        _SENTINEL = object()

        async def _drain():
            while True:
                item = await queue.get()
                if item is _SENTINEL:
                    break
                print(f"[{item.event_type.upper()}] ({item.agent_name}): {item.content[:120]}")

        drain_task = asyncio.create_task(_drain())

        case = CaseInput(
            child_birth_country="Myanmar",
            child_birth_date="2023-01-15",
            child_current_country="Bangladesh",
            father_nationality="Rohingya (stateless)",
            mother_nationality="Rohingya (stateless)",
            parents_documents_held=[],
            child_age_months=18,
            additional_context="Rohingya child born in Cox's Bazar refugee camp; parents hold UNHCR documentation only.",
        )

        try:
            result = await run_pipeline(case, queue)
            print("\n=== FINAL RESULT ===")
            print(result.model_dump_json(indent=2))
        except Exception as exc:
            print(f"Pipeline failed: {exc}")
        finally:
            await queue.put(_SENTINEL)

        await drain_task

    asyncio.run(_main())
