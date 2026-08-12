"use client";

import { chartCssVars } from "@/components/charts/chart-context";
import { Area } from "@/components/charts/area";
import { AreaChart } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { Line } from "@/components/charts/line";
import { LineChart } from "@/components/charts/line-chart";
import { Ring } from "@/components/charts/ring";
import { RingCenter } from "@/components/charts/ring-center";
import { RingChart } from "@/components/charts/ring-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  STATE_ABBR,
  STATION_TYPE_COLORS,
  YEARS,
  filterMaster,
  filterStations,
  formatPearson,
  kpiSummary,
  linearFit,
  masterData,
  nationalTrends,
  pearson,
  stateMeans,
  states,
  stationData,
  stationTypeMix,
  type MasterRow,
  type StationRow,
} from "@/lib/data";
import { cn } from "@/lib/utils";
import { scaleLinear } from "d3-scale";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

const kpiDescriptions: Record<string, string> = {
  "Mean NO₂":
    "Average nitrogen dioxide across monitoring stations for the current Year/State filter.",
  "Mean PM₁₀":
    "Average fine particulate matter (PM10) across monitoring stations for the current Year/State filter.",
  "Age-std mortality":
    "Age-standardised respiratory deaths per 100,000 people — adjusted so states with older populations aren't unfairly penalised.",
  "Pearson r (NO₂)":
    "Correlation between mean NO₂ and age-standardised mortality across the filtered rows. +1 = perfect positive relationship, 0 = none.",
};

