"use client";

import { Area } from "@/components/charts/area";
import { AreaChart } from "@/components/charts/area-chart";
import { chartCssVars } from "@/components/charts/chart-context";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { buttonVariants } from "@/components/ui/button";
import { nationalTrends, masterData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";

const trends = nationalTrends(masterData);

export function LandingPreview() {
  return (
    <section className="border-y border-border/70 bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
        >
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Live preview
          </p>
          <h2 className="font-heading mt-2 text-3xl font-semibold tracking-tight text-foreground">
            National trends at a glance
          </h2>
          <p className="mt-3 text-muted-foreground">
            Mean NO₂ and PM₁₀ decline across the study window, while
            age-standardised mortality dips then rises. Filter by state and year
            in the full dashboard.
          </p>
          <Link
            href="/explore"
            className={cn(buttonVariants(), "mt-6 rounded-xl")}
          >
            Go to Explore
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-border bg-card p-3 sm:p-4"
        >
          <AreaChart data={trends} aspectRatio="16 / 9" className="w-full">
            <Grid horizontal />
            <Area
              dataKey="no2"
              fill={chartCssVars.linePrimary}
              fillOpacity={0.28}
            />
            <Area
              dataKey="pm10"
              fill={chartCssVars.lineSecondary}
              fillOpacity={0.22}
            />
            <XAxis numTicks={5} />
            <ChartTooltip />
          </AreaChart>
          <div className="mt-2 flex gap-4 px-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-[var(--chart-line-primary)]" />
              NO₂
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-[var(--chart-line-secondary)]" />
              PM₁₀
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
