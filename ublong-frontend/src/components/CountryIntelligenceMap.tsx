"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { translations } from "@/locales/translations";
import { motion, AnimatePresence } from "framer-motion";
import { Info, FileText, Scale, Milestone, Calendar, X, Globe } from "lucide-react";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("@/components/DynamicMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
      <Globe className="w-8 h-8 text-primary animate-spin" />
    </div>
  )
});

interface CountryIntel {
  name: string;
  code: string;
  requiredDocs: string[];
  pathways: string[];
  alternativeProofs: string[];
  timeline: string;
  situation: string;
}

const countryIntelData: Record<string, CountryIntel> = {
  Syria: {
    name: "Syria",
    code: "SYR",
    requiredDocs: [
      "Hospital Birth Notification",
      "Parent Marriage Certificate (Civil or Religious)",
      "Parent Family Book or National ID",
    ],
    pathways: [
      "Standard Registration within 30 days of birth.",
      "Consular Registration for children born outside the country.",
      "Judicial court action required for registrations after 1 year.",
    ],
    alternativeProofs: [
      "Midwife Certificate signed by Mukhtar (Local Leader)",
      "Testimony of 2 adult witnesses (relatives or neighbours)",
      "DNA validation test in local family courts",
    ],
    timeline: "1 - 3 months",
    situation: "Displacement makes standard civil documentation extremely difficult to retrieve, requiring secondary verification routes.",
  },
  Afghanistan: {
    name: "Afghanistan",
    code: "AFG",
    requiredDocs: [
      "Kart-e-Tawalud (Hospital Birth Notification)",
      "Tazkira (National Identity Card) of Father",
      "Marriage Certificate",
    ],
    pathways: [
      "Civil registry department birth certificate request.",
      "Consular filing in host countries.",
      "Community elder witness declarations for remote provinces.",
    ],
    alternativeProofs: [
      "Local Mosque registry book record",
      "Declaration from village Shura (Elder Council)",
      "Midwife affidavit verified by local council",
    ],
    timeline: "2 - 4 months",
    situation: "High rural population requires community leadership structures (Shuras) to sign off on civil registrations.",
  },
  SouthSudan: {
    name: "South Sudan",
    code: "SSD",
    requiredDocs: [
      "Hospital birth notification sheet",
      "Declaration of birth form signed by doctor",
      "Parents' citizenship documents",
    ],
    pathways: [
      "Ministry of Health birth certificate application.",
      "Court of Law validation declaration (for kids older than 5).",
    ],
    alternativeProofs: [
      "Church baptism registry records",
      "Declaration by traditional Chief or village leader",
      "Vaccination card records",
    ],
    timeline: "3 - 6 months",
    situation: "Lack of centralized databases makes baptism and church documentation high-priority secondary proofs.",
  },
  Venezuela: {
    name: "Venezuela",
    code: "VEN",
    requiredDocs: [
      "Acta de Nacimiento (Birth Notification from Clinic)",
      "Parents' Cédula de Identidad (ID Cards)",
      "Marriage Certificate (if applicable)",
    ],
    pathways: [
      "Filing at local Registro Civil (Civil Registry office).",
      "Consular office registry (for children born to Venezuelan parents abroad).",
    ],
    alternativeProofs: [
      "Witness statement by two adult Venezuelan citizens",
      "Baptismal certificate or Catholic Church registry entry",
      "Public school enrollment letter",
    ],
    timeline: "2 - 3 months",
    situation: "Hyperinflation and displacement have disrupted administrative lines, elevating the value of school enrollment or church documents as secondary proofs.",
  },
  Myanmar: {
    name: "Myanmar",
    code: "MMR",
    requiredDocs: [
      "Hospital live-birth certificate",
      "Household registration list (Household Book)",
      "Parents' National Registration Identity Cards (NRC)",
    ],
    pathways: [
      "Township administration civil registrar filing.",
      "Local health officer registry reporting.",
    ],
    alternativeProofs: [
      "Refugee camp administrator registration index number",
      "Midwife notification sheet signed by village authority",
      "School admission register records",
    ],
    timeline: "3 - 5 months",
    situation: "Stateless minority groups require special alternative proof mechanisms (like UNHCR camp indexes) to build legal briefs.",
  },
};