function Panel({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/90 bg-card p-4 shadow-sm sm:p-5",
        className
      )}
    >
      <div className="mb-3">
        <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function CoExposureScatter({ rows }: { rows: StationRow[] }) {
  const width = 640;
  const height = 320;
  const margin = { top: 16, right: 16, bottom: 40, left: 48 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  if (rows.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No stations match this filter.
      </p>
    );
  }

  const x = scaleLinear()
    .domain([
      Math.min(...rows.map((r) => r.pm10Mean), 0),
      Math.max(...rows.map((r) => r.pm10Mean), 1),
    ])
    .range([0, innerW])
    .nice();
  const y = scaleLinear()
    .domain([
      Math.min(...rows.map((r) => r.no2Mean), 0),
      Math.max(...rows.map((r) => r.no2Mean), 1),
    ])
    .range([innerH, 0])
    .nice();

  const sample = rows.length > 400 ? rows.filter((_, i) => i % 2 === 0) : rows;

  return (
    <div
      className="w-full touch-pan-x overflow-x-auto overflow-y-hidden"
      data-lenis-prevent-touch
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full min-w-[320px]"
        role="img"
        aria-label="PM10 versus NO2 co-exposure scatter by station type"
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {y.ticks(5).map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={0}
                x2={innerW}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--chart-grid)"
                strokeDasharray="4 4"
              />
              <text
                x={-8}
                y={y(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {tick}
              </text>
            </g>
          ))}
          {x.ticks(5).map((tick) => (
            <text
              key={`x-${tick}`}
              x={x(tick)}
              y={innerH + 24}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {tick}
            </text>
          ))}
          <text
            x={innerW / 2}
            y={innerH + 38}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            PM₁₀ (µg/m³)
          </text>
          <text
            x={-34}
            y={innerH / 2}
            textAnchor="middle"
            transform={`rotate(-90 -34 ${innerH / 2})`}
            className="fill-muted-foreground text-[10px]"
          >
            NO₂ (µg/m³)
          </text>
          {sample.map((row) => (
            <motion.circle
              key={`${row.stationCode}-${row.year}`}
              cx={x(row.pm10Mean)}
              cy={y(row.no2Mean)}
              r={4}
              fill={STATION_TYPE_COLORS[row.type] ?? "var(--chart-foreground-muted)"}
              fillOpacity={0.75}
              stroke="var(--foreground)"
              strokeWidth={0.4}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <title>
                {`${row.stationName} · ${row.state} · ${row.type} · PM10 ${row.pm10Mean} · NO2 ${row.no2Mean} · ${row.year}`}
              </title>
            </motion.circle>
          ))}
        </g>
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {Object.entries(STATION_TYPE_COLORS).map(([type, color]) => (
          <span key={type} className="inline-flex items-center gap-1.5 capitalize">
            <span className="size-2.5 rounded-full" style={{ background: color }} />
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}

function AssociationScatter({ rows }: { rows: MasterRow[] }) {
  const width = 640;
  const height = 320;
  const margin = { top: 28, right: 20, bottom: 44, left: 52 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  if (rows.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No state×year rows match this filter.
      </p>
    );
  }

  const x = scaleLinear()
    .domain([
      Math.min(...rows.map((r) => r.no2)),
      Math.max(...rows.map((r) => r.no2)),
    ])
    .range([0, innerW])
    .nice();
  const y = scaleLinear()
    .domain([
      Math.min(...rows.map((r) => r.mortAgeStd)),
      Math.max(...rows.map((r) => r.mortAgeStd)),
    ])
    .range([innerH, 0])
    .nice();

  const [xMin, xMax] = x.domain();
  const trend =
    rows.length >= 2
      ? linearFit(rows.map((row) => row.no2), rows.map((row) => row.mortAgeStd))
      : null;
  const r =
    rows.length >= 2
      ? pearson(rows.map((row) => row.no2), rows.map((row) => row.mortAgeStd))
      : null;

  return (
    <div
      className="w-full touch-pan-x overflow-x-auto overflow-y-hidden"
      data-lenis-prevent-touch
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full min-w-[320px]"
        role="img"
        aria-label="NO2 versus age-standardised mortality, with a fitted trend line"
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          <rect
            x={0}
            y={0}
            width={innerW}
            height={innerH}
            rx={10}
            fill="var(--chart-grid)"
            fillOpacity={0.12}
          />
          {y.ticks(5).map((tick) => (
            <g key={`ay-${tick}`}>
              <line
                x1={0}
                x2={innerW}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--chart-grid)"
                strokeDasharray="4 4"
              />
              <text
                x={-10}
                y={y(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {tick}
              </text>
            </g>
          ))}
          {x.ticks(6).map((tick) => (
            <g key={`ax-${tick}`}>
              <line
                x1={x(tick)}
                x2={x(tick)}
                y1={0}
                y2={innerH}
                stroke="var(--chart-grid)"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
              <text
                x={x(tick)}
                y={innerH + 20}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {tick}
              </text>
            </g>
          ))}
          {trend && (
            <motion.line
              x1={x(xMin)}
              y1={y(trend.slope * xMin + trend.intercept)}
              x2={x(xMax)}
              y2={y(trend.slope * xMax + trend.intercept)}
              stroke="var(--chart-3)"
              strokeDasharray="7 5"
              strokeLinecap="round"
              style={{ strokeWidth: 2 }}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          )}
          {rows.map((row, index) => (
            <motion.circle
              key={`${row.state}-${row.year}`}
              cx={x(row.no2)}
              cy={y(row.mortAgeStd)}
              r={5.5}
              fill="var(--chart-line-primary)"
              stroke="var(--foreground)"
              style={{ fillOpacity: 0.78, strokeWidth: 0.6 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: Math.min(index * 0.006, 0.4) }}
            >
              <title>
                {`${row.state} (${row.year})\nNO2 ${row.no2.toFixed(1)}\nMort ${row.mortAgeStd.toFixed(1)}`}
              </title>
            </motion.circle>
          ))}
          {r !== null && (
            <text
              x={innerW}
              y={-12}
              textAnchor="end"
              className="fill-foreground text-[11px] font-mono font-semibold"
            >
              {`r = ${formatPearson(r)}`}
            </text>
          )}
          <text
            x={innerW / 2}
            y={innerH + 36}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            NO₂ (µg/m³)
          </text>
          <text
            x={-38}
            y={innerH / 2}
            textAnchor="middle"
            transform={`rotate(-90 -38 ${innerH / 2})`}
            className="fill-muted-foreground text-[10px]"
          >
            Age-std deaths / 100k
          </text>
        </g>
      </svg>
      {trend && (
        <p className="mt-1 text-center text-[11px] text-muted-foreground">
          Dashed line: least-squares fit ({trend.slope >= 0 ? "+" : ""}
          {trend.slope.toFixed(2)} deaths/100k per µg/m³ NO₂)
        </p>
      )}
    </div>
  );
}

/** Cycled by index so any number of selected states gets a distinct, stable color. */
const STATE_LINE_COLORS = [
  "#2563eb",
  "#d97706",
  "#0891b2",
  "#7c3aed",
  "#dc2626",
  "#059669",
  "#db2777",
  "#4338ca",
  "#ca8a04",
  "#0d9488",
  "#be123c",
  "#4d7c0f",
  "#0369a1",
  "#9333ea",
  "#b45309",
  "#0f766e",
];

const HEATMAP_COLUMNS = [
  { key: "no2", label: "NO₂", unit: "µg/m³", accent: "var(--chart-1)" },
  { key: "pm10", label: "PM₁₀", unit: "µg/m³", accent: "var(--chart-1)" },
  {
    key: "mortAgeStd",
    label: "Age-std mort.",
    unit: "/100k",
    accent: "var(--chart-3)",
  },
  {
    key: "mortPer100k",
    label: "Crude rate",
    unit: "/100k",
    accent: "var(--chart-3)",
  },
] as const satisfies {
  key: keyof ReturnType<typeof stateMeans>[number];
  label: string;
  unit: string;
  accent: string;
}[];

/**
 * States × metric heatmap. Replaces the earlier 4-state radar (only
 * compared 4 states, normalized within just that subset) and a later
 * dot-plot rework (only surfaced 2 of the 4 metrics). This shows every
 * state, every one of the 4 headline metrics, and the real value in every
 * cell — colour is purely a within-column skim aid (darker = higher for
 * that metric), never the only way to read the number.
 */
function StateHeatmap({ rows }: { rows: ReturnType<typeof stateMeans> }) {
  if (rows.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No states match this filter.
      </p>
    );
  }

  const domains = HEATMAP_COLUMNS.map((column) => {
    const values = rows.map((row) => row[column.key]);
    return { min: Math.min(...values), max: Math.max(...values) };
  });

  return (
    <div
      className="touch-pan-x overflow-x-auto overflow-y-hidden"
      data-lenis-prevent-touch
    >
      <table className="w-full min-w-[560px] border-separate border-spacing-y-1 text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-card px-2 py-1.5 text-left text-[11px] font-medium text-muted-foreground">
              State
            </th>
            {HEATMAP_COLUMNS.map((column) => (
              <th
                key={column.key}
                className="px-2 py-1.5 text-right text-[11px] font-medium text-muted-foreground"
              >
                {column.label}
                <span className="block text-[9px] font-normal text-muted-foreground">
                  {column.unit}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <motion.tr
              key={row.state}
              className="group"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(rowIndex * 0.02, 0.3) }}
            >
              <td className="sticky left-0 z-10 whitespace-nowrap rounded-l-lg bg-card py-1 pl-2 pr-3 text-xs font-semibold text-foreground group-hover:bg-muted">
                {STATE_ABBR[row.state] ?? row.state.slice(0, 2)}
                <span className="ml-1.5 hidden text-[10px] font-normal text-muted-foreground sm:inline">
                  {row.state}
                </span>
              </td>
              {HEATMAP_COLUMNS.map((column, colIndex) => {
                const value = row[column.key];
                const { min, max } = domains[colIndex]!;
                const t = max === min ? 0.5 : (value - min) / (max - min);
                return (
                  <td key={column.key} className="py-1 pl-1.5">
                    <div
                      className="rounded-md px-2 py-1 text-right font-mono text-xs tabular-nums text-foreground"
                      style={{
                        background: `color-mix(in srgb, ${column.accent} ${6 + t * 58}%, var(--card))`,
                      }}
                      title={`${row.state} · ${column.label} ${value.toFixed(1)} ${column.unit}`}
                    >
                      {value.toFixed(1)}
                    </div>
                  </td>
                );
              })}
            </motion.tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-10 rounded-full"
            style={{
              background: `linear-gradient(to right, color-mix(in srgb, var(--chart-1) 6%, var(--card)), var(--chart-1))`,
            }}
          />
          NO₂ / PM₁₀ — darker = higher
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-10 rounded-full"
            style={{
              background: `linear-gradient(to right, color-mix(in srgb, var(--chart-3) 6%, var(--card)), var(--chart-3))`,
            }}
          />
          Mortality — darker = higher
        </span>
        <span className="text-muted-foreground">
          Sorted by age-std mortality, high to low
        </span>
      </div>
    </div>
  );
}

export function ExploreDashboard() {
  const [year, setYear] = useState<number | "all">("all");
  // Empty array == "all states". Multi-select (rather than one state at a
  // time) lets a visitor build a custom comparison group; every derived
  // view below narrows to it via `filterMaster`/`filterStations`, which
  // treat `[]` as "no filter" the same way `"all"` used to.
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [stationType, setStationType] = useState<string | "all">("all");

  const toggleState = (value: string) => {
    setSelectedStates((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const filteredMaster = useMemo(
    () => filterMaster(masterData, { year, state: selectedStates }),
    [year, selectedStates]
  );
  const filteredStations = useMemo(
    () =>
      filterStations(stationData, {
        year,
        state: selectedStates,
        type: stationType,
      }),
    [year, selectedStates, stationType]
  );
  const kpis = useMemo(() => kpiSummary(filteredMaster), [filteredMaster]);
  // Trend charts intentionally ignore the Year filter — they *are* the
  // 2019–2023 timeline, so pinning them to one year would collapse them to
  // a single point. State selection still averages the "National / filtered
  // trends" area chart down to the chosen subset (multiple filled areas per
  // state would overlap into an unreadable smear), while the mortality line
  // chart below switches to one line per selected state instead.
  const trends = useMemo(
    () => nationalTrends(filterMaster(masterData, { state: selectedStates })),
    [selectedStates]
  );
  const nationalMortSeries = useMemo(
    () =>
      trends.map((row) => ({
        date: row.date,
        mortAgeStd: row.mortAgeStd,
        no2: row.no2,
      })),
    [trends]
  );
  const perStateMortSeries = useMemo(() => {
    if (selectedStates.length === 0) return null;
    const rows = filterMaster(masterData, { state: selectedStates });
    const byYear = new Map<number, Record<string, unknown>>();
    for (const row of rows) {
      const key = STATE_ABBR[row.state] ?? row.state;
      const entry = byYear.get(row.year) ?? { date: new Date(Date.UTC(row.year, 0, 1)) };
      entry[key] = row.mortAgeStd;
      // Suffixed rather than a same-name collision with the mortality key —
      // rendered as a dashed line in the same per-state color so the NO₂
      // overlay survives multi-state mode instead of being dropped.
      entry[`${key}__no2`] = row.no2;
      byYear.set(row.year, entry);
    }
    return [...byYear.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, entry]) => entry);
  }, [selectedStates]);
  const rings = useMemo(() => {
    const mix = stationTypeMix(filteredStations);
    return mix.map((item) => ({
      ...item,
      color: STATION_TYPE_COLORS[item.label] ?? "var(--chart-foreground-muted)",
      label: item.label,
    }));
  }, [filteredStations]);

  const stateRanking = useMemo(
    () => stateMeans(filterMaster(masterData, { year, state: selectedStates })),
    [year, selectedStates]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="font-mono text-xs tracking-[0.18em] text-primary uppercase">
            Explore
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Interactive deep dive
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Filter the master state×year table and UBA monitoring stations to
            explore pollution and mortality patterns across Germany.
          </p>
        </div>
      </motion.div>

      <div className="sticky top-16 z-40 contain-paint -mx-4 border-y border-border/80 bg-background/95 px-4 py-3 sm:mx-0 sm:rounded-xl sm:border sm:px-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-muted-foreground">
            Year
            <select
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              value={year}
              onChange={(event) =>
                setYear(
                  event.target.value === "all"
                    ? "all"
                    : Number(event.target.value)
                )
              }
            >
              <option value="all">All years</option>
              {YEARS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Station type
            <select
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              value={stationType}
              onChange={(event) => setStationType(event.target.value)}
            >
              <option value="all">All types</option>
              <option value="traffic">Traffic</option>
              <option value="background">Background</option>
              <option value="industry">Industry</option>
            </select>
          </label>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              States
              {selectedStates.length > 0 && ` · ${selectedStates.length} selected`}
            </span>
            {selectedStates.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedStates([])}
                className="text-xs font-medium text-primary hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {states.map((value) => {
              const active = selectedStates.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  title={value}
                  onClick={() => toggleState(value)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:bg-muted"
                  )}
                >
                  {STATE_ABBR[value] ?? value}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            {
              label: "Mean NO₂",
              value: `${kpis.meanNo2.toFixed(1)} µg/m³`,
              hint: undefined,
            },
            {
              label: "Mean PM₁₀",
              value: `${kpis.meanPm10.toFixed(1)} µg/m³`,
              hint: undefined,
            },
            {
              label: "Age-std mortality",
              value: `${kpis.meanMort.toFixed(1)} /100k`,
              hint: undefined,
            },
            {
              label: "Pearson r (NO₂)",
              value: formatPearson(kpis.rNo2),
              hint:
                kpis.rNo2 === null
                  ? "Needs 2+ points — widen the Year or State filter"
                  : undefined,
            },
          ] satisfies { label: string; value: string; hint?: string }[]
        ).map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              {item.label}
              <InfoTooltip description={kpiDescriptions[item.label] ?? ""} />
            </p>
            <p className="font-heading mt-1 text-xl font-semibold tracking-tight text-foreground">
              {item.value}
            </p>
            {item.hint && (
              <p className="mt-1 text-[11px] text-muted-foreground">{item.hint}</p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel
          className="lg:col-span-3"
          title="National / filtered trends"
          subtitle={
            selectedStates.length > 0
              ? `NO₂ and PM₁₀ over 2019–2023, averaged across ${selectedStates.length} selected state${selectedStates.length > 1 ? "s" : ""}`
              : "Area chart of NO₂ and PM₁₀ over 2019–2023"
          }
        >
          <div>
            <AreaChart
              key={`trends-${selectedStates.join(",")}`}
              data={trends}
              aspectRatio="16 / 9"
              revealSignature={selectedStates.join(",")}
            >
              <Grid horizontal />
              <Area dataKey="no2" fill={chartCssVars.linePrimary} fillOpacity={0.3} />
              <Area
                dataKey="pm10"
                fill={chartCssVars.lineSecondary}
                fillOpacity={0.22}
              />
              <XAxis />
              <ChartTooltip />
            </AreaChart>
          </div>
        </Panel>

        <Panel
          className="lg:col-span-2"
          title="Station type mix"
          subtitle={`${filteredStations.length} stations in current filter`}
        >
          <div className="mx-auto max-w-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${year}-${selectedStates.join(",")}-${stationType}-${rings.length}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {rings.length > 0 ? (
                  <RingChart data={rings} size={260} strokeWidth={10} ringGap={5}>
                    {rings.map((item, index) => (
                      <Ring key={item.label} index={index} color={item.color} />
                    ))}
                    <RingCenter defaultLabel="Stations" />
                  </RingChart>
                ) : (
                  <p className="py-16 text-center text-sm text-muted-foreground">
                    No stations match this filter.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Panel>
      </div>

      <Panel
        title="Mortality trajectory"
        subtitle={
          perStateMortSeries
            ? `Age-standardised mortality (solid) with NO₂ (dashed) — ${selectedStates.length} state${selectedStates.length > 1 ? "s" : ""} compared`
            : "Age-standardised deaths / 100k with NO₂ overlay"
        }
      >
        <div>
          {perStateMortSeries ? (
            <>
              <LineChart
                key={`mort-${selectedStates.join(",")}`}
                data={perStateMortSeries}
                aspectRatio="16 / 9"
                revealSignature={selectedStates.join(",")}
              >
                <Grid horizontal />
                {selectedStates.flatMap((value, index) => {
                  const abbr = STATE_ABBR[value] ?? value;
                  const color = STATE_LINE_COLORS[index % STATE_LINE_COLORS.length];
                  return [
                    <Line key={`${value}-mort`} dataKey={abbr} stroke={color} />,
                    <Line
                      key={`${value}-no2`}
                      dataKey={`${abbr}__no2`}
                      stroke={color}
                      strokeWidth={1.5}
                      dashFromIndex={0}
                      showHighlight={false}
                      fadeEdges={false}
                    />,
                  ];
                })}
                <XAxis />
                <ChartTooltip
                  rows={(point) =>
                    selectedStates.map((value, index) => {
                      const abbr = STATE_ABBR[value] ?? value;
                      const mort = point[abbr] as number | undefined;
                      const no2 = point[`${abbr}__no2`] as number | undefined;
                      return {
                        color: STATE_LINE_COLORS[index % STATE_LINE_COLORS.length]!,
                        label: value,
                        value:
                          mort != null && no2 != null
                            ? `${mort.toFixed(1)} /100k · ${no2.toFixed(1)} µg/m³`
                            : "—",
                      };
                    })
                  }
                />
              </LineChart>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <ul className="flex flex-wrap gap-2">
                  {selectedStates.map((value, index) => (
                    <li key={value} className="inline-flex items-center gap-1.5">
                      <span
                        className="size-2 rounded-full"
                        style={{
                          background: STATE_LINE_COLORS[index % STATE_LINE_COLORS.length],
                        }}
                      />
                      {STATE_ABBR[value] ?? value}
                    </li>
                  ))}
                </ul>
                <span className="text-muted-foreground">
                  Solid = mortality /100k · Dashed = NO₂ µg/m³
                </span>
              </div>
            </>
          ) : (
            <LineChart
              key="mort-all"
              data={nationalMortSeries}
              aspectRatio="16 / 9"
              revealSignature="all"
            >
              <Grid horizontal />
              <Line dataKey="mortAgeStd" stroke={chartCssVars.linePrimary} />
              <Line dataKey="no2" stroke={chartCssVars.lineSecondary} />
              <XAxis />
              <ChartTooltip
                rows={(point) => [
                  {
                    color: chartCssVars.linePrimary,
                    label: "Age-std mortality",
                    value: `${(point.mortAgeStd as number).toFixed(1)} /100k`,
                  },
                  {
                    color: chartCssVars.lineSecondary,
                    label: "NO₂",
                    value: `${(point.no2 as number).toFixed(1)} µg/m³`,
                  },
                ]}
              />
            </LineChart>
          )}
        </div>
      </Panel>

      <Panel
        title="State × metric heatmap"
        subtitle={`${stateRanking.length} states · NO₂, PM₁₀, age-std & crude mortality · ${year === "all" ? "all years" : year}`}
      >
        <StateHeatmap rows={stateRanking} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="NO₂ ↔ age-standardised mortality"
          subtitle="State×year points under the current filter"
        >
          <AssociationScatter rows={filteredMaster} />
        </Panel>
        <Panel
          title="Station co-exposure"
          subtitle="PM₁₀ vs NO₂ coloured by traffic / background / industry"
        >
          <CoExposureScatter rows={filteredStations} />
        </Panel>
      </div>
    </div>
  );
}
