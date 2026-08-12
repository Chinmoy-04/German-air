"use client";

import { motion } from "motion/react";

const sources = [
  {
    title: "UBA annual tabulations",
    body: "Station-level PM₁₀ and NO₂ means, 2019–2023, aggregated to state averages for the master table and kept at station grain for the deep dive.",
  },
  {
    title: "GBE-Bund mortality",
    body: "Respiratory deaths (ICD-10 J00–J99) plus age-standardised rates using the European Standard Population 2013.",
  },
  {
    title: "Population baselines",
    body: "Official 2022 resident populations convert counts to crude rates and expose the population artefact in raw death totals.",
  },
];

export function LandingMethods() {
  return (
    <section id="methods" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4 }}
        className="mb-8 max-w-2xl"
      >
        <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
          Methods & credits
        </p>
        <h2 className="font-heading mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Reproducible from the same CSVs as the R notebooks
        </h2>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        {sources.map((source, index) => (
          <motion.article
            key={source.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <h3 className="font-heading text-lg font-semibold text-foreground">
              {source.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {source.body}
            </p>
          </motion.article>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Site design &amp; build: Chinmoy Bora. Research, analysis &amp;
        findings: Chinmoy Bora, Adham Abdelhalim, Odinaka Obioha.
      </p>
    </section>
  );
}
