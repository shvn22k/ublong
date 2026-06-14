"use client";

import React from "react";
import { useApp, CaseStatus } from "@/context/AppContext";
import { translations } from "@/locales/translations";
import { motion } from "framer-motion";
import {
  Baby,
  Files,
  FileMinus,
  FileCheck,
  FilePlus,
  Rocket,
} from "lucide-react";

interface JourneyStep {
  id: number;
  label: string;
  desc: string;
  icon: React.ReactNode;
  triggerStatus: CaseStatus[];
}

export default function CaseJourney() {
  const { language, caseStatus } = useApp();
  const t = translations[language];

  const steps: JourneyStep[] = [
    {
      id: 1,
      label: "Child Birth",
      desc: "Hospital notification, midwife tags, or camp log entry.",
      icon: <Baby className="w-5 h-5" />,
      triggerStatus: ["ocr_scanning", "ocr_done", "agents_running", "agents_done", "submitting", "submitted", "approved"],
    },
    {
      id: 2,
      label: "Available Documents",
      desc: "Extract text from uploaded certificates, ID cards, or family records.",
      icon: <Files className="w-5 h-5" />,
      triggerStatus: ["ocr_done", "agents_running", "agents_done", "submitting", "submitted", "approved"],
    },
    {
      id: 3,
      label: "Missing Requirements",
      desc: "Identify missing forms or official certificates required by local laws.",
      icon: <FileMinus className="w-5 h-5" />,
      triggerStatus: ["agents_running", "agents_done", "submitting", "submitted", "approved"],
    },
    {
      id: 4,
      label: "Alternative Evidence",
      desc: "Synthesize witness affidavits, baptism reports, or secondary certificates.",
      icon: <FileCheck className="w-5 h-5" />,
      triggerStatus: ["agents_running", "agents_done", "submitting", "submitted", "approved"],
    },
    {
      id: 5,
      label: "Application Generated",
      desc: "Compile translated filings, statutory declarations, and appeal briefs.",
      icon: <FilePlus className="w-5 h-5" />,
      triggerStatus: ["agents_done", "submitting", "submitted", "approved"],
    },
    {
      id: 6,
      label: "Submission Ready",
      desc: "Transmit dossier package to registry or consular legal queues.",
      icon: <Rocket className="w-5 h-5" />,
      triggerStatus: ["submitting", "submitted", "approved"],
    },
  ];

  // Helper to check if a stage is active/passed
  const getStageState = (step: JourneyStep) => {
    if (caseStatus === "idle") return "inactive";
    if (caseStatus === "approved") return "completed";
    
    // Check if the current case status is in the step's triggers
    const isActive = step.triggerStatus.includes(caseStatus);
    const nextStep = steps.find((s) => s.id === step.id + 1);
    const isNextActive = nextStep ? nextStep.triggerStatus.includes(caseStatus) : false;

    if (isActive && isNextActive) return "completed";
    if (isActive) return "active";
    return "inactive";
  };

  return (
    <section className="py-24 px-6 bg-background border-t border-b border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            Digital Legal Pipeline
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-teal-50 tracking-tight mb-6">
            {t.caseJourneyTitle}
          </h2>
          <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 font-normal leading-relaxed">
            {t.caseJourneySub}
          </p>
        </div>

        {/* Journey Milestones grid layout */}
        <div className="relative">

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const state = getStageState(step);

              let statusColor = "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800";
              let glowColor = "bg-transparent";
              let textColor = "text-slate-700 dark:text-slate-400";

              if (state === "active") {
                statusColor = "bg-accent text-white border-accent shadow-md shadow-accent/15";
                glowColor = "bg-accent animate-ping opacity-35";
                textColor = "text-accent font-semibold";
              } else if (state === "completed") {
                statusColor = "bg-primary text-white border-primary shadow-sm shadow-primary/10";
                textColor = "text-primary dark:text-primary-hover";
              }

              return (
                <div key={step.id} className="flex flex-col items-center text-center relative group">
                  {/* Step Connector Line for mobile */}
                  {idx < steps.length - 1 && (
                    <div className="absolute top-14 left-1/2 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 lg:hidden -translate-x-1/2 -z-10" />
                  )}

                  {/* Icon Node */}
                  <div className="relative mb-6">
                    {/* Pulsing ring around active node */}
                    <div className={`absolute -inset-3 rounded-full ${glowColor}`} />
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-2 z-10 relative transition-colors duration-500 ${statusColor}`}
                    >
                      {step.icon}
                    </motion.div>
                    
                    {/* Step index badge */}
                    <span className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                      {step.id}
                    </span>
                  </div>

                  {/* Label */}
                  <h3 className={`font-display text-base font-bold mb-2 transition-colors duration-305 ${textColor}`}>
                    {step.label}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-xs text-slate-800 dark:text-slate-300 font-normal leading-relaxed max-w-[180px]">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
