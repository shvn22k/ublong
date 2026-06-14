"use client";

import React, { useState } from "react";
import type { CaseResult } from "@/lib/api";
import {
  Route,
  FileCheck2,
  Replace,
  AlertTriangle,
  Building2,
  Clock,
  Gauge,
  Flag,
  Copy,
  Check,
  Download,
} from "lucide-react";

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
      <h4 className="text-sm font-bold text-slate-900 dark:text-teal-50 mb-3 flex items-center gap-2">
        {icon} {title}
      </h4>
      {children}
    </div>
  );
}

export default function CaseResultView({ result }: { result: CaseResult }) {
  const [copied, setCopied] = useState(false);

  const confidence = Math.round((result.confidence_score ?? 0) * 100);
  const pathwaySteps = (result.legal_pathway || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const copyLetter = async () => {
    try {
      await navigator.clipboard.writeText(result.cover_letter_draft || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const downloadLetter = () => {
    const blob = new Blob([result.cover_letter_draft || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${result.case_id || "case"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8 space-y-5">
      {/* Header / confidence */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-1">
            Analysis Complete
          </span>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Case ID: <span className="font-mono text-xs">{result.case_id}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-primary" />
          <span className="text-2xl font-display font-bold text-slate-900 dark:text-teal-50">
            {confidence}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">confidence</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Legal pathway */}
        <Section icon={<Route className="w-4 h-4 text-primary" />} title="Legal Pathway">
          <ol className="space-y-2">
            {pathwaySteps.length ? (
              pathwaySteps.map((step, i) => (
                <li key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {step}
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500">No pathway returned.</li>
            )}
          </ol>
        </Section>

        {/* Required documents */}
        <Section icon={<FileCheck2 className="w-4 h-4 text-teal-600" />} title="Required Documents">
          <ul className="space-y-1.5">
            {result.required_documents?.length ? (
              result.required_documents.map((d, i) => (
                <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex gap-2">
                  <span className="text-teal-500">•</span> {d}
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500">None listed.</li>
            )}
          </ul>
        </Section>

        {/* Available substitutes */}
        <Section icon={<Replace className="w-4 h-4 text-emerald-600" />} title="Available Substitutes">
          <ul className="space-y-1.5">
            {result.available_substitutes?.length ? (
              result.available_substitutes.map((d, i) => (
                <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex gap-2">
                  <span className="text-emerald-500">↺</span> {d}
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500">None identified.</li>
            )}
          </ul>
        </Section>

        {/* Missing documents */}
        <Section
          icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
          title="Missing / Blocked Documents"
        >
          <ul className="space-y-1.5">
            {result.missing_documents?.length ? (
              result.missing_documents.map((d, i) => (
                <li key={i} className="text-sm text-rose-600 dark:text-rose-400 flex gap-2">
                  <span>✕</span> {d}
                </li>
              ))
            ) : (
              <li className="text-sm text-success">No blocking gaps — all requirements covered.</li>
            )}
          </ul>
        </Section>
      </div>

      {/* Office / timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Section icon={<Building2 className="w-4 h-4 text-secondary" />} title="Submission Office">
          <p className="text-sm text-slate-700 dark:text-slate-300">{result.submission_office}</p>
        </Section>
        <Section icon={<Clock className="w-4 h-4 text-amber-500" />} title="Estimated Timeline">
          <p className="text-sm text-slate-700 dark:text-slate-300">{result.estimated_timeline}</p>
        </Section>
      </div>

      {/* Country notes / flags */}
      {result.country_specific_notes?.length ? (
        <Section icon={<Flag className="w-4 h-4 text-orange-500" />} title="Notes & Flags">
          <div className="flex flex-wrap gap-2">
            {result.country_specific_notes.map((n, i) => (
              <span
                key={i}
                className="text-xs px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900"
              >
                {n}
              </span>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Cover letter */}
      <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-teal-50 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-primary" /> Cover Letter Draft
          </h4>
          <div className="flex gap-2">
            <button
              onClick={copyLetter}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={downloadLetter}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>
        </div>
        <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 max-h-96 overflow-y-auto">
          {result.cover_letter_draft || "No cover letter generated."}
        </pre>
      </div>
    </div>
  );
}
