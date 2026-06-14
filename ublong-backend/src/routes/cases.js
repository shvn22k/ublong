const express = require("express");
const Case = require("../models/Case");
const { authenticate } = require("../middleware/auth");
const { processCase } = require("../services/agentsClient");
const { normalizeIntake, intakeToAgentPayload } = require("../utils/validation");
const { asyncHandler, setupSSE } = require("../utils/helpers");

const router = express.Router();

const VALID_STATUSES = ["pending", "processing", "completed", "flagged_for_review"];

router.use(authenticate);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { intake, errors } = normalizeIntake(req.body);

    if (errors.length) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    const caseDoc = await Case.create({
      created_by: req.user._id,
      status: "pending",
      intake,
    });

    res.status(201).json(caseDoc);
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = configDemoFilter(req);
    const cases = await Case.find(filter).sort({ created_at: -1 }).lean();
    res.json({ cases, count: cases.length });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const caseDoc = await findCaseForUser(req);
    if (!caseDoc) return res.status(404).json({ error: "Case not found" });
    res.json(caseDoc);
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        allowed: VALID_STATUSES,
      });
    }

    const caseDoc = await findCaseForUser(req);
    if (!caseDoc) return res.status(404).json({ error: "Case not found" });

    if (status) caseDoc.status = status;
    await caseDoc.save();

    res.json(caseDoc);
  })
);

router.post(
  "/:id/process",
  asyncHandler(async (req, res) => {
    const caseDoc = await findCaseForUser(req);
    if (!caseDoc) return res.status(404).json({ error: "Case not found" });

    if (caseDoc.status === "processing") {
      return res.status(409).json({ error: "Case is already being processed" });
    }

    caseDoc.status = "processing";
    await caseDoc.save();

    setupSSE(res);

    const intake = intakeToAgentPayload(caseDoc.intake);

    const onComplete = async (result) => {
      try {
        const complexity = result.intake_summary?.complexity_score;
        const flagged =
          complexity > 4 ||
          (result.country_specific_notes || []).some((n) =>
            String(n).toLowerCase().includes("flagged for human")
          );

        caseDoc.case_id = result.case_id;
        caseDoc.result = result;
        caseDoc.status = flagged ? "flagged_for_review" : "completed";
        await caseDoc.save();
        res.end();
      } catch (err) {
        console.error("Failed to save case result:", err);
        res.end();
      }
    };

    req.on("close", () => {
      if (!res.writableEnded) {
        console.log(`Client disconnected during processing of case ${caseDoc._id}`);
      }
    });

    try {
      await processCase(intake, res, onComplete);
    } catch (err) {
      caseDoc.status = "pending";
      await caseDoc.save();
      if (!res.headersSent) {
        res.status(502).json({ error: "Agent pipeline failed", message: err.message });
      } else {
        res.end();
      }
    }
  })
);

router.get(
  "/:id/documents",
  asyncHandler(async (req, res) => {
    const caseDoc = await findCaseForUser(req);
    if (!caseDoc) return res.status(404).json({ error: "Case not found" });

    if (!caseDoc.result) {
      return res.status(404).json({ error: "No documents generated yet. Process the case first." });
    }

    const result = caseDoc.result;

    res.json({
      case_id: caseDoc.case_id,
      status: caseDoc.status,
      documents: [
        {
          type: "cover_letter",
          title: "Cover Letter Draft",
          content: result.cover_letter_draft,
          format: "text",
        },
        {
          type: "document_checklist",
          title: "Document Checklist",
          required: result.required_documents || [],
          available_substitutes: result.available_substitutes || [],
          missing: result.missing_documents || [],
          format: "checklist",
        },
        {
          type: "legal_pathway",
          title: "Legal Pathway",
          content: result.legal_pathway,
          submission_office: result.submission_office,
          estimated_timeline: result.estimated_timeline,
          format: "text",
        },
      ],
    });
  })
);

function configDemoFilter(req) {
  const config = require("../config/env");
  if (config.demoMode) return {};
  return { created_by: req.user._id };
}

async function findCaseForUser(req) {
  const config = require("../config/env");
  const query = { _id: req.params.id };
  if (!config.demoMode) {
    query.created_by = req.user._id;
  }
  return Case.findOne(query);
}

module.exports = router;