export default function CountryIntelligenceMap() {
  const { language } = useApp();
  const t = translations[language];
  const [selectedCountry, setSelectedCountry] = useState<CountryIntel | null>(null);

  const countriesList = [
    { name: "Syria", code: "SYR", coords: [34.8021, 38.9968] as [number, number] },
    { name: "Afghanistan", code: "AFG", coords: [33.9391, 67.7100] as [number, number] },
    { name: "South Sudan", code: "SSD", coords: [6.8770, 31.3070] as [number, number] },
    { name: "Venezuela", code: "VEN", coords: [6.4238, -66.5897] as [number, number] },
    { name: "Myanmar", code: "MMR", coords: [21.9162, 95.9560] as [number, number] }
  ];

  return (
    <section className="py-24 px-6 bg-background" id="country-intelligence">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            Global Knowledge Base
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-teal-50 tracking-tight mb-6">
            {t.countryIntelTitle}
          </h2>
          <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 font-normal leading-relaxed">
            {t.countryIntelSub}
          </p>
        </div>

        {/* Map + Side Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Map Vector (Left 7 Columns) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-205 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[420px]">
            <div className="absolute top-4 left-4 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium z-10 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-full backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <Globe className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: "20s" }} />
              <span>Click highlighted markers to view intelligence</span>
            </div>

            {/* OpenStreetMap Interactive Container */}
            <div className="flex-1 w-full h-full relative z-0 mt-8 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <DynamicMap 
                countries={countriesList} 
                onSelectCountry={(code) => {
                  const country = Object.values(countryIntelData).find(c => c.code === code);
                  if (country) setSelectedCountry(country);
                }}
                selectedCode={selectedCountry?.code}
              />
            </div>

            {/* Hint overlay */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex gap-4 text-[10px] md:text-xs text-slate-500 select-none mt-4">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" /> Active Regions
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" /> Out of Scope
              </span>
            </div>
          </div>

          {/* Animated side panel info (Right 5 Columns) */}
          <div className="lg:col-span-5 h-full">
            <AnimatePresence mode="wait">
              {selectedCountry ? (
                <motion.div
                  key={selectedCountry.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-accent uppercase">
                        Jurisdictional Intelligence
                      </span>
                      <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-teal-50 mt-1">
                        {selectedCountry.name} ({selectedCountry.code})
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedCountry(null)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-650 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-300 italic mb-6 leading-relaxed">
                    {selectedCountry.situation}
                  </p>

                  <div className="flex flex-col gap-5">
                    {/* Required Docs */}
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-primary">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                          Standard Required Documents
                        </h4>
                        <ul className="list-disc list-inside text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-normal">
                          {selectedCountry.requiredDocs.map((doc, idx) => (
                            <li key={idx}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Pathways */}
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-accent">
                        <Scale className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                          Legal Action Pathways
                        </h4>
                        <ul className="list-disc list-inside text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-normal">
                          {selectedCountry.pathways.map((path, idx) => (
                            <li key={idx}>{path}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Alt Proofs */}
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-secondary">
                        <Milestone className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                          Accepted Alternative Evidence
                        </h4>
                        <ul className="list-disc list-inside text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-normal">
                          {selectedCountry.alternativeProofs.map((alt, idx) => (
                            <li key={idx}>{alt}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-success">
                        <Calendar className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                          Estimated Registry Timeline
                        </h4>
                        <p className="text-xs text-slate-850 dark:text-slate-200 font-semibold">
                          {selectedCountry.timeline}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full bg-slate-50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 min-h-[380px]"
                >
                  <Info className="w-10 h-10 mb-4 text-primary/40" />
                  <p className="text-sm font-medium">Select a country marker on the map to display legal metadata dossier.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
