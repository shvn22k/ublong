"use client";

import React, { useState, useEffect } from "react";
import { useApp, Language } from "@/context/AppContext";
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Type,
  Eye,
  Languages,
  Mic,
  Settings,
  X,
  Plus,
  Minus,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalControls() {
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    highContrast,
    toggleHighContrast,
    fontScale,
    increaseFontScale,
    decreaseFontScale,
    resetFontScale,
    runCaseSimulation,
    resetCaseSimulation,
    caseStatus,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [screenReaderActive, setScreenReaderActive] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");


  // Voice speech synthesis simulation
  const handleScreenReaderToggle = () => {
    setScreenReaderActive(!screenReaderActive);
    if (!screenReaderActive) {
      speak("Screen reader mode enabled. Hover over items to hear them.");
    } else {
      window.speechSynthesis?.cancel();
    }
  };

  const speak = (text: string) => {
    if (!screenReaderActive || typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "ar" ? "ar-SA" : language === "es" ? "es-ES" : language === "fr" ? "fr-FR" : "en-US";
    window.speechSynthesis?.speak(utterance);
  };

  // Setup hover listeners for screen reader simulation
  useEffect(() => {
    if (!screenReaderActive) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const textToRead = target.getAttribute("aria-label") || target.innerText;
      if (textToRead && textToRead.length < 150) {
        speak(textToRead);
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenReaderActive, language]);

  // Voice Command (Speech recognition) simulation
  const handleVoiceToggle = () => {
    if (voiceActive) {
      setVoiceActive(false);
      setVoiceTranscript("");
      return;
    }

    setVoiceActive(true);
    setVoiceTranscript("Listening...");

    // Simulate speech recognition
    setTimeout(() => {
      setVoiceTranscript("Detected: 'Start New Case'");
      setTimeout(() => {
        runCaseSimulation();
        setVoiceActive(false);
      }, 1500);
    }, 3000);
  };

  return (
    <>
      {/* Floating Control Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Voice Command Activity Toast */}
        <AnimatePresence>
          {voiceActive && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="bg-slate-900 text-slate-100 border border-slate-700 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 backdrop-blur-xl mb-1 mr-1"
            >
              <div className="w-2.5 h-2.5 bg-accent rounded-full animate-ping" />
              <span className="text-sm font-medium">{voiceTranscript}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {/* Quick theme trigger */}
          <button
            onClick={toggleTheme}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-102"
            aria-label="Toggle dark mode"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Quick Voice Command trigger */}
          <button
            onClick={handleVoiceToggle}
            className={`p-3 border rounded-full shadow-md hover:shadow-lg transition-all hover:scale-102 ${
              voiceActive
                ? "bg-accent text-white border-accent animate-pulse"
                : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800"
            }`}
            aria-label="Simulate Voice Command"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Settings Menu Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-3 shadow-md hover:shadow-lg transition-all hover:scale-102 rounded-full ${
              isOpen
                ? "bg-primary text-white border-primary-hover"
                : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 border"
            }`}
            aria-label="Open settings and accessibility controls"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
          </button>
        </div>

        {/* Expanded Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-80 bg-white/95 dark:bg-slate-905/95 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-xl text-slate-800 dark:text-slate-100 flex flex-col gap-5"
            >
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                  Global Configuration
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Customize language, accessibility, and simulator status.
                </p>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              {/* Language Switcher */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-primary" /> Language
                </label>
                <div className="grid grid-cols-4 gap-1.5 bg-slate-100/80 dark:bg-slate-900 p-1 rounded-xl">
                  {(["en", "es", "fr", "ar"] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                        language === lang
                          ? "bg-primary text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Sizer */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-primary" /> Text Resizing
                </label>
                <div className="flex items-center justify-between gap-3 bg-slate-100/80 dark:bg-slate-900 p-1.5 rounded-xl">
                  <button
                    onClick={decreaseFontScale}
                    className="p-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    disabled={fontScale <= 0.9}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    {Math.round(fontScale * 100)}%
                  </span>
                  <button
                    onClick={increaseFontScale}
                    className="p-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    disabled={fontScale >= 1.5}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={resetFontScale}
                    className="p-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* High Contrast & Screen Reader */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Accessibility Aids
                </label>

                {/* High Contrast */}
                <button
                  onClick={toggleHighContrast}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${
                    highContrast
                      ? "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400 dark:border-amber-500/40"
                      : "bg-transparent border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Eye className="w-4.5 h-4.5" /> High Contrast Mode
                  </span>
                  <span
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      highContrast ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        highContrast ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </span>
                </button>

                {/* Screen Reader Toggle */}
                <button
                  onClick={handleScreenReaderToggle}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${
                    screenReaderActive
                      ? "bg-primary/10 text-primary border-primary/30 dark:text-primary-hover dark:border-primary/40"
                      : "bg-transparent border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {screenReaderActive ? (
                      <Volume2 className="w-4.5 h-4.5" />
                    ) : (
                      <VolumeX className="w-4.5 h-4.5" />
                    )}{" "}
                    Screen Reader Help
                  </span>
                  <span
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      screenReaderActive ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        screenReaderActive ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </span>
                </button>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              {/* Case Simulation controls */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Interactive Demo Mode
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={runCaseSimulation}
                    disabled={caseStatus !== "idle" && caseStatus !== "approved"}
                    className="flex-1 text-center py-2 text-xs font-semibold rounded-lg bg-accent hover:bg-accent/90 disabled:opacity-50 text-white shadow transition-all active:scale-95 cursor-pointer"
                  >
                    Trigger Full Demo
                  </button>
                  <button
                    onClick={resetCaseSimulation}
                    disabled={caseStatus === "idle"}
                    className="py-2 px-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition-all text-slate-750 dark:text-slate-300 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
