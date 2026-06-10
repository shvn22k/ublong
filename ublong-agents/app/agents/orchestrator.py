import asyncio
import contextvars
import uuid
from datetime import datetime, timezone
from typing import TypedDict, Optional, AsyncIterator

from langgraph.graph import StateGraph, END

from app.models.case import CaseInput, AgentEvent, CaseResult
from app.agents.intake_agent import run_intake_agent, IntakeResult
from app.agents.research_agent import run_research_agent, ResearchResult
from app.agents.gap_analysis_agent import run_gap_analysis_agent, GapResult
from app.utils.streaming import emit

# Contextvar carries the live queue into each LangGraph node without polluting state.
_queue_ctx: contextvars.ContextVar[asyncio.Queue] = contextvars.ContextVar("pipeline_queue")


class AgentState(TypedDict):
    case_input: CaseInput
    intake_result: Optional[IntakeResult]
    research_result: Optional[ResearchResult]
    gap_result: Optional[GapResult]
    error: Optional[str]


# ── LangGraph nodes ───────────────────────────────────────────────────────────

async def intake_node(state: AgentState) -> dict:
    queue = _queue_ctx.get()
    result = await run_intake_agent(state["case_input"], queue)
    return {"intake_result": result}


async def human_review_node(state: AgentState) -> dict:
    queue = _queue_ctx.get()
    score = state["intake_result"].complexity_score  # type: ignore[union-attr]
    await emit(
        queue,
        "thinking",
        "orchestrator",
        f"⚠️ High complexity case (score {score}/5) — flagged for human expert review before proceeding.",
    )
    return {}


async def research_node(state: AgentState) -> dict:
    queue = _queue_ctx.get()
    result = await run_research_agent(state["intake_result"], state["case_input"], queue)  # type: ignore[arg-type]
    return {"research_result": result}


async def gap_analysis_node(state: AgentState) -> dict:
    queue = _queue_ctx.get()
    result = await run_gap_analysis_agent(state["research_result"], state["case_input"], queue)  # type: ignore[arg-type]
    return {"gap_result": result}


def _route_after_intake(state: AgentState) -> str:
    intake = state.get("intake_result")
    if intake and intake.complexity_score > 4:
        return "human_review"
    return "research"


# ── Build graph ───────────────────────────────────────────────────────────────

def _build_graph() -> "CompiledGraph":  # type: ignore[name-defined]
    wf = StateGraph(AgentState)
    wf.add_node("intake", intake_node)
    wf.add_node("human_review", human_review_node)
    wf.add_node("research", research_node)
    wf.add_node("gap_analysis", gap_analysis_node)

    wf.set_entry_point("intake")
    wf.add_conditional_edges("intake", _route_after_intake, {
        "human_review": "human_review",
        "research": "research",
    })
    wf.add_edge("human_review", "research")
    wf.add_edge("research", "gap_analysis")
    wf.add_edge("gap_analysis", END)

    return wf.compile()


_PIPELINE = _build_graph()


# ── Public entry point ────────────────────────────────────────────────────────

async def run_pipeline(case_input: CaseInput) -> AsyncIterator[AgentEvent]:
    queue: asyncio.Queue = asyncio.Queue()
    _SENTINEL = object()

    # Set contextvar before create_task so the task inherits it.
    _queue_ctx.set(queue)

    async def _run() -> None:
        try:
            initial: AgentState = {
                "case_input": case_input,
                "intake_result": None,
                "research_result": None,
                "gap_result": None,
                "error": None,
            }
            final = await _PIPELINE.ainvoke(initial)

            intake: IntakeResult | None = final.get("intake_result")
            research: ResearchResult | None = final.get("research_result")
            gap: GapResult | None = final.get("gap_result")

            confidence = round(
                max(0.3, 0.9 - 0.1 * ((intake.complexity_score - 1) if intake else 2)), 2
            )

            case_result = CaseResult(
                case_id=str(uuid.uuid4()),
                legal_pathway="\n".join(research.pathway_steps) if research else "No pathway available.",
                required_documents=research.required_docs if research else [],
                available_substitutes=list(research.substitutes.values()) if research else [],
                missing_documents=gap.missing_docs if gap else [],
                submission_office="See country-specific civil registration authority.",
                estimated_timeline="4–8 weeks depending on document availability.",
                cover_letter_draft=gap.cover_letter if gap else "",
                confidence_score=confidence,
                country_specific_notes=research.legal_basis if research else "",
            )

            await queue.put(AgentEvent(
                event_type="result",
                agent_name="orchestrator",
                content=case_result.model_dump_json(),
                timestamp=datetime.now(timezone.utc).isoformat(),
            ))
        except Exception as exc:
            await queue.put(AgentEvent(
                event_type="error",
                agent_name="orchestrator",
                content=f"Pipeline error: {exc}",
                timestamp=datetime.now(timezone.utc).isoformat(),
            ))
        finally:
            await queue.put(_SENTINEL)

    task = asyncio.create_task(_run())

    while True:
        item = await queue.get()
        if item is _SENTINEL:
            break
        yield item  # type: ignore[misc]

    await task
