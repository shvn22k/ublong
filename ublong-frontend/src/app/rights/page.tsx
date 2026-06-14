"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldAlert, Heart, Scale } from "lucide-react";

export default function RightsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-body transition-colors duration-300 selection:bg-teal-500 selection:text-white pb-24">
      {/* Premium Editorial Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 dark:bg-slate-955/70 border-b border-teal-800/10 dark:border-teal-500/10 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400 hover:text-orange-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </Link>
          <span className="font-display text-lg font-bold text-teal-950 dark:text-teal-50">
            UBlong Identity Charter
          </span>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="pt-32 max-w-4xl mx-auto px-6 flex flex-col gap-12">
        {/* Section Header */}
        <div className="border-b border-teal-900/10 dark:border-teal-500/20 pb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400 mb-3 block">
            International Jurisprudence
          </span>
          <h1 className="font-display text-4xl md:text-6xl text-teal-955 dark:text-teal-50 leading-tight">
            The Fundamental Right to Identity
          </h1>
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 mt-4 font-light leading-relaxed">
            Article 7 of the UN Convention on the Rights of the Child guarantees every child the right to be registered immediately after birth, the right to a name, and the right to acquire a nationality.
          </p>
        </div>

        {/* Feature Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Card */}
          <div className="md:col-span-6 flex flex-col bg-white dark:bg-slate-900/40 rounded-3xl border border-teal-800/10 dark:border-teal-500/10 shadow-sm overflow-hidden group">
            <div className="relative aspect-[3/2] overflow-hidden bg-slate-100 dark:bg-slate-950">
              <Image
                src="/child-identity.jpg"
                alt="I have the right to an identity, a name and a nationality"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="p-6">
              <cite className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 block mb-2 not-italic">
                UNICEF Child Identity Campaign
              </cite>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                An identity is more than a legal record. It is the passport to immunization, education, employment, and full participation in human society.
              </p>
            </div>
          </div>

          {/* Right Column: Editorial Text */}
          <div className="md:col-span-6 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900/40 p-6 rounded-3xl border border-teal-800/10 dark:border-teal-500/10 shadow-sm">
              <h3 className="font-display text-lg font-bold text-teal-950 dark:text-teal-150 mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-500" />
                The Invisiblity Threat
              </h3>
              <p className="text-xs md:text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-light">
                Over 150 million children worldwide currently do not exist in any civil register. Displacement, conflict, and administrative discrimination create insurmountable barriers for displaced parents trying to secure proof of birth.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900/40 p-6 rounded-3xl border border-teal-800/10 dark:border-teal-500/10 shadow-sm">
              <h3 className="font-display text-lg font-bold text-teal-950 dark:text-teal-150 mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-teal-650" />
                Our Legal Mission
              </h3>
              <p className="text-xs md:text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-light">
                UBlong leverages advanced AI frameworks to parse statutory codes and establish alternative verification pathways. We help stateless parents stitch together midwife certificates, camp indices, and witness statements to claim legal certificates.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Editorial Callout */}
        <blockquote className="bg-teal-500/5 dark:bg-teal-500/10 p-6 rounded-2xl border border-teal-800/10 dark:border-teal-400/15 flex items-start gap-4">
          <Heart className="w-6 h-6 text-orange-500 shrink-0 fill-orange-500/10" />
          <div>
            <p className="text-xs md:text-sm italic font-medium text-teal-950 dark:text-teal-200 mb-2">
              &ldquo;No child should be penalized for the circumstances of their birth or displacement. Identity is the first key to safety.&rdquo;
            </p>
            <cite className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 not-italic">
              — UBlong Charter Committee
            </cite>
          </div>
        </blockquote>
      </main>
    </div>
  );
}
