const mongoose = require("mongoose");

const intakeSchema = new mongoose.Schema(
  {
    // PRD CaseInput fields
    country_of_birth: { type: String, required: true },
    date_of_birth: { type: String, required: true },
    current_country: { type: String, required: true },
    father_nationality: { type: String, default: "" },
    mother_nationality: { type: String, default: "" },
    parents_documents_held: { type: [String], default: [] },
    child_age_months: { type: Number },
    additional_context: { type: String, default: "" },

    // Frontend-extended fields
    child_name: { type: String, default: "" },
    gender: { type: String, default: "" },
    father_name: { type: String, default: "" },
    mother_name: { type: String, default: "" },
    current_location: { type: String, default: "" },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    case_id: String,
    legal_pathway: String,
    required_documents: [String],
    available_substitutes: [String],
    missing_documents: [String],
    submission_office: String,
    estimated_timeline: String,
    cover_letter_draft: String,
    confidence_score: Number,
    country_specific_notes: [String],
    intake_summary: mongoose.Schema.Types.Mixed,
    research_summary: mongoose.Schema.Types.Mixed,
    gap_summary: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const caseSchema = new mongoose.Schema(
  {
    case_id: { type: String, unique: true, sparse: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "flagged_for_review"],
      default: "pending",
    },
    intake: { type: intakeSchema, required: true },
    result: { type: resultSchema, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Case", caseSchema);
