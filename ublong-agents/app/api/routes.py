import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.models.case import CaseInput, AgentEvent
from app.agents.orchestrator import run_pipeline

router = APIRouter(prefix="/api/agents")


@router.post("/process-case")
async def process_case(case_input: CaseInput) -> StreamingResponse:
    async def event_stream():
        queue: asyncio.Queue = asyncio.Queue()
        _SENTINEL = object()

        async def _run():
            try:
                result = await run_pipeline(case_input, queue)
                await queue.put(AgentEvent(
                    event_type="result",
                    agent_name="orchestrator",
                    content=result.model_dump_json(),
                    timestamp=datetime.now(timezone.utc).isoformat(),
                ))
            except Exception:
                pass  # error event already emitted by run_pipeline
            finally:
                await queue.put(_SENTINEL)

        asyncio.create_task(_run())

        while True:
            item = await queue.get()
            if item is _SENTINEL:
                break
            yield f"data: {item.model_dump_json()}\n\n"

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
    return {"status": "ok", "agents": ["intake", "research", "gap_analysis", "orchestrator"]}
