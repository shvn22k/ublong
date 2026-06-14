// Fully client-side mock of the agent pipeline. Lets the frontend run the entire
// intake -> live stream -> result flow with NO backend, Mongo, or OpenAI — ideal
// for screen-recorded demos. Mirrors the contract the real backend produces.

import type { CaseIntake, CaseResult, StreamEvent } from "./api";

type Template = Omit<CaseResult, "case_id" | "cover_letter_draft">;

const MOCK_RESULTS: Record<string, Template> = {
  Bangladesh: {
    legal_pathway:
      "1. Gather the UNHCR Family Registration Card and any available camp health records.\n2. Obtain a witness statement from the Majhi (block leader) confirming the birth in the camp.\n3. Visit the Camp-in-Charge (CiC) office with all documents for the RRRC Proof of Birth process.\n4. Submit the late registration application with the drafted cover letter.",
    required_documents: [
      "UNHCR Family Registration Card",
      "Birth health record or camp health facility record",
      "Block-leader (Majhi) witness statement",
      "Mother's biometric identity record",
    ],
    available_substitutes: [
      "Birth health record — substitute: Majhi witness statement countersigned by camp leader",
      "Parent passport / national ID — substitute: UNHCR Family Registration Card",
    ],
    missing_documents: ["Father identity / presence record"],
    submission_office: "Camp-in-Charge (CiC) office, RRRC Proof of Birth process, Cox's Bazar.",
    estimated_timeline: "2–4 weeks",
    confidence_score: 0.82,
    country_specific_notes: [
      "late_registration",
      "Rohingya refugee child — Cox's Bazar jurisdiction",
      "Father presence may be required at RRRC — contingency clause included in cover letter",
    ],
    intake_summary: {
      jurisdiction: "Bangladesh",
      case_type: "Rohingya refugee child — late registration",
      flags: ["late_registration", "absent_father", "stateless"],
      complexity_score: 4,
    },
    research_summary: {
      legal_basis: "RRRC Circular 2018 — Proof of Birth for camp-born children",
    },
    gap_summary: {
      recommendation:
        "Proceed with RRRC submission using the UNHCR card and a Majhi witness statement. Flag the father's absence to the caseworker supervisor.",
    },
  },
  Lebanon: {
    legal_pathway:
      "1. Collect the UNHCR registration certificate and any hospital birth notification.\n2. Register the birth with the local Mukhtar to obtain a certificate extract.\n3. Record the birth at the Personal Status (Noufous) office for foreigners.\n4. File a late-registration request relying on the MoI facilitation measures if the one-year deadline has passed.",
    required_documents: [
      "UNHCR Registration Certificate",
      "Hospital birth notification or midwife record",
      "Mukhtar family-status affidavit",
      "Parents' identity documents",
    ],
    available_substitutes: [
      "Hospital birth notification — substitute: midwife (daya) record + two witness statements",
      "National ID — substitute: UNHCR certificate + available civil documents",
    ],
    missing_documents: ["Hospital birth notification"],
    submission_office: "Local Mukhtar, then the Personal Status (Noufous) office, Ministry of Interior, Lebanon.",
    estimated_timeline: "4–8 weeks",
    confidence_score: 0.74,
    country_specific_notes: [
      "Syrian refugee child — Lebanese Civil Code Decree 3260 applies",
      "late_registration",
      "undocumented_parents",
    ],
    intake_summary: {
      jurisdiction: "Lebanon",
      case_type: "Syrian refugee child — late registration",
      flags: ["late_registration", "undocumented_parents"],
      complexity_score: 3,
    },
    research_summary: {
      legal_basis: "Lebanese Civil Code Decree 3260; MoI / General Security facilitation circulars 2017–2018",
    },
    gap_summary: {
      recommendation:
        "Gather the midwife record and Mukhtar affidavit before the Personal Status submission; engage legal aid if the office cites residency.",
    },
  },
  Kenya: {
    legal_pathway:
      "1. Obtain a refugee attestation letter from UNHCR or the camp administration.\n2. Collect the health facility birth notification, or a traditional birth attendant statement for home births.\n3. Submit the late birth registration to the Assistant Chief / sub-county Civil Registration office.\n4. Coordinate with the Department of Refugee Services if nationality is undetermined.",
    required_documents: [
      "UNHCR Refugee Attestation Letter",
      "Health facility birth notification",
      "Parents' refugee identity cards",
      "Camp registration proof",
    ],
    available_substitutes: [
      "Health facility record — substitute: traditional birth attendant (TBA) affidavit + camp administration statement",
      "National passport — substitute: UNHCR refugee attestation letter",
    ],
    missing_documents: ["Health facility birth record"],
    submission_office: "Assistant Chief / sub-county Civil Registration Services office, Kakuma / Dadaab, Kenya.",
    estimated_timeline: "3–6 weeks",
    confidence_score: 0.79,
    country_specific_notes: [
      "Camp-born child — Births & Deaths Registration Act applies",
      "Refugees Act 2021 provisions for stateless children",
      "late_registration",
    ],
    intake_summary: {
      jurisdiction: "Kenya",
      case_type: "Refugee camp child — late registration",
      flags: ["late_registration", "camp_resident"],
      complexity_score: 3,
    },
    research_summary: {
      legal_basis: "Births & Deaths Registration Act (Cap. 149); Refugees Act 2021",
    },
    gap_summary: {
      recommendation:
        "Obtain a TBA affidavit as a substitute for the missing health record before submission.",
    },
  },
};

