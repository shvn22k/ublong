"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function FloatingKidsGallery() {
  const images = [
    { src: "/images/child1.png", alt: "Child 1", size: "w-48 h-48 md:w-64 md:h-64", position: "left-[5%] md:left-[10%] top-[10%]", delay: 0 },
    { src: "/images/child2.png", alt: "Child 2", size: "w-40 h-40 md:w-56 md:h-56", position: "right-[5%] md:right-[15%] top-[5%]", delay: 0.5 },
    { src: "/images/child3.png", alt: "Child 3", size: "w-52 h-52 md:w-72 md:h-72", position: "left-[50%] -translate-x-1/2 bottom-[5%] md:bottom-[10%]", delay: 1 },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-background py-20 min-h-[60vh] md:min-h-[80vh] flex items-center justify-center border-t border-b border-slate-100 dark:border-slate-800">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-accent/10 dark:bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Images */}
      <div className="absolute inset-0 max-w-7xl mx-auto w-full h-full pointer-events-none">
        {images.map((img, idx) => (
          <motion.div
            key={idx}
            className={`absolute ${img.position} ${img.size} rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl dark:shadow-2xl z-10 pointer-events-auto`}
            animate={{
              y: [0, -20, 0],
              rotate: [-2, 2, -2],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: img.delay,
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover transition-transform duration-700 hover:scale-110"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </motion.div>
        ))}
      </div>

      {/* Center Content */}
      <div className="relative z-20 text-center px-6 max-w-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md py-8 md:py-12 rounded-3xl border border-white/50 dark:border-slate-700/50 shadow-2xl">
        <span className="inline-block py-1.5 px-4 rounded-full bg-accent/20 text-accent font-bold text-[10px] uppercase tracking-widest mb-4">
          Faces of Hope
        </span>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 dark:text-teal-50 mb-4 leading-tight">
          Every child deserves a recognized identity
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed max-w-lg mx-auto font-medium">
          A birth certificate is more than paper. It&apos;s the key to education, healthcare, and a future free from the shadows of statelessness.
        </p>
      </div>
    </section>
  );
}
