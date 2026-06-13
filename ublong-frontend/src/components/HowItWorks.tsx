"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { translations } from "@/locales/translations";
import { motion } from "framer-motion";
import {
  UserCheck,
  SearchCode,
  FileQuestion,
  FileSignature,
  Activity,
  AlertOctagon,
} from "lucide-react";

export default function HowItWorks() {
  const { language } = useApp();
  const t = translations[language];
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      num: "01",
      icon: <UserCheck className="w-6 h-6 text-teal-700 dark:text-teal-400" />,
      title: t.step1Title,
      desc: t.step1Desc,
      details:
        "Input whatever documents or memories you have. Hospital sheets, camp registry tags, family bibles, or witness statements are gathered and encrypted in our zero-knowledge archive.",
    },
    {
      num: "02",
      icon: <SearchCode className="w-6 h-6 text-orange-500" />,
      title: t.step2Title,
      desc: t.step2Desc,
      details:
        "The Research AI parses matching domestic codes, regional decrees, human rights conventions, and historical bilateral treaties to discover appropriate avenues for registration.",
    },
    {
      num: "03",
      icon: <FileQuestion className="w-6 h-6 text-amber-500" />,
      title: t.step3Title,
      desc: t.step3Desc,
      details:
        "We pinpoint document gaps and generate a Checklist of Alternative Evidence. If standard certificates are missing, the system suggests valid secondary proofs like baptism certificates.",
    },
    {
      num: "04",
      icon: <FileSignature className="w-6 h-6 text-emerald-600" />,
      title: t.step4Title,
      desc: t.step4Desc,
      details:
        "Legal agents auto-compile pre-filled localized application templates, statutory declarations, witness affidavits, and coversheets, translating them into destination formats.",
    },
    {
      num: "05",
      icon: <Activity className="w-6 h-6 text-teal-600" />,
      title: t.step5Title,
      desc: t.step5Desc,
      details:
        "Follow submission milestones dynamically. Our tracking agents monitor public civil registries, consular notices, and legal queues, updating you via SMS or browser alerts.",
    },
    {
      num: "06",
      icon: <AlertOctagon className="w-6 h-6 text-rose-500" />,
      title: t.step6Title,
      desc: t.step6Desc,
      details:
        "If rejected, UBlong analyzes the rejection notice. The Legal Agent generates customized formal appeal petitions, supporting briefs, and schedules review hearings.",
    },
  ];

  return (
    <section
      className="py-24 px-6 bg-background overflow-hidden"
      id="how-it-works"
    >
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            System Architecture
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-slate-900 dark:text-teal-50 tracking-tight mb-6">
            {t.howItWorksTitle}
          </h2>
          <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 font-normal leading-relaxed">
            {t.howItWorksSub}
          </p>
        </div>



        {/* Horizontal Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
          {steps.map((step, idx) => {
            const isHovered = activeStep === idx;
            return (
              <motion.div
                key={idx}
                onMouseEnter={() => setActiveStep(idx)}
                onMouseLeave={() => setActiveStep(null)}
                layout
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[340px] relative overflow-hidden group cursor-pointer"
                style={{
                  gridColumn: "span 1",
                }}
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
              >
                {/* Decorative border glow */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />

                <div>
                  {/* Step Num & Icon */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-display text-4xl font-extrabold text-slate-100 dark:text-slate-800 transition-colors group-hover:text-primary/20">
                      {step.num}
                    </span>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                      {step.icon}
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-850 dark:text-slate-200 font-normal leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Expanded content on hover */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: isHovered ? "auto" : 0,
                      opacity: isHovered ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-[11px] lg:text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-normal"
                  >
                    {step.details}
                  </motion.div>
                  {!isHovered && (
                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Details
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
