from pydantic import BaseModel
from typing import Optional


class CaseInput(BaseModel):
    child_birth_country: str
    child_birth_date: str
    child_current_country: str
    father_nationality: str
    mother_nationality: str
    parents_documents_held: list[str]
    child_age_months: int
    additional_context: str = ""


class AgentEvent(BaseModel):
    event_type: str  # "thinking" | "result" | "error"
    agent_name: str
    content: str
    timestamp: str


class CaseResult(BaseModel):
    case_id: str
    legal_pathway: str
    required_documents: list[str]
    available_substitutes: list[str]
    missing_documents: list[str]
    submission_office: str
    estimated_timeline: str
    cover_letter_draft: str
    confidence_score: float
    country_specific_notes: str
