import asyncio
from datetime import datetime, timezone
from app.models.case import AgentEvent


def make_event(event_type: str, agent_name: str, content: str) -> AgentEvent:
    return AgentEvent(
        event_type=event_type,
        agent_name=agent_name,
        content=content,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


async def emit(queue: asyncio.Queue, event_type: str, agent_name: str, content: str) -> None:
    await queue.put(make_event(event_type, agent_name, content))
