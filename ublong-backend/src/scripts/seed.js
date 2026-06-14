/**
 * Seeds demo caseworker + 3 pre-loaded cases (Bangladesh, Lebanon, Kenya).
 * Run: npm run seed
 */
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Case = require("../models/Case");
const { getMockResult } = require("../services/mockAgents");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ublong";

const DEMO_USER = {
  name: "Ayesha Rahman",
  email: "demo@ublong.org",
  password: "demo123",
  organisation: "UNHCR Field Office",
};

const DEMO_CASES = [
  {
    intake: {
      child_name: "Ayesha",
      country_of_birth: "Bangladesh",
      date_of_birth: "2024-03-15",
      current_country: "Bangladesh",
      current_location: "Kutupalong Camp, Cox's Bazar",
      father_nationality: "Myanmar (Rohingya)",
      mother_nationality: "Myanmar (Rohingya)",
      father_name: "Mohammed Rahman",
      mother_name: "Fatima Rahman",
      parents_documents_held: ["UNHCR Family Registration Card"],
      child_age_months: 14,
      additional_context: "Father missing since 2023. Child born in camp without health facility record.",
      gender: "Female",
    },
    status: "completed",
  },
  {
    intake: {
      child_name: "Omar",
      country_of_birth: "Syria",
      date_of_birth: "2023-06-10",
      current_country: "Lebanon",
      current_location: "Bekaa Valley, Lebanon",
      father_nationality: "Syrian",
      mother_nationality: "Syrian",
      father_name: "Hassan Al-Khatib",
      mother_name: "Layla Al-Khatib",
      parents_documents_held: ["UNHCR Registration Certificate"],
      child_age_months: 20,
      additional_context: "No hospital birth notification. Family displaced from Aleppo.",
      gender: "Male",
    },
    status: "completed",
  },
  {
    intake: {
      child_name: "Grace",
      country_of_birth: "South Sudan",
      date_of_birth: "2022-11-22",
      current_country: "Kenya",
      current_location: "Kakuma Camp, Kenya",
      father_nationality: "South Sudanese",
      mother_nationality: "South Sudanese",
      father_name: "Peter Deng",
      mother_name: "Mary Deng",
      parents_documents_held: ["UNHCR Refugee Attestation Letter", "Camp Registration Card"],
      child_age_months: 30,
      additional_context: "No health facility record. Traditional birth attendant present at delivery.",
      gender: "Female",
    },
    status: "completed",
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("Connected to MongoDB");

  let user = await User.findOne({ email: DEMO_USER.email });
  if (!user) {
    const password_hash = await bcrypt.hash(DEMO_USER.password, 10);
    user = await User.create({
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      password_hash,
      organisation: DEMO_USER.organisation,
    });
    console.log(`Created demo user: ${DEMO_USER.email} / ${DEMO_USER.password}`);
  } else {
    console.log(`Demo user already exists: ${DEMO_USER.email}`);
  }

  await Case.deleteMany({ created_by: user._id });
  console.log("Cleared existing demo cases");

  for (const demo of DEMO_CASES) {
    const result = getMockResult(demo.intake);
    await Case.create({
      created_by: user._id,
      case_id: result.case_id,
      status: demo.status,
      intake: demo.intake,
      result,
    });
    console.log(`Seeded case: ${demo.intake.child_name} (${demo.intake.current_country})`);
  }

  console.log("\nSeed complete.");
  console.log(`Login: POST /auth/login  { "email": "${DEMO_USER.email}", "password": "${DEMO_USER.password}" }`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