const DEFAULT_RESULT: Template = {
  legal_pathway:
    "1. Consult the local civil registry for late birth registration requirements.\n2. Gather all available identity documents for the parents.\n3. Obtain secondary evidence (witness statements, health records).\n4. Submit the application with a supporting cover letter.",
  required_documents: [
    "Proof of birth (hospital or health facility record)",
    "Parent identity documents",
    "Proof of residence or camp registration",
  ],
  available_substitutes: [
    "Birth record — substitute: witness statements from community leaders",
  ],
  missing_documents: ["Proof of birth"],
  submission_office: "Local Civil Registry Office.",
  estimated_timeline: "4–8 weeks",
  confidence_score: 0.55,
  country_specific_notes: [
    "Country not in MVP dataset — general pathway provided",
    "Recommend human legal review",
  ],
  intake_summary: {
    jurisdiction: "Unknown",
    case_type: "General late registration",
    flags: ["needs_review"],
    complexity_score: 5,
  },
  research_summary: { legal_basis: "General international child rights framework (CRC Article 7)" },
  gap_summary: {
    recommendation: "Flag for human legal review — country-specific legal data not loaded.",
  },
};

function buildCoverLetter(intake: CaseIntake, template: Template): string {
  const childRef = intake.childName || "the child";
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const docs = intake.documentsHeld?.length
    ? intake.documentsHeld.join(", ")
    : "limited documentation due to displacement";
  const legalBasis =
    (template.research_summary?.legal_basis as string) || "applicable local regulations";

  return `${template.submission_office}
${date}

RE: Application for Late Birth Registration — ${childRef}

Dear Registration Officer,

I am writing on behalf of ${childRef}, born on ${intake.dob} in ${intake.countryOfBirth}, currently residing in ${intake.currentLocation || intake.currentCountry}. The family is seeking registration under the applicable provisions for children born to displaced and stateless parents who lack standard civil documentation.

The parents currently hold the following documents: ${docs}. Where original documents are unavailable, we respectfully submit legally accepted substitute evidence as outlined in ${legalBasis}.

We acknowledge that ${template.missing_documents.join(" and ") || "some required documents"} may be missing. However, substitute evidence has been identified: ${template.available_substitutes.join("; ") || "community witness statements and humanitarian registration records"}.

We respectfully request that this application be processed under the late registration provisions. The family is prepared to provide any additional evidence required and to attend in person as needed.

${(template.gap_summary?.recommendation as string) || "We look forward to your guidance on next steps."}

Respectfully submitted,
Ublong Caseworker Support System
(On behalf of the family)`;
}

function getMockResult(intake: CaseIntake): CaseResult {
  const country = intake.currentCountry || intake.countryOfBirth;
  const template = MOCK_RESULTS[country] || DEFAULT_RESULT;
  const caseId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `case-${Date.now()}`;

  return {
    case_id: caseId,
    ...template,
    cover_letter_draft: buildCoverLetter(intake, template),
  };
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Streams a believable agent run for the given intake, then resolves with the
 * mock CaseResult. Same signature contract as the real processCase path.
 */
export async function runMockPipeline(
  intake: CaseIntake,
  onEvent: (ev: StreamEvent) => void,
  signal?: AbortSignal
): Promise<CaseResult> {
  const country = intake.currentCountry || intake.countryOfBirth || "the host country";
  const childRef = intake.childName || "the child";
  const docsHeld = intake.documentsHeld?.length
    ? intake.documentsHeld.join(", ")
    : "no documents listed";

  const steps: Array<{ agent: string; message: string; pause: number }> = [
    { agent: "intake", message: `Classifying case: ${childRef}, born in ${intake.countryOfBirth || "—"}, residing in ${country}.`, pause: 700 },
    { agent: "intake", message: "Determining primary jurisdiction and case type…", pause: 800 },
    { agent: "intake", message: "Case classified. Complexity score assigned.", pause: 600 },
    { agent: "research", message: `Querying the legal knowledge base for ${country} registration pathways…`, pause: 800 },
    { agent: "research", message: "Retrieving the most relevant legal document chunks from the vector store…", pause: 900 },
    { agent: "research", message: "Synthesising a step-by-step registration pathway from the retrieved context.", pause: 800 },
    { agent: "research", message: "Legal pathway and required documents identified.", pause: 600 },
    { agent: "gap_analysis", message: `Comparing family documents (${docsHeld}) against legal requirements…`, pause: 800 },
    { agent: "gap_analysis", message: "Checking substitute-document availability for missing items…", pause: 800 },
    { agent: "gap_analysis", message: "Gap analysis complete. Drafting the cover letter.", pause: 700 },
  ];

  onEvent({ type: "agent_start", agent: "orchestrator", message: "Pipeline started." });

  for (const step of steps) {
    if (signal?.aborted) throw new Error("aborted");
    await delay(step.pause);
    onEvent({ type: "agent_thinking", agent: step.agent, message: step.message });
  }

  await delay(500);
  const result = getMockResult(intake);
  onEvent({ type: "result", data: result });
  return result;
}
