"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing UBlong secure legal channels...");

  const statusPhrases = [
    "Initializing UBlong secure legal channels...",
    "Retrieving country-specific birth certificate requirements...",
    "Calibrating translation engines...",
    "Structuring legal document templates...",
    "Securing AI agency routing pipelines...",
    "Platform ready.",
  ];

  useEffect(() => {
    // Increment progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 35);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Shift text based on progress
    const index = Math.min(
      Math.floor((progress / 100) * statusPhrases.length),
      statusPhrases.length - 1
    );
    setStatusText(statusPhrases[index]);

    if (progress === 100) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 600);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-[#FAFAF9] dark:bg-[#090D16] flex flex-col items-center justify-center p-6 select-none"
        >
          <div className="flex flex-col items-center max-w-md w-full text-center">
            {/* Spinning Globe Container */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="relative mb-8 text-teal-700 dark:text-teal-400 flex items-center justify-center"
            >
              <Globe className="w-24 h-24 stroke-[1.2]" />
              <div className="absolute inset-0 border-2 border-teal-500/20 rounded-full scale-125 animate-ping" />
            </motion.div>

            {/* Platform Brand */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-4xl font-extrabold text-teal-950 dark:text-teal-50 tracking-tight mb-2"
            >
              UBlong
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-8"
            >
              Legal Identity For Every Child
            </motion.p>

            {/* Custom Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
                className="bg-gradient-to-r from-teal-700 to-orange-500 dark:from-teal-400 dark:to-orange-400 h-full rounded-full"
              />
            </div>

            {/* Loading text feedback */}
            <div className="h-6">
              <AnimatePresence mode="wait">
                <motion.p
                  key={statusText}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-medium text-slate-500 dark:text-slate-400 italic"
                >
                  {statusText}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
