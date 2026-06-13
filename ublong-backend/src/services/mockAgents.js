const { v4: uuidv4 } = require("uuid");

const MOCK_RESULTS = {
  Bangladesh: {
    legal_pathway:
      "1. Gather UNHCR Family Registration Card and any available health records.\n2. Obtain witness statement from block leader confirming birth in camp.\n3. Visit RRRC Proof of Birth office in Cox's Bazar with all documents.\n4. Submit late registration application with drafted cover letter.",
    required_documents: [
      "UNHCR Family Registration Card",
      "Birth health record or camp health facility record",
      "Witness statement from block leader",
      "Parent identification (if available)",
    ],
    available_substitutes: [
      "Birth health record — substitute: witness statement from block leader",
      "Parent passport — substitute: UNHCR Family Registration Card",
    ],
    missing_documents: ["Birth health record", "Father ID"],
    submission_office: "RRRC Proof of Birth Office, Cox's Bazar, Bangladesh",
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
      flags: ["late_registration", "absent_father"],
      complexity_score: 4,
    },
    research_summary: {
      legal_basis: "RRRC Circular 2018 — Proof of Birth for camp-born children",
      substitutes: {
        "UNHCR FRC": "Temporary RRRC slip",
        "Health record": "Witness statement from block leader",
      },
    },
    gap_summary: {
      recommendation:
        "Proceed with RRRC submission using UNHCR card and witness statement. Flag father absence to caseworker supervisor.",
    },
  },
  Lebanon: {
    legal_pathway:
      "1. Collect UNHCR registration documents and any birth notification from hospital.\n2. Visit local Mukhtar for family status affidavit.\n3. Submit application to Civil Status office with legal aid support.\n4. Follow up on nationality determination if parents are stateless.",
    required_documents: [
      "UNHCR Registration Certificate",
      "Hospital birth notification or midwife record",
      "Mukhtar family status affidavit",
      "Parents' identity documents",
    ],
    available_substitutes: [
      "Hospital birth record — substitute: midwife notification + two witness statements",
      "National ID — substitute: UNHCR certificate + camp registration",
    ],
    missing_documents: ["Hospital birth notification"],
    submission_office: "Local Civil Status Office (MoI), Lebanon",
    estimated_timeline: "4–8 weeks",
    confidence_score: 0.74,
    country_specific_notes: [
      "Syrian refugee child — Lebanese Civil Code Decree 3260 applies",
      "complexity_score: 3",
    ],
    intake_summary: {
      jurisdiction: "Lebanon",
      case_type: "Syrian refugee child — late registration",
      flags: ["late_registration", "undocumented_parents"],
      complexity_score: 3,
    },
    research_summary: {
      legal_basis: "Lebanese Civil Code Decree 3260, MoI Circular 2015",
      substitutes: {
        "Birth notification": "Midwife record + witness statements",
        "National ID": "UNHCR certificate",
      },
    },
    gap_summary: {
      recommendation:
        "Gather midwife record and Mukhtar affidavit before Civil Status submission.",
    },
  },
  Kenya: {
    legal_pathway:
      "1. Obtain refugee attestation letter from UNHCR or camp administration.\n2. Collect health facility birth record or traditional birth attendant statement.\n3. Submit late birth registration to Assistant Chief's office.\n4. Register with Refugee Affairs Secretariat if nationality is undetermined.",
    required_documents: [
      "UNHCR Refugee Attestation Letter",
      "Health facility birth record",
      "Parents' refugee ID cards",
      "Camp registration proof",
    ],
    available_substitutes: [
      "Health facility record — substitute: traditional birth attendant affidavit",
      "National passport — substitute: refugee attestation letter",
    ],
    missing_documents: ["Health facility birth record"],
    submission_office: "Assistant Chief's Office, Dadaab / Kakuma, Kenya",
    estimated_timeline: "3–6 weeks",
    confidence_score: 0.79,
    country_specific_notes: [
      "Camp-born child — Births & Deaths Registration Act applies",
      "Refugees Act 2021 provisions for stateless children",
    ],
    intake_summary: {
      jurisdiction: "Kenya",
      case_type: "Refugee camp child — late registration",
      flags: ["late_registration", "camp_resident"],
      complexity_score: 3,
    },
    research_summary: {
      legal_basis: "Births & Deaths Registration Act, Refugees Act 2021",
      substitutes: {
        "Health record": "Traditional birth attendant affidavit",
        "Passport": "Refugee attestation letter",
      },
    },
    gap_summary: {
      recommendation:
        "Obtain TBA affidavit as substitute for missing health record before submission.",
    },
  },
};

