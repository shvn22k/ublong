const SUPPORTED_COUNTRIES = ["Bangladesh", "Lebanon", "Kenya", "BD", "LB", "KE"];

const COUNTRY_ALIASES = {
  BD: "Bangladesh",
  LB: "Lebanon",
  KE: "Kenya",
  bangladesh: "Bangladesh",
  lebanon: "Lebanon",
  kenya: "Kenya",
};

function normalizeCountry(value) {
  if (!value) return "";
  const trimmed = value.trim();
  return COUNTRY_ALIASES[trimmed] || COUNTRY_ALIASES[trimmed.toLowerCase()] || trimmed;
}

function computeAgeMonths(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;
  const now = new Date();
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
  return Math.max(0, months);
}

function parseDocumentsHeld(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Accepts PRD snake_case or frontend camelCase and normalizes to intake schema.
 */
function normalizeIntake(body) {
  const countryOfBirth = normalizeCountry(
    body.country_of_birth || body.countryOfBirth || ""
  );
  const dateOfBirth = body.date_of_birth || body.dob || "";
  const currentLocation = body.current_location || body.currentLocation || "";
  const currentCountry = normalizeCountry(
    body.current_country || body.currentCountry || extractCountryFromLocation(currentLocation) || countryOfBirth
  );

  const intake = {
    country_of_birth: countryOfBirth,
    date_of_birth: dateOfBirth,
    current_country: currentCountry,
    father_nationality: body.father_nationality || body.fatherNationality || "",
    mother_nationality: body.mother_nationality || body.motherNationality || "",
    parents_documents_held: parseDocumentsHeld(
      body.parents_documents_held || body.parentsDocumentsHeld || body.documentsHeld
    ),
    child_age_months:
      body.child_age_months ??
      body.childAgeMonths ??
      computeAgeMonths(dateOfBirth),
    additional_context: body.additional_context || body.notes || "",
    child_name: body.child_name || body.childName || "",
    gender: body.gender || "",
    father_name: body.father_name || body.fatherName || "",
    mother_name: body.mother_name || body.motherName || "",
    current_location: currentLocation,
  };

  const errors = [];
  if (!intake.country_of_birth) errors.push("country_of_birth is required");
  if (!intake.date_of_birth) errors.push("date_of_birth is required");
  if (!intake.current_country) errors.push("current_country is required");

  return { intake, errors };
}

function extractCountryFromLocation(location) {
  if (!location) return "";
  const parts = location.split(",").map((p) => p.trim());
  return parts[parts.length - 1] || location;
}

function intakeToAgentPayload(intake) {
  return {
    country_of_birth: intake.country_of_birth,
    date_of_birth: intake.date_of_birth,
    current_country: intake.current_country,
    father_nationality: intake.father_nationality,
    mother_nationality: intake.mother_nationality,
    parents_documents_held: intake.parents_documents_held,
    child_age_months: intake.child_age_months,
    additional_context: intake.additional_context,
    child_name: intake.child_name,
    gender: intake.gender,
    father_name: intake.father_name,
    mother_name: intake.mother_name,
    current_location: intake.current_location,
  };
}

module.exports = {
  SUPPORTED_COUNTRIES,
  normalizeIntake,
  intakeToAgentPayload,
  computeAgeMonths,
};
