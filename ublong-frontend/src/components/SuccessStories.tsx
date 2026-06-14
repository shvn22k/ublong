"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { translations } from "@/locales/translations";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X, Heart, ShieldCheck, Quote } from "lucide-react";

interface Story {
  id: number;
  family: string;
  country: string;
  imageColor: string;
  challenge: string;
  outcome: string;
  quote: string;
  fullStory: string;
}

const successStories: Story[] = [
  {
    id: 1,
    family: "Al-Hasan Family",
    country: "Syria / Lebanon",
    imageColor: "from-teal-600 to-teal-800",
    challenge: "Lost parent marriage contracts during border displacement. Lebanese registry rejected initial requests due to absence of official wedding documents.",
    outcome: "Dossier matched to 1965 Bilateral Agreement. Midwife statements and Shura Elder affidavits accepted as secondary legal proof. Birth registration approved in 45 days.",
    quote: "We felt invisible for four years. UBlong guided us to secondary proofs we didn't know existed, and now Amira has her certificate.",
    fullStory: "During the shelling of Aleppo, Yousef and Fatima lost their home and all possessions, including their marriage certificate. When their daughter Amira was born in a makeshift clinic in Lebanon, standard registration was impossible. UBlong scanned regional treaties, compiled witness statements from neighbors, and drafted a formal appeal package. Amira can now enroll in public school.",
  },
  {
    id: 2,
    family: "Silva Family",
    country: "Venezuela / Colombia",
    imageColor: "from-orange-500 to-orange-700",
    challenge: "Hospital birth registration slip rejected by Colombian registry due to parents' expired Venezuelan passports and missing migration stamps.",
    outcome: "Generated statutory appeal based on Constitutional Decree 11-B. School registration index and local vaccination card logs linked as alternative evidence. Identity approved.",
    quote: "Every government office closed the door. The AI matched us to a local decree that bypassed our expired passport requirement.",
    fullStory: "After crossing the border, the Silva family could not renew their passports. When Mateo was born, the local civil office refused his certificate. UBlong parsed Colombia's updated human rights decrees, generated a legally sound application bypassing national passport rules, and matched Mateo's case to active civil registry waivers. Mateo is now officially registered.",
  },
  {
    id: 3,
    family: "Qasemi Family",
    country: "Afghanistan / Pakistan",
    imageColor: "from-amber-500 to-amber-700",
    challenge: "Home birth in remote province. No hospital live-birth notification available, leading to zero official civil registration tracks.",
    outcome: "Stitched mosque registry ledger notes, village council (Shura) statements, and certified midwife statements into an official appeal package. Document successfully generated.",
    quote: "Our child was born at home. Without a hospital, we thought registration was impossible. UBlong showed us the legal value of village records.",
    fullStory: "Born in a remote community without medical clinics, Bashir had no hospital card. Without this, standard registration was unavailable. UBlong's research AI discovered regional administrative policies accepting village elder signatures and local mosque birth ledger pages. The platform compiled a structured petition package, securing Bashir's civil rights.",
  },
];

export default function SuccessStories() {
  const { language } = useApp();
  const t = translations[language];
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  return (
    <section className="py-24 px-6 bg-background border-t border-slate-200 dark:border-slate-800" id="success-stories">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            Impact Stories
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-teal-50 tracking-tight mb-6">
            {t.successTitle}
          </h2>
          <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 font-normal leading-relaxed">
            {t.successSub}
          </p>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {successStories.map((story) => {
            // Replace generic color codes with theme pastels
            let cardGrad = "from-primary to-primary-hover";
            if (story.id === 2) cardGrad = "from-accent to-accent/90";
            if (story.id === 3) cardGrad = "from-secondary to-secondary/90";

            return (
              <motion.div
                key={story.id}
                whileHover={{ y: -6 }}
                className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                onClick={() => setSelectedStory(story)}
              >
                {/* Image Illustration Cover with soft gradient */}
                <div className={`h-48 bg-gradient-to-br ${cardGrad} relative p-6 flex flex-col justify-between text-white`}>
                  <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px]" />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">
                      {story.country}
                    </span>
                    <div className="p-2 bg-white/10 rounded-full backdrop-blur-md group-hover:bg-white/25 transition-colors">
                      <ArrowUpRight className="w-4.5 h-4.5" />
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h3 className="font-display text-2xl font-bold mb-1">{story.family}</h3>
                    <p className="text-xs text-white/90 font-light flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-success" /> ID Verified & Registered
                    </p>
                  </div>
                </div>

                {/* Story summary details */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                        The Challenge
                      </h4>
                      <p className="text-xs text-slate-805 dark:text-slate-200 leading-relaxed font-normal line-clamp-3">
                        {story.challenge}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                        Legal Outcome
                      </h4>
                      <p className="text-xs text-slate-900 dark:text-slate-100 font-semibold leading-relaxed line-clamp-3">
                        {story.outcome}
                      </p>
                    </div>
                  </div>

                  {/* Testimonial Quote */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs italic text-slate-700 dark:text-slate-350 font-normal flex gap-2">
                    <Quote className="w-4 h-4 text-primary/30 shrink-0" />
                    <p className="line-clamp-2">&ldquo;{story.quote}&rdquo;</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Story Modal Detail view */}
        <AnimatePresence>
          {selectedStory && (() => {
            // Replace generic color codes with theme pastels
            let modalGrad = "from-primary to-primary-hover";
            if (selectedStory.id === 2) modalGrad = "from-accent to-accent/90";
            if (selectedStory.id === 3) modalGrad = "from-secondary to-secondary/90";

            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 15 }}
                  className="bg-white dark:bg-slate-900 max-w-2xl w-full border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col"
                >
                  {/* Header Banner */}
                  <div className={`p-8 bg-gradient-to-br ${modalGrad} text-white flex justify-between items-start`}>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                        {selectedStory.country}
                      </span>
                      <h3 className="font-display text-3xl font-bold mt-3">{selectedStory.family}</h3>
                    </div>
                    <button
                      onClick={() => setSelectedStory(null)}
                      className="p-2 bg-white/10 hover:bg-white/20 transition-colors rounded-full text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-8 flex flex-col gap-6 overflow-y-auto max-h-[400px]">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        The Displacement Story
                      </h4>
                      <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                        {selectedStory.fullStory}
                      </p>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-800" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          The Legal Challenge
                        </h4>
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                          {selectedStory.challenge}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Resolution Pathway
                        </h4>
                        <p className="text-xs text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                          {selectedStory.outcome}
                        </p>
                      </div>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-800" />

                    {/* Emotional quote block */}
                    <blockquote className="bg-primary/5 dark:bg-primary/10 p-5 rounded-xl border border-primary/20 flex items-start gap-4">
                      <Heart className="w-6 h-6 text-accent shrink-0 fill-accent/10" />
                      <div>
                        <p className="text-xs md:text-sm italic font-medium text-slate-900 dark:text-slate-200 mb-2">
                          &ldquo;{selectedStory.quote}&rdquo;
                        </p>
                        <cite className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 not-italic">
                          — Family Spokesperson
                        </cite>
                      </div>
                    </blockquote>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </section>
  );
}
