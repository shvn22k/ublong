from pydantic import BaseModel, Field, ConfigDict, AliasChoices
from typing import Optional, Any


class CaseInput(BaseModel):
    # Accept both the agents-native field names and the backend/frontend canonical
    # names (country_of_birth, date_of_birth, current_country). populate_by_name
    # lets internal code keep using the descriptive names while the Node backend
    # may POST snake_case "country_of_birth"-style payloads.
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    child_birth_country: str = Field(
        validation_alias=AliasChoices("child_birth_country", "country_of_birth")
    )
    child_birth_date: str = Field(
        validation_alias=AliasChoices("child_birth_date", "date_of_birth")
    )
    child_current_country: str = Field(
        validation_alias=AliasChoices("child_current_country", "current_country")
    )
    father_nationality: str = ""
    mother_nationality: str = ""
    parents_documents_held: list[str] = Field(default_factory=list)
    child_age_months: int = 0
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
    # Array of flags/notes — matches the backend Mongo schema (country_specific_notes: [String]).
    country_specific_notes: list[str] = Field(default_factory=list)
    # Per-agent summaries surfaced for the dashboard / case record (optional).
    intake_summary: Optional[dict[str, Any]] = None
    research_summary: Optional[dict[str, Any]] = None
    gap_summary: Optional[dict[str, Any]] = None
