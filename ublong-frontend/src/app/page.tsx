"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Lenis from "lenis";

// Components
import LoadingScreen from "@/components/LoadingScreen";
import GlobalControls from "@/components/GlobalControls";
import Hero from "@/components/Hero";
import FloatingKidsGallery from "@/components/FloatingKidsGallery";
import ChildRegistrationForm from "@/components/ChildRegistrationForm";
import ImpactCounter from "@/components/ImpactCounter";
import HowItWorks from "@/components/HowItWorks";
import AgentActivityShowcase from "@/components/AgentActivityShowcase";
import CaseJourney from "@/components/CaseJourney";
import CountryIntelligenceMap from "@/components/CountryIntelligenceMap";
import DocumentGenerator from "@/components/DocumentGenerator";
import SuccessStories from "@/components/SuccessStories";
import TimelineTracker from "@/components/TimelineTracker";
import Footer from "@/components/Footer";

// Icons
import { HeartHandshake } from "lucide-react";

const queryClient = new QueryClient();

export default function Home() {
  const { language } = useApp();

  // Scroll to top on initial mount to prevent starting mid-page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Lenis Smooth Scroll Initialization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      autoRaf: false,
    });

    // Ensure we start at top after Lenis initializes
    lenis.scrollTo(0, { immediate: true });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Determine language layout direction
  const isRtl = language === "ar";

  return (
    <QueryClientProvider client={queryClient}>
      <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen selection:bg-teal-700 selection:text-white bg-background text-foreground transition-all duration-300">
        
        {/* Loader Globe Overlay */}
        <LoadingScreen />

        {/* Floating Controls Configuration Widget */}
        <GlobalControls />

        {/* Global Editorial Navigation Bar */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 dark:bg-slate-905/70 border-b border-slate-200 dark:border-slate-800 backdrop-blur-xl transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* Brand Logo */}
            <a href="#hero" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center border border-slate-200 dark:border-slate-850 shadow-sm">
                <HeartHandshake className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="font-display text-lg font-bold text-slate-900 dark:text-teal-50 tracking-tight">
                UBlong
              </span>
            </a>

            {/* Menu Links */}
            <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
              <a href="#agent-showcase" className="hover:text-primary transition-colors">Mission Control</a>
              <a href="#country-intelligence" className="hover:text-primary transition-colors">Intelligence Map</a>
              <a href="#document-generator" className="hover:text-primary transition-colors">OCR Scanner</a>
              <a href="#success-stories" className="hover:text-primary transition-colors">Stories</a>
              <Link href="/rights" className="hover:text-primary transition-colors">Identity Charter</Link>
            </nav>


          </div>
        </header>

        {/* Main Sections */}
        <main className="pt-16">
          <Hero />
          <FloatingKidsGallery />
          <ImpactCounter />
          <ChildRegistrationForm />
          <DocumentGenerator />
          <HowItWorks />
          <AgentActivityShowcase />
          <CaseJourney />
          <CountryIntelligenceMap />
          <SuccessStories />
          <TimelineTracker />
        </main>

        {/* Minimal Footer */}
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