const DEFAULT_RESULT = {
  legal_pathway:
    "1. Consult local civil registry for late birth registration requirements.\n2. Gather all available identity documents for parents.\n3. Obtain secondary evidence (witness statements, health records).\n4. Submit application with supporting cover letter.",
  required_documents: [
    "Proof of birth (hospital or health facility record)",
    "Parent identity documents",
    "Proof of residence or camp registration",
  ],
  available_substitutes: [
    "Birth record — substitute: witness statements from community leaders",
  ],
  missing_documents: ["Proof of birth"],
  submission_office: "Local Civil Registry Office",
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

function buildCoverLetter(intake, result) {
  const childRef = intake.child_name || "the child";
  const office = result.submission_office;
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `To Whom It May Concern,
${office}
${date}

RE: Application for Late Birth Registration — ${childRef}

Dear Registration Officer,

I am writing on behalf of ${childRef}, born on ${intake.date_of_birth} in ${intake.country_of_birth}, currently residing in ${intake.current_location || intake.current_country}. The family is seeking registration under applicable provisions for children born to displaced and stateless parents who lack standard civil documentation.

The parents currently hold the following documents: ${intake.parents_documents_held.length ? intake.parents_documents_held.join(", ") : "limited documentation due to displacement"}. Where original documents are unavailable, we respectfully submit legally accepted substitute evidence as outlined in ${result.research_summary?.legal_basis || "applicable local regulations"}.

We acknowledge that ${result.missing_documents.join(" and ") || "some required documents"} may be missing. However, substitute evidence has been identified: ${result.available_substitutes.join("; ") || "community witness statements and humanitarian registration records"}.

We respectfully request that this application be processed under late registration provisions. The family is prepared to provide any additional evidence required and to attend in person as needed.

${result.gap_summary?.recommendation || "We look forward to your guidance on next steps."}

Respectfully submitted,
UBlong Caseworker Support System
(On behalf of the family)`;
}

function getMockResult(intake) {
  const country = intake.current_country || intake.country_of_birth;
  const template = MOCK_RESULTS[country] || DEFAULT_RESULT;
  const caseId = uuidv4();

  const result = {
    case_id: caseId,
    ...template,
    cover_letter_draft: "",
  };
  result.cover_letter_draft = buildCoverLetter(intake, result);

  if (template.intake_summary?.complexity_score > 4) {
    result.country_specific_notes = [
      ...result.country_specific_notes,
      "FLAGGED FOR HUMAN LEGAL REVIEW — complexity score exceeds threshold",
    ];
  }

  return result;
}

/**
 * Streams mock AgentEvents over SSE, then calls onComplete with CaseResult.
 */
async function streamMockAgentPipeline(intake, sendEvent, onComplete) {
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  const events = [
    {
      type: "agent_start",
      agent: "intake",
      message: `Classifying case: child born in ${intake.country_of_birth}, residing in ${intake.current_country}.`,
    },
    {
      type: "agent_thinking",
      agent: "intake",
      message: "Determining primary jurisdiction and case type...",
    },
    {
      type: "agent_complete",
      agent: "intake",
      message: "Case classified. Complexity score assigned.",
      data: { agent: "intake" },
    },
    {
      type: "agent_start",
      agent: "research",
      message: `Querying legal database for ${intake.current_country} registration pathways.`,
    },
    {
      type: "agent_thinking",
      agent: "research",
      message: "Retrieving top 5 relevant legal document chunks from vector store...",
    },
    {
      type: "agent_thinking",
      agent: "research",
      message: "Synthesising step-by-step registration pathway from retrieved context.",
    },
    {
      type: "agent_complete",
      agent: "research",
      message: "Legal pathway and required documents identified.",
      data: { agent: "research" },
    },
    {
      type: "agent_start",
      agent: "gap_analysis",
      message: "Comparing family documents against legal requirements...",
    },
    {
      type: "agent_thinking",
      agent: "gap_analysis",
      message: `Family holds: ${intake.parents_documents_held.join(", ") || "no documents listed"}.`,
    },
    {
      type: "agent_thinking",
      agent: "gap_analysis",
      message: "Checking substitute document availability for missing items...",
    },
    {
      type: "agent_complete",
      agent: "gap_analysis",
      message: "Gap analysis complete. Drafting cover letter.",
      data: { agent: "gap_analysis" },
    },
  ];

  for (const event of events) {
    sendEvent(event);
    await delay(600 + Math.random() * 400);
  }

  const result = getMockResult(intake);
  sendEvent({ type: "result", data: result });
  onComplete(result);
}

module.exports = { streamMockAgentPipeline, getMockResult, buildCoverLetter };
