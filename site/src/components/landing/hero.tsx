"use client";

import { buttonVariants } from "@/components/ui/button";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { LiquidGlassCard } from "@/components/kokonutui/liquid-glass-card";
import { formatPearson, kpiSummary, masterData, nationalTrends } from "@/lib/data";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const kpis = kpiSummary(masterData);
const trends = nationalTrends(masterData);
const latest = trends[trends.length - 1];

const kpiDescriptions: Record<string, string> = {
  "Mean NO₂":
    "Average nitrogen dioxide measured across all monitoring stations, all states and years.",
  "Age-std mortality":
    "Age-standardised respiratory deaths per 100,000 people — adjusted so states with older populations aren't unfairly penalised.",
  "NO₂ correlation":
    "Pearson correlation between mean NO₂ and age-standardised mortality across states. +1 = perfect positive relationship, 0 = none.",
  "Mean PM₁₀":
    "Average fine particulate matter (PM10) measured across all monitoring stations, all states and years.",
};

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(217,119,6,0.12),_transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,color-mix(in_srgb,var(--foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--foreground)_6%,transparent)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-4 font-mono text-xs tracking-[0.22em] text-primary uppercase"
          >
            Portfolio study · 2019–2023
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="font-heading max-w-xl text-4xl leading-[1.05] font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            German Air
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            After age-standardisation, NO₂ tracks respiratory mortality across
            Germany’s 16 federal states — while raw counts and crude rates tell
            the wrong story.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/explore"
              className={cn(buttonVariants({ size: "lg" }), "rounded-xl px-5")}
            >
              Explore the data
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#thesis"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl"
              )}
            >
              Read the thesis
              <ArrowUpRight className="size-4" />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <LiquidGlassCard
            className="overflow-hidden border-border/60 bg-card/60 p-5 shadow-none"
            glassEffect={false}
          >
            <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
              Snapshot · all states · {latest?.year}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {[
                {
                  label: "Mean NO₂",
                  value: `${kpis.meanNo2.toFixed(1)}`,
                  unit: "µg/m³",
                },
                {
                  label: "Age-std mortality",
                  value: `${kpis.meanMort.toFixed(1)}`,
                  unit: "/100k",
                },
                {
                  label: "NO₂ correlation",
                  value: formatPearson(kpis.rNo2),
                  unit: "Pearson r",
                },
                {
                  label: "Mean PM₁₀",
                  value: `${kpis.meanPm10.toFixed(1)}`,
                  unit: "µg/m³",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.06 }}
                  className="rounded-xl border border-border/80 bg-card/70 p-3"
                >
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    {item.label}
                    <InfoTooltip description={kpiDescriptions[item.label] ?? ""} />
                  </p>
                  <p className="mt-1 font-heading text-2xl font-semibold tracking-tight text-foreground">
                    {item.value}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground/80">
                    {item.unit}
                  </p>
                </motion.div>
              ))}
            </div>
          </LiquidGlassCard>
        </motion.div>
      </div>
    </section>
  );
}
