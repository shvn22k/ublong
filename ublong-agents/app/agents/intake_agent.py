import asyncio
from datetime import datetime, timezone
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser

from app.models.case import CaseInput, AgentEvent
from app.utils.streaming import emit

AGENT_NAME = "intake"


class IntakeResult(BaseModel):
    jurisdiction: str
    case_type: str
    flags: list[str]
    complexity_score: int  # 1–5


_PROMPT = ChatPromptTemplate.from_template(
    """You are a legal intake specialist for stateless children's birth registration.

Analyse the case and classify it precisely.

Case details:
- Child born in: {child_birth_country} on {child_birth_date}
- Child currently in: {child_current_country}
- Father nationality: {father_nationality}
- Mother nationality: {mother_nationality}
- Child age (months): {child_age_months}
- Documents held: {parents_documents_held}
- Additional context: {additional_context}

Determine:
1. jurisdiction — the governing legal system (child_current_country takes precedence)
2. case_type — e.g. "refugee_child_late_registration", "stateless_child_registration", "migrant_child_registration"
3. flags — relevant flags from: stateless, parents_are_refugees, late_registration, no_parental_documents, cross_border_birth, single_parent, unknown_father
4. complexity_score — integer 1-5 (5 = requires human expert review due to legal ambiguity or extreme document gaps)

{format_instructions}"""
)


async def run_intake_agent(case_input: CaseInput, event_queue: asyncio.Queue) -> IntakeResult:
    parser = PydanticOutputParser(pydantic_object=IntakeResult)

    await emit(event_queue, "thinking", AGENT_NAME, "Classifying case and determining legal jurisdiction...")

    llm = ChatOpenAI(model="gpt-4o", streaming=True, temperature=0)
    chain = _PROMPT | llm

    input_dict = {
        "child_birth_country": case_input.child_birth_country,
        "child_birth_date": case_input.child_birth_date,
        "child_current_country": case_input.child_current_country,
        "father_nationality": case_input.father_nationality,
        "mother_nationality": case_input.mother_nationality,
        "child_age_months": case_input.child_age_months,
        "parents_documents_held": ", ".join(case_input.parents_documents_held) or "none",
        "additional_context": case_input.additional_context or "none provided",
        "format_instructions": parser.get_format_instructions(),
    }

    full_response = ""
    async for chunk in chain.astream(input_dict):
        token = chunk.content  # type: ignore[attr-defined]
        if token:
            full_response += token
            await emit(event_queue, "thinking", AGENT_NAME, token)

    try:
        result = parser.parse(full_response)
    except Exception:
        result = IntakeResult(
            jurisdiction=case_input.child_current_country,
            case_type="unknown",
            flags=["stateless"],
            complexity_score=4,
        )

    await emit(
        event_queue,
        "thinking",
        AGENT_NAME,
        f"Intake complete — jurisdiction: {result.jurisdiction}, type: {result.case_type}, complexity: {result.complexity_score}/5",
    )
    return result
