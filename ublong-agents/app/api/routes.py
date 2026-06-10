from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.models.case import CaseInput
from app.agents.orchestrator import run_pipeline

router = APIRouter(prefix="/api/agents")


@router.post("/process-case")
async def process_case(case_input: CaseInput) -> StreamingResponse:
    async def event_stream():
        try:
            async for event in run_pipeline(case_input):
                yield f"data: {event.model_dump_json()}\n\n"
        except Exception as exc:
            from app.models.case import AgentEvent
            from datetime import datetime, timezone
            error_event = AgentEvent(
                event_type="error",
                agent_name="api",
                content=str(exc),
                timestamp=datetime.now(timezone.utc).isoformat(),
            )
            yield f"data: {error_event.model_dump_json()}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.get("/health")
async def agents_health():
    return {"status": "ok", "agents": ["intake", "research", "gap_analysis"]}
