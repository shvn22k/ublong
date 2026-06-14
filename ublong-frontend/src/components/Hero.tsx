"use client";

import React, { useRef } from "react";
import { useApp } from "@/context/AppContext";
import { translations } from "@/locales/translations";
import { motion } from "framer-motion";
import { ArrowRight, Play, FilePlus2 } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  const { language, runCaseSimulation } = useApp();
  const t = translations[language];
  
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStartCase = (e: React.MouseEvent) => {
    e.preventDefault();
    const docGen = document.getElementById("document-generator");
    if (docGen) {
      docGen.scrollIntoView({ behavior: "smooth" });
    }
    setTimeout(() => {
      runCaseSimulation();
    }, 800);
  };

  // Typographic Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 16,
        stiffness: 120,
      },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-background text-foreground px-6 py-6 md:py-10"
      id="hero"
    >
      {/* Background Soft Pastel Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] rounded-full bg-secondary/15 blur-[90px] pointer-events-none" />

      {/* Main Grid Container */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 items-center relative z-10">
        
        {/* Left Column: Headline and CTAs */}
        <div className="lg:col-span-7 flex flex-col text-left items-start">


          {/* Primary Headline with Typographic Text Animation */}
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-teal-50 leading-[1.05] tracking-tight mb-5 text-left flex flex-wrap"
          >
            {t.heroTitle.split(" ").map((word, idx) => (
              <motion.span key={idx} variants={wordVariants} className="inline-block mr-3 md:mr-4">
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subheading (Paratext) */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="font-body text-base md:text-lg text-slate-800 dark:text-slate-200 max-w-2xl leading-relaxed mb-8 font-normal"
          >
            {t.heroSub}
          </motion.p>

          {/* Interactive CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            {/* Start New Case */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartCase}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 bg-primary text-white hover:bg-primary-hover rounded-xl font-bold shadow-sm transition-all cursor-pointer text-base"
            >
              <FilePlus2 className="w-5 h-5 text-accent" />
              {t.ctaStart}
              <ArrowRight className="w-4.5 h-4.5" />
            </motion.button>

            {/* Watch Demo */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const worksSection = document.getElementById("how-it-works");
                worksSection?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-semibold shadow-sm transition-all cursor-pointer text-base"
            >
              <Play className="w-4 h-4 fill-accent text-accent" />
              {t.ctaDemo}
            </motion.button>
          </motion.div>
        </div>

        {/* Right Column: Beautiful Image Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex justify-center"
        >
          <div className="relative w-full max-w-sm aspect-[4/5] rounded-[2rem] overflow-hidden border-8 border-white dark:border-slate-900 shadow-lg group">
            {/* Soft Pastel Overlay Frame */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent z-10" />
            <Image
              src="/photo-1488521787991-ed7bbaae773c.avif"
              alt="Child claiming legal identity"
              fill
              className="object-cover group-hover:scale-102 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 400px"
              priority
            />
            
            {/* Quote Caption */}
            <div className="absolute bottom-6 left-6 right-6 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-200/50 dark:border-slate-800">
              <cite className="text-[10px] uppercase font-bold tracking-widest text-primary block mb-1 not-italic">
                UNCRC Article 7
              </cite>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                The right to a name, a nationality, and to be registered immediately after birth.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
