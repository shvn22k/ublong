"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { translations } from "@/locales/translations";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Search,
  Scale,
  FileCode,
  Languages,
  Radio,
  CheckCircle,
  Play,
  Terminal,
  Clock,
} from "lucide-react";

interface LogMessage {
  agent: string;
  message: string;
  timestamp: string;
  type: "info" | "success" | "warn" | "code";
}

export default function AgentActivityShowcase() {
  const { language, caseStatus, runCaseSimulation, resetCaseSimulation } = useApp();
  const t = translations[language];

  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [activeAgent, setActiveAgent] = useState<string>("Research");
  const [agentProgress, setAgentProgress] = useState<Record<string, number>>({
    Research: 0,
    Legal: 0,
    Document: 0,
    Translation: 0,
    Tracking: 0,
  });

  const agents = [
    {
      name: "Research Agent",
      id: "Research",
      icon: <Search className="w-5 h-5" />,
      desc: "Scans international treaties and local family laws.",
      status: "idle",
      color: "border-teal-500 text-teal-600 dark:text-teal-400",
      glow: "bg-teal-500",
    },
    {
      name: "Legal Agent",
      id: "Legal",
      icon: <Scale className="w-5 h-5" />,
      desc: "Validates secondary evidence templates & precedents.",
      status: "idle",
      color: "border-orange-500 text-orange-500",
      glow: "bg-orange-500",
    },
    {
      name: "Document Agent",
      id: "Document",
      icon: <FileCode className="w-5 h-5" />,
      desc: "Stitches certified digital application structures.",
      status: "idle",
      color: "border-amber-500 text-amber-500",
      glow: "bg-amber-500",
    },
    {
      name: "Translation Agent",
      id: "Translation",
      icon: <Languages className="w-5 h-5" />,
      desc: "Translates metadata into host country official scripts.",
      status: "idle",
      color: "border-emerald-500 text-emerald-500",
      glow: "bg-emerald-500",
    },
    {
      name: "Tracking Agent",
      id: "Tracking",
      icon: <Radio className="w-5 h-5" />,
      desc: "Monitors administrative registries & response hooks.",
      status: "idle",
      color: "border-sky-500 text-sky-500",
      glow: "bg-sky-500",
    },
  ];

  // Auto-scroll terminal - use scrollTop on container instead of scrollIntoView
  // because Lenis intercepts scrollIntoView and scrolls the whole page
  useEffect(() => {
    const container = terminalContainerRef.current;
    if (container) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [logs]);

  // Simulate logs based on caseStatus
  useEffect(() => {
    if (caseStatus === "idle") {
      setLogs([
        {
          agent: "System",
          message: "Awaiting activation code. Initiate case package to engage AI agents.",
          timestamp: "00:00:00",
          type: "info",
        },
      ]);
      setAgentProgress({ Research: 0, Legal: 0, Document: 0, Translation: 0, Tracking: 0 });
      setActiveAgent("Research");
      return;
    }

    if (caseStatus === "ocr_scanning") {
      setLogs([
        {
          agent: "Document Agent",
          message: "Staging incoming document. Initiating high-resolution OCR scan.",
          timestamp: getTimestamp(),
          type: "info",
        },
        {
          agent: "System",
          message: "Extracting metadata boundaries. Cleaning noise filters.",
          timestamp: getTimestamp(),
          type: "info",
        },
      ]);
      return;
    }

    if (caseStatus === "ocr_done") {
      setLogs((prev) => [
        ...prev,
        {
          agent: "Document Agent",
          message: "OCR extraction completed. Found 'Hospital Birth Notification' (Score: 98.4%).",
          timestamp: getTimestamp(),
          type: "success",
        },
        {
          agent: "System",
          message: "Staging case folder. Preparing multi-agent workspace routing.",
          timestamp: getTimestamp(),
          type: "info",
        },
      ]);
      return;
    }

    if (caseStatus === "agents_running") {
      runAgentFlow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseStatus]);

  const getTimestamp = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
  };

  const addLog = (agent: string, message: string, type: "info" | "success" | "warn" | "code" = "info") => {
    setLogs((prev) => [...prev, { agent, message, timestamp: getTimestamp(), type }]);
  };

  const runAgentFlow = () => {
    // Stage 1: Research Agent (0s - 2s)
    setActiveAgent("Research");
    addLog("Research Agent", "Research session spawned for child born in Syria.", "info");
    
    let resProgress = 0;
    const resInterval = setInterval(() => {
      resProgress += 20;
      setAgentProgress((prev) => ({ ...prev, Research: resProgress }));
      if (resProgress === 40) {
        addLog("Research Agent", "Querying matching law: Syria Civil Status Decree No. 26.", "info");
      }
      if (resProgress === 80) {
        addLog("Research Agent", "Bilateral treaty detected: 1965 League of Arab States Protocol.", "success");
      }
      if (resProgress >= 100) {
        clearInterval(resInterval);
        addLog("Research Agent", "Research finalized. Standard pathway selected.", "success");
        
        // Stage 2: Legal Agent (2s - 4.5s)
        setTimeout(() => {
          setActiveAgent("Legal");
          addLog("Legal Agent", "Validating alternative evidence hierarchy.", "info");
          let legProgress = 0;
          const legInterval = setInterval(() => {
            legProgress += 25;
            setAgentProgress((prev) => ({ ...prev, Legal: legProgress }));
            if (legProgress === 50) {
              addLog("Legal Agent", "Precedent match: Secondary witness statements allowed under Article 14.", "success");
            }
            if (legProgress >= 100) {
              clearInterval(legInterval);
              addLog("Legal Agent", "Formulating legal dossier template structure.", "success");
              
              // Stage 3: Document Agent (4.5s - 6s)
              setTimeout(() => {
                setActiveAgent("Document");
                addLog("Document Agent", "Generating PDF form packages. Compiling XML namespaces.", "info");
                let docProgress = 0;
                const docInterval = setInterval(() => {
                  docProgress += 50;
                  setAgentProgress((prev) => ({ ...prev, Document: docProgress }));
                  if (docProgress === 50) {
                    addLog("Document Agent", "Generating Affidavit Form CF-12a and Witness Statement.", "info");
                  }
                  if (docProgress >= 100) {
                    clearInterval(docInterval);
                    addLog("Document Agent", "Compiled XML legal document structure successfully.", "success");
                    
                    // Stage 4: Translation Agent (6s - 7.5s)
                    setTimeout(() => {
                      setActiveAgent("Translation");
                      addLog("Translation Agent", "Translating generated packages into destination scripts.", "info");
                      let trProgress = 0;
                      const trInterval = setInterval(() => {
                        trProgress += 50;
                        setAgentProgress((prev) => ({ ...prev, Translation: trProgress }));
                        if (trProgress === 50) {
                          addLog("Translation Agent", "Translating Latin elements to Modern Standard Arabic.", "info");
                        }
                        if (trProgress >= 100) {
                          clearInterval(trInterval);
                          addLog("Translation Agent", "Double-verified legal dictionary translations.", "success");
                          
                          // Stage 5: Tracking Agent (7.5s+)
                          setTimeout(() => {
                            setActiveAgent("Tracking");
                            addLog("Tracking Agent", "Initializing remote API webhook hooks. Setting timer hooks.", "info");
                            setAgentProgress((prev) => ({ ...prev, Tracking: 100 }));
                            addLog("Tracking Agent", "Simulation complete. Document dossier is ready to submit.", "success");
                          }, 1000);
                        }
                      }, 800);
                    }, 500);
                  }
                }, 750);
              }, 500);
            }
          }, 600);
        }, 500);
      }
    }, 400);
  };

  return (
    <section className="py-24 px-6 bg-background" id="agent-showcase">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-10">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
              Autonomous Collaboration
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-teal-50 leading-tight">
              {t.missionControl}
            </h2>
            <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 mt-4 font-normal leading-relaxed">
              {t.missionControlSub}
            </p>
          </div>

          <div>
            {caseStatus === "idle" && (
              <button
                onClick={runCaseSimulation}
                className="bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 shadow-sm transition-all text-sm cursor-pointer"
              >
                <Play className="w-4.5 h-4.5 fill-current text-accent" /> Initialize Case Simulation
              </button>
            )}
            {caseStatus !== "idle" && (
              <button
                onClick={resetCaseSimulation}
                className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 px-6 py-3.5 rounded-xl font-semibold transition-all text-sm cursor-pointer"
              >
                Reset Mission Control
              </button>
            )}
          </div>
        </div>

        {/* Mission Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Agent Status Panel (Left 5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <Cpu className="w-4.5 h-4.5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350">
                ACTIVE AI AGENTS STATUS
              </span>
            </div>

            {agents.map((agent) => {
              const isActive = activeAgent === agent.id && caseStatus === "agents_running";
              const isDone = agentProgress[agent.id] >= 100;
              const isStarted = agentProgress[agent.id] > 0;

              return (
                <div
                  key={agent.id}
                  className={`bg-white dark:bg-slate-900/40 p-4 rounded-xl border transition-all ${
                    isActive
                      ? `border-primary shadow bg-slate-50 dark:bg-slate-900`
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-lg border ${
                          isActive
                            ? "bg-slate-100 dark:bg-slate-800 border-primary"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                        }`}
                      >
                        {agent.icon}
                      </div>
                      <div>
                        <h4 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
                          {agent.name}
                        </h4>
                        <p className="text-[11px] text-slate-700 dark:text-slate-400 leading-tight">
                          {agent.desc}
                        </p>
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="flex items-center gap-1.5">
                      {isActive && (
                        <span className="flex h-2 w-2 relative">
                          <span
                            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-accent"
                          />
                          <span
                            className="relative inline-flex rounded-full h-2 w-2 bg-accent"
                          />
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        {isDone ? (
                          <span className="text-success flex items-center gap-0.5">
                            <CheckCircle className="w-3.5 h-3.5" /> Done
                          </span>
                        ) : isActive ? (
                          <span className="text-accent">Active</span>
                        ) : isStarted ? (
                          <span className="text-primary">Processing</span>
                        ) : (
                          <span className="text-slate-400">Idle</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Agent Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDone
                          ? "bg-success"
                          : isActive
                          ? "bg-accent"
                          : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      style={{ width: `${agentProgress[agent.id]}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Terminal Console Panel (Right 7 columns) */}
          <div className="lg:col-span-7 bg-slate-950 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between min-h-[500px]">
            {/* Console top header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 select-none">
              <div className="flex items-center gap-2">
                <Terminal className="w-4.5 h-4.5 text-accent" />
                <span className="text-xs font-mono tracking-wider font-semibold text-slate-400">
                  ublong@agent-network ~ console
                </span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500/80" />
                <div className="w-2 h-2 rounded-full bg-amber-500/80" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
              </div>
            </div>

            {/* Console Body Logs */}
            <div ref={terminalContainerRef} className="flex-1 overflow-y-auto max-h-[380px] font-mono text-[11px] lg:text-xs flex flex-col gap-2.5 pr-2" style={{ scrollBehavior: 'smooth' }}>
              <AnimatePresence>
                {logs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="text-slate-650 flex items-center gap-0.5 select-none">
                      <Clock className="w-3 h-3" /> {log.timestamp}
                    </span>
                    <span className="text-accent font-bold shrink-0">
                      [{log.agent}]:
                    </span>
                    <span
                      className={
                        log.type === "success"
                          ? "text-success"
                          : log.type === "warn"
                          ? "text-amber-400"
                          : "text-slate-300"
                      }
                    >
                      {log.message}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={terminalEndRef} />
            </div>

            {/* Console Footer Status */}
            <div className="border-t border-slate-900 pt-4 mt-4 flex items-center justify-between text-[10px] font-mono text-slate-500 select-none">
              <span>Status: {caseStatus.toUpperCase()}</span>
              <span>Agents Activated: {Object.values(agentProgress).filter(p => p > 0).length}/5</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
