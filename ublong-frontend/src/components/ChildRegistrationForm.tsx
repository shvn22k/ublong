"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  User,
  Calendar,
  MapPin,
  Users,
  Globe,
  FileText,
  Send,
  Loader2,
  Terminal,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import {
  submitAndProcess,
  type CaseIntake,
  type CaseResult,
  type StreamEvent,
} from "@/lib/api";
import CaseResultView from "@/components/CaseResultView";

type RunStatus = "idle" | "running" | "done" | "error";

interface LogLine {
  agent: string;
  message: string;
  time: string;
}

const DOCUMENT_OPTIONS = [
  "UNHCR Family Registration Card",
  "UNHCR Registration Certificate",
  "UNHCR Refugee Attestation Letter",
  "Camp Registration Card",
  "Hospital Birth Notification",
  "Parent National ID",
  "Parent Passport",
];

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all";

export default function ChildRegistrationForm() {
  const [formData, setFormData] = useState({
    childName: "",
    dob: "",
    gender: "",
    fatherName: "",
    motherName: "",
    fatherNationality: "",
    motherNationality: "",
    countryOfBirth: "",
    currentCountry: "",
    currentLocation: "",
    notes: "",
  });
  const [documentsHeld, setDocumentsHeld] = useState<string[]>([]);

  const [status, setStatus] = useState<RunStatus>("idle");
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [result, setResult] = useState<CaseResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const logEndRef = useRef<HTMLDivElement>(null);
  const logBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleDoc = (doc: string) => {
    setDocumentsHeld((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  const ts = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("running");
    setLogs([]);
    setResult(null);
    setErrorMsg("");

    const intake: CaseIntake = {
      childName: formData.childName,
      dob: formData.dob,
      gender: formData.gender,
      fatherName: formData.fatherName,
      motherName: formData.motherName,
      fatherNationality: formData.fatherNationality,
      motherNationality: formData.motherNationality,
      countryOfBirth: formData.countryOfBirth,
      currentCountry: formData.currentCountry || formData.countryOfBirth,
      currentLocation: formData.currentLocation,
      documentsHeld,
      notes: formData.notes,
    };

    const onEvent = (ev: StreamEvent) => {
      if (ev.type === "result") return; // handled via return value
      if (ev.message) {
        setLogs((prev) => [
          ...prev,
          { agent: ev.agent || "system", message: ev.message!, time: ts() },
        ]);
      }
    };

    try {
      const finalResult = await submitAndProcess(intake, onEvent);
      if (finalResult) {
        setResult(finalResult);
        setStatus("done");
      } else {
        throw new Error("Pipeline finished without returning a result.");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setLogs([]);
    setResult(null);
    setErrorMsg("");
  };

  const isRunning = status === "running";

  return (
    <section className="py-24 px-6 bg-background" id="registration-form">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            Initiate Case
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 dark:text-teal-50 tracking-tight mb-4">
            Child Registration Intake
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 font-medium">
            Provide the details below to start the legal identity recovery process. Our AI agents
            analyse the case live and return the legal pathway, document gaps, and a drafted cover
            letter.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/50 p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          {status === "idle" ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Child Details */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-teal-50 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <User className="w-5 h-5 text-primary" /> Child Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Full Name
                    </label>
                    <input
                      required
                      type="text"
                      name="childName"
                      value={formData.childName}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="Enter child's full name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          required
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className={`${inputCls} pl-10`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Gender
                      </label>
                      <select
                        required
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={inputCls}
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parents Details */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-teal-50 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Users className="w-5 h-5 text-accent" /> Parent Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Mother&apos;s Full Name
                    </label>
                    <input
                      required
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="Enter mother's full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Father&apos;s Full Name
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="Enter father's full name (if known)"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Mother&apos;s Nationality
                    </label>
                    <input
                      required
                      type="text"
                      name="motherNationality"
                      value={formData.motherNationality}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="e.g. Myanmar (Rohingya)"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Father&apos;s Nationality
                    </label>
                    <input
                      type="text"
                      name="fatherNationality"
                      value={formData.fatherNationality}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="e.g. Myanmar (Rohingya)"
                    />
                  </div>
                </div>
              </div>

              {/* Geography */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-teal-50 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Globe className="w-5 h-5 text-secondary" /> Geographical Context
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Country of Birth
                    </label>
                    <input
                      required
                      type="text"
                      name="countryOfBirth"
                      value={formData.countryOfBirth}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="e.g. Bangladesh"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Current Country
                    </label>
                    <select
                      required
                      name="currentCountry"
                      value={formData.currentCountry}
                      onChange={handleChange}
                      className={inputCls}
                    >
                      <option value="">Select Country</option>
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="Lebanon">Lebanon</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Current Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        required
                        type="text"
                        name="currentLocation"
                        value={formData.currentLocation}
                        onChange={handleChange}
                        className={`${inputCls} pl-10`}
                        placeholder="City, Camp Name (e.g. Kutupalong Camp, Cox's Bazar)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents held */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-teal-50 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <FileText className="w-5 h-5 text-slate-500" /> Documents the Family Holds
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DOCUMENT_OPTIONS.map((doc) => (
                    <label
                      key={doc}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all text-sm ${
                        documentsHeld.includes(doc)
                          ? "border-primary bg-primary/5 text-slate-900 dark:text-teal-50"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={documentsHeld.includes(doc)}
                        onChange={() => toggleDoc(doc)}
                        className="accent-primary w-4 h-4"
                      />
                      {doc}
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-teal-50 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <FileText className="w-5 h-5 text-slate-500" /> Additional Notes
                </h3>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className={`${inputCls} resize-none`}
                  placeholder="Missing documents, displacement timeline, absent parent, etc."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold tracking-wide shadow-lg shadow-primary/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Submit Case for Analysis
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Run header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-teal-50 flex items-center gap-2">
                  {isRunning ? (
                    <>
                      <Loader2 className="w-5 h-5 text-primary animate-spin" /> Agents analysing
                      case…
                    </>
                  ) : status === "error" ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-rose-500" /> Analysis failed
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 text-success" /> Case analysed
                    </>
                  )}
                </h3>
                {!isRunning && (
                  <button
                    onClick={reset}
                    className="text-sm flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> New Case
                  </button>
                )}
              </div>

              {/* Live agent console */}
              <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-5">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
                  <Terminal className="w-4 h-4 text-accent" />
                  <span className="text-xs font-mono tracking-wider font-semibold text-slate-400">
                    ublong@agents ~ live stream
                  </span>
                </div>
                <div
                  ref={logBoxRef}
                  className="font-mono text-[11px] lg:text-xs flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-2"
                >
                  {logs.length === 0 && isRunning && (
                    <span className="text-slate-500">Connecting to agent pipeline…</span>
                  )}
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-slate-600 select-none shrink-0">{log.time}</span>
                      <span className="text-accent font-bold shrink-0">[{log.agent}]</span>
                      <span className="text-slate-300 break-words">{log.message}</span>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </div>

              {status === "error" && (
                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl p-4 text-sm text-rose-700 dark:text-rose-300">
                  {errorMsg}
                  <p className="mt-2 text-xs text-rose-600/80 dark:text-rose-400/80">
                    Check that the backend is running on its configured URL and that MongoDB is up.
                  </p>
                </div>
              )}

              {result && <CaseResultView result={result} />}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
