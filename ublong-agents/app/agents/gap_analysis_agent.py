import asyncio
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

from app.models.case import CaseInput
from app.utils.streaming import emit
from app.agents.research_agent import ResearchResult

AGENT_NAME = "gap_analysis"


class GapResult(BaseModel):
    missing_docs: list[str]
    covered_by_substitutes: list[str]
    truly_blocked: list[str]
    cover_letter: str
    recommendation: str


_PROMPT = ChatPromptTemplate.from_template(
    """You are an experienced legal caseworker preparing a birth registration application for a stateless or refugee child.

Required documents:
{required_docs}

Accepted substitutes (required → substitute):
{substitutes}

Documents the family currently holds:
{documents_held}

Registration pathway steps:
{pathway_steps}

Case context:
- Child born in {child_birth_country}, currently in {child_current_country}
- Father: {father_nationality} national | Mother: {mother_nationality} national
- Additional context: {additional_context}

Tasks:
1. missing_docs — required documents not in the family's possession
2. covered_by_substitutes — missing docs that have an accepted substitute available
3. truly_blocked — missing docs with no substitute (genuine blockers)
4. cover_letter — a professional, compassionate letter in plain English addressed to the registration authority. It should: explain the child's situation, reference the legal basis for accepting alternatives, list what is being submitted and why originals are unavailable.
5. recommendation — one or two sentences on the most actionable next step for the caseworker

{format_instructions}"""
)


async def run_gap_analysis_agent(
    research_result: ResearchResult,
    case_input: CaseInput,
    event_queue: asyncio.Queue,
) -> GapResult:
    parser = PydanticOutputParser(pydantic_object=GapResult)

    held = set(case_input.parents_documents_held)
    pre_missing = [d for d in research_result.required_docs if d not in held]

    await emit(
        event_queue,
        "thinking",
        AGENT_NAME,
        f"Comparing {len(research_result.required_docs)} required docs against {len(held)} held — {len(pre_missing)} missing.",
    )

    substitutes_str = (
        "\n".join(f"  {k} → {v}" for k, v in research_result.substitutes.items())
        or "  None identified"
    )

    llm = ChatOpenAI(model="gpt-4o", streaming=True, temperature=0.2)
    chain = _PROMPT | llm

    input_dict = {
        "required_docs": "\n".join(f"  - {d}" for d in research_result.required_docs) or "  None specified",
        "substitutes": substitutes_str,
        "documents_held": "\n".join(f"  - {d}" for d in case_input.parents_documents_held) or "  None",
        "pathway_steps": "\n".join(f"  {i + 1}. {s}" for i, s in enumerate(research_result.pathway_steps)),
        "child_birth_country": case_input.child_birth_country,
        "child_current_country": case_input.child_current_country,
        "father_nationality": case_input.father_nationality,
        "mother_nationality": case_input.mother_nationality,
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
        result = GapResult(
            missing_docs=pre_missing,
            covered_by_substitutes=[],
            truly_blocked=pre_missing,
            cover_letter="Unable to generate cover letter — please review manually.",
            recommendation="Manual caseworker review required.",
        )

    await emit(
        event_queue,
        "thinking",
        AGENT_NAME,
        f"Gap analysis complete — {len(result.truly_blocked)} truly blocked, {len(result.covered_by_substitutes)} covered by substitutes.",
    )
    return result
