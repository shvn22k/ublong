"use client";

import React from "react";
import { useApp, CaseStatus } from "@/context/AppContext";
import { translations } from "@/locales/translations";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  Send,
  Hourglass,
  CheckCircle,
  FileCheck,
  Download,
  AlertCircle,
} from "lucide-react";
import confetti from "canvas-confetti";

interface TrackerStep {
  label: string;
  desc: string;
  icon: React.ReactNode;
  statusMatch: CaseStatus[];
}

export default function TimelineTracker() {
  const { language, caseStatus, caseData } = useApp();
  const t = translations[language];

  const trackerSteps: TrackerStep[] = [
    {
      label: "Researching",
      desc: "Analyzing national laws & regional decrees.",
      icon: <Search className="w-5 h-5" />,
      statusMatch: ["agents_running"],
    },
    {
      label: "Generating Documents",
      desc: "Compiling forms, affidavits & translations.",
      icon: <FileText className="w-5 h-5" />,
      statusMatch: ["agents_done"],
    },
    {
      label: "Submitting Dossier",
      desc: "Transmitting package to host registrars.",
      icon: <Send className="w-5 h-5" />,
      statusMatch: ["submitting"],
    },
    {
      label: "Pending Review",
      desc: "Civil office verifying alternative proofs.",
      icon: <Hourglass className="w-5 h-5" />,
      statusMatch: ["submitted"],
    },
    {
      label: "Approved",
      desc: "Birth Certificate registered & secured.",
      icon: <CheckCircle className="w-5 h-5" />,
      statusMatch: ["approved"],
    },
  ];

  // Map caseStatus to index (0-4)
  const getActiveStepIndex = (): number => {
    if (caseStatus === "idle" || caseStatus === "ocr_scanning" || caseStatus === "ocr_done") return -1;
    if (caseStatus === "agents_running") return 0;
    if (caseStatus === "agents_done") return 1;
    if (caseStatus === "submitting") return 2;
    if (caseStatus === "submitted") return 3;
    if (caseStatus === "approved") {
      // Trigger celebrate
      if (typeof window !== "undefined") {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      }
      return 4;
    }
    return -1;
  };

  const activeIndex = getActiveStepIndex();

  const mockDocs = [
    { name: "Statutory_Declaration_Birth.pdf", size: "142 KB", type: "Affidavit" },
    { name: "Witness_Affidavit_Yousef.pdf", size: "98 KB", type: "Legal Statement" },
    { name: "Arabic_Translation_Pack.pdf", size: "310 KB", type: "Translations" },
    { name: "Midwife_Confirmation_Mukhtar.pdf", size: "85 KB", type: "Secondary Proof" },
  ];

  return (
    <section className="py-24 px-6 bg-background" id="timeline-tracker">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-10">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
              Case Supervision
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-teal-50 leading-tight">
              {t.timelineTitle}
            </h2>
            <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 mt-4 font-normal leading-relaxed">
              {t.timelineSub}
            </p>
          </div>
        </div>

        {/* Dashboard Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Stepper tracking path (Left 7 columns) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900/40 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col gap-8 relative">
              {/* Vertical stepper connecting line */}
              <div className="absolute top-6 bottom-6 left-6 w-0.5 bg-slate-200 dark:bg-slate-800" />
              
              {/* Dynamic filled tracking progress line */}
              <div
                className="absolute top-6 left-6 w-0.5 bg-primary transition-all duration-1000 origin-top"
                style={{
                  height: activeIndex >= 0 ? `${(activeIndex / (trackerSteps.length - 1)) * 100}%` : "0%",
                  maxHeight: "calc(100% - 48px)"
                }}
              />

              {trackerSteps.map((step, idx) => {
                const isActive = activeIndex === idx;
                const isPassed = activeIndex > idx;
                
                let stepColor = "bg-white dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800";
                let textColor = "text-slate-700 dark:text-slate-400";
                
                if (isActive) {
                  stepColor = "bg-accent text-white border-accent shadow-md shadow-accent/15 scale-105";
                  textColor = "text-accent font-semibold";
                } else if (isPassed) {
                  stepColor = "bg-primary text-white border-primary-hover";
                  textColor = "text-primary dark:text-primary-hover";
                }

                return (
                  <div key={idx} className="flex gap-6 items-start relative z-10">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-500 ${stepColor}`}>
                      {step.icon}
                    </div>
                    <div>
                      <h4 className={`text-base font-display ${textColor}`}>
                        {step.label}
                      </h4>
                      <p className="text-xs text-slate-800 dark:text-slate-300 font-normal mt-1">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dossier details and files preview panel (Right 5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Active Case Summary Card */}
            <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-primary" /> Current Case Dossier
              </h3>
              
              <div className="flex flex-col gap-3 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span>Target Child:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{caseData.childName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span>Date of Birth:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{caseData.birthDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span>Jurisdiction:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{caseData.country}</span>
                </div>
              </div>
            </div>

            {/* Generated Documents Checklist */}
            <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                Compiled Documents ({activeIndex >= 1 ? mockDocs.length : 0}/4)
              </h3>

              <div className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {activeIndex >= 1 ? (
                    mockDocs.map((doc, idx) => (
                      <motion.div
                        key={doc.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: idx * 0.15 }}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850/70 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[160px]">
                              {doc.name}
                            </h4>
                            <span className="text-[10px] text-slate-500">{doc.type} • {doc.size}</span>
                          </div>
                        </div>
                        <button
                          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-primary transition-colors cursor-pointer"
                          title="Download Generated PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
                      <AlertCircle className="w-7 h-7 text-slate-300 dark:text-slate-800" />
                      <p className="text-xs font-normal">No documents generated yet. Run the case simulation to compile filing templates.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
