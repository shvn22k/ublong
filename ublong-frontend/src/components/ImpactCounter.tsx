"use client";

import React, { useEffect, useState, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { translations } from "@/locales/translations";
import { motion, useInView } from "framer-motion";
import { Award, ShieldAlert, Globe2 } from "lucide-react";

interface CounterProps {
  value: number;
  suffix: string;
  duration?: number;
}

function Counter({ value, suffix, duration = 2 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const totalMiliseconds = duration * 1000;
    const stepTime = Math.max(Math.floor(totalMiliseconds / end), 15);
    
    const timer = setInterval(() => {
      start += Math.ceil(end / 100);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="font-display tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export default function ImpactCounter() {
  const { language } = useApp();
  const t = translations[language];

  const cards = [
    {
      icon: <ShieldAlert className="w-8 h-8 text-orange-500" />,
      value: 150,
      suffix: "M+",
      label: t.stat1Label,
      subtext: "Globally, nearly 1 in 4 children under age 5 are officially invisible. Without registering their birth, they cannot access health or school systems.",
      color: "from-teal-900/5 to-orange-500/5",
    },
    {
      icon: <Award className="w-8 h-8 text-amber-500" />,
      value: 50,
      suffix: "M+",
      label: t.stat2Label,
      subtext: "Even registered children often lack physical documents due to war, displacement, or natural disaster, making legal residency validation impossible.",
      color: "from-orange-500/5 to-amber-500/5",
    },
    {
      icon: <Globe2 className="w-8 h-8 text-teal-600" />,
      value: 200,
      suffix: "+",
      label: t.stat3Label,
      subtext: "Our AI systems map and monitor legal regulations across hundreds of countries and administrative subdivisions, matching families to exact local codes.",
      color: "from-teal-900/5 to-emerald-500/5",
    },
  ];

  return (
    <section className="py-24 px-6 bg-[#FAF9F6] dark:bg-[#070B11] border-b border-teal-800/10 dark:border-teal-400/5">
      <div className="max-w-7xl mx-auto">
        {/* Magazine editorial top border and section label */}
        <div className="border-t border-teal-900/10 dark:border-teal-500/20 pt-8 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400 mb-3 block">
              The Humanitarian Imperative
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-black text-teal-950 dark:text-teal-50 leading-tight">
              Giving voice to the undocumented.
            </h2>
          </div>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-md font-light leading-relaxed">
            Statelessness is a solvable crisis. By utilizing AI to decode complex jurisdictional rules, we empower families to claim their basic human rights.
          </p>
        </div>

        {/* Counter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className={`relative bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-teal-800/10 dark:border-teal-500/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group`}
            >
              {/* Soft background gradient glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none`} />
              
              <div className="relative z-10">
                <div className="mb-6 bg-slate-100 dark:bg-slate-800/80 w-14 h-14 rounded-2xl flex items-center justify-center border border-white dark:border-slate-700 shadow-inner">
                  {card.icon}
                </div>
                
                <h3 className="text-6xl lg:text-7xl font-black text-teal-950 dark:text-teal-50 mb-2 leading-none flex items-baseline">
                  <Counter value={card.value} suffix={card.suffix} />
                </h3>
                
                <h4 className="font-display text-lg font-bold text-slate-800 dark:text-teal-150 mb-4">
                  {card.label}
                </h4>
              </div>

              <p className="relative z-10 text-xs lg:text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed pt-4 border-t border-slate-100 dark:border-slate-800">
                {card.subtext}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
