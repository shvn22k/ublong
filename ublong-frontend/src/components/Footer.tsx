"use client";

import React from "react";
import { useApp, Language } from "@/context/AppContext";
import { Mail, Phone, MapPin, Shield, Heart } from "lucide-react";

export default function Footer() {
  const { language, setLanguage } = useApp();

  const partners = [
    { name: "UNICEF", desc: "Child Protection" },
    { name: "UNHCR", desc: "Refugee Advocacy" },
    { name: "Red Cross", desc: "Humanitarian Aid" },
    { name: "Save the Children", desc: "Global Support" },
  ];

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-400 py-16 px-6 border-t border-slate-200 dark:border-slate-900">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        {/* Top Partner Branding */}
        <div className="border-b border-slate-200 dark:border-slate-900 pb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Collaborating Partners & Observers
          </span>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {partners.map((partner) => (
              <div key={partner.name} className="flex flex-col items-start select-none">
                <span className="font-display text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wider">
                  {partner.name}
                </span>
                <span className="text-[9px] uppercase font-semibold text-primary">
                  {partner.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Center Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-teal-50">
              UBlong
            </h3>
            <p className="text-xs font-normal leading-relaxed text-slate-800 dark:text-slate-300">
              An award-winning platform leveraging decentralized AI agent frameworks to secure legal birth registration and identity for stateless and refugee children worldwide.
            </p>
            <div className="flex gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
                <Shield className="w-3.5 h-3.5 text-accent" /> GDPR Certified
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
                <Heart className="w-3.5 h-3.5 text-accent" /> Zero-Knowledge
              </span>
            </div>
          </div>

          {/* Links Col */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Explore Paths
            </h4>
            <div className="flex flex-col gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <a href="#hero" className="hover:text-accent transition-colors">Hero Stage</a>
              <a href="#how-it-works" className="hover:text-accent transition-colors">Architecture Workflow</a>
              <a href="#agent-showcase" className="hover:text-accent transition-colors">Mission Control Simulator</a>
              <a href="#country-intelligence" className="hover:text-accent transition-colors">Intelligence Database</a>
              <a href="#document-generator" className="hover:text-accent transition-colors">OCR Scanner Panel</a>
            </div>
          </div>

          {/* Languages Col */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Change Language
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { code: "en", name: "English" },
                { code: "es", name: "Español" },
                { code: "fr", name: "Français" },
                { code: "ar", name: "العربية" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as Language)}
                  className={`py-1.5 px-3 rounded-lg border text-left transition-colors cursor-pointer ${
                    language === lang.code
                      ? "bg-primary border-primary text-white font-bold"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Col */}
          <div className="flex flex-col gap-3 text-xs font-normal text-slate-800 dark:text-slate-300">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Secure Channels
            </h4>
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span>secure@ublong.intl.org</span>
            </span>
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              <span>+41 22 739 5111 (Geneva)</span>
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Rue de Vermont 37, 1202 Genève, Switzerland</span>
            </span>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-200 dark:border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 select-none">
          <span>© {new Date().getFullYear()} UBlong. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Charter</a>
            <a href="#" className="hover:underline">Legal Precedent Archive</a>
            <a href="#" className="hover:underline">Security Audit Log</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
