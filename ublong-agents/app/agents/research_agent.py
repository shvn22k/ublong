import asyncio
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser

from app.models.case import CaseInput, AgentEvent
from app.rag.retriever import get_retriever
from app.utils.streaming import emit
from app.agents.intake_agent import IntakeResult

AGENT_NAME = "research"


class ResearchResult(BaseModel):
    pathway_steps: list[str]
    required_docs: list[str]
    legal_basis: str
    substitutes: dict[str, str]  # required_doc -> accepted substitute


_PROMPT = ChatPromptTemplate.from_template(
    """You are a legal researcher specialising in birth registration law for stateless and refugee children.

Jurisdiction: {jurisdiction}
Case type: {case_type}
Flags: {flags}

--- Retrieved Legal Context ---
{legal_context}
--- End Context ---

Case:
- Child born in: {child_birth_country}, currently in: {child_current_country}
- Father: {father_nationality}, Mother: {mother_nationality}
- Documents held: {parents_documents_held}

Based ONLY on the legal context above:
1. List the step-by-step pathway to register this birth
2. List every document required by law
3. State the legal basis (cite law/regulation name and article)
4. Map substitute documents accepted by law for hard-to-obtain originals (dict of required_doc -> substitute)

If context is insufficient, state that clearly in legal_basis and return empty lists.

{format_instructions}"""
)


async def run_research_agent(
    intake_result: IntakeResult,
    case_input: CaseInput,
    event_queue: asyncio.Queue,
) -> ResearchResult:
    parser = PydanticOutputParser(pydantic_object=ResearchResult)

    await emit(event_queue, "thinking", AGENT_NAME, f"Retrieving legal documents for: {intake_result.jurisdiction}...")

    retriever = get_retriever(case_input.child_current_country)
    legal_context = "No legal documents are loaded for this jurisdiction. Analysis based on general principles only."

    if retriever:
        try:
            docs = retriever.invoke(
                f"birth registration {intake_result.case_type} refugee stateless {intake_result.jurisdiction}"
            )
            if docs:
                legal_context = "\n\n".join(
                    f"[Chunk {i + 1}]:\n{d.page_content}" for i, d in enumerate(docs)
                )
                await emit(event_queue, "thinking", AGENT_NAME, f"Retrieved {len(docs)} relevant legal chunks.")
            else:
                await emit(event_queue, "thinking", AGENT_NAME, "No matching chunks found for this jurisdiction.")
        except Exception as exc:
            await emit(event_queue, "thinking", AGENT_NAME, f"RAG retrieval error: {exc}. Continuing without context.")

    llm = ChatOpenAI(model="gpt-4o", streaming=True, temperature=0)
    chain = _PROMPT | llm

    input_dict = {
        "jurisdiction": intake_result.jurisdiction,
        "case_type": intake_result.case_type,
        "flags": ", ".join(intake_result.flags),
        "legal_context": legal_context,
        "child_birth_country": case_input.child_birth_country,
        "child_current_country": case_input.child_current_country,
        "father_nationality": case_input.father_nationality,
        "mother_nationality": case_input.mother_nationality,
        "parents_documents_held": ", ".join(case_input.parents_documents_held) or "none",
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
        result = ResearchResult(
            pathway_steps=["Insufficient legal data — manual research required for this jurisdiction."],
            required_docs=[],
            legal_basis="No legal data loaded for this jurisdiction.",
            substitutes={},
        )

    await emit(
        event_queue,
        "thinking",
        AGENT_NAME,
        f"Research complete — {len(result.pathway_steps)} steps, {len(result.required_docs)} required docs.",
    )
    return result
