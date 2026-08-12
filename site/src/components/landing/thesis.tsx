"use client";

import SmoothTab from "@/components/kokonutui/smooth-tab";
import {
  MetricFlipVisual,
  SignalVisual,
  SpaceVisual,
  TimeVisual,
} from "@/components/landing/thesis-visuals";
import { motion } from "motion/react";

const tabs = [
  {
    id: "metric",
    title: "Metric",
    description:
      "Raw death counts track population size. Crude rates flip negative because older, cleaner states look worse. Only age-standardised rates reveal the NO₂ signal.",
    color: "bg-sky-600",
    cardContent: <MetricFlipVisual />,
  },
  {
    id: "signal",
    title: "Signal",
    description:
      "NO₂ and age-standardised respiratory mortality correlate positively (r ≈ +0.31, p = 0.005). PM₁₀ stays near flat. The hypothesis holds once age is controlled.",
    color: "bg-amber-600",
    cardContent: <SignalVisual />,
  },
  {
    id: "time",
    title: "Time",
    description:
      "Pollution falls steadily from 2019 to 2023. Mortality dips through the COVID years, then rebounds — so the temporal story is not a simple pollution–death mirror.",
    color: "bg-cyan-600",
    cardContent: <TimeVisual />,
  },
  {
    id: "space",
    title: "Space",
    description:
      "Urban high-NO₂ states — Berlin, North Rhine-Westphalia, Hamburg — align with higher age-standardised mortality once the maps are corrected.",
    color: "bg-slate-700",
    cardContent: <SpaceVisual />,
  },
];

export function LandingThesis() {
  return (
    <section id="thesis" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4 }}
        className="mb-8 max-w-2xl"
      >
        <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
          The thesis
        </p>
        <h2 className="font-heading mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Same data. Three answers. One that survives age correction.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Switch the narrative lenses below — then open Explore to verify every
          claim against the live charts.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm sm:p-8"
      >
        <SmoothTab
          activeColor="bg-sky-600"
          cardHeight={380}
          defaultTabId="metric"
          items={tabs}
        />
      </motion.div>
    </section>
  );
}
