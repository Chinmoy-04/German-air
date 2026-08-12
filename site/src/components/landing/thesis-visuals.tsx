"use client";

import { HoverTooltip, useHoverTooltip } from "@/components/ui/hover-tooltip";
import {
  STATE_ABBR,
  linearFit,
  masterData,
  nationalTrends,
  pearson,
  stateMeans,
} from "@/lib/data";
import { useMemo, useRef, useState } from "react";

/** Small colour-tinted pill used to surface a stat next to a chart title. */
function StatBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold"
      style={{ backgroundColor: `color-mix(in oklch, ${color} 14%, transparent)`, color }}
    >
      {label}
    </span>
  );
}

/** Shared card chrome for a single mini chart — matches the Explore panels. */
function VisualCard({
  title,
  badge,
  children,
}: {
  title: string;
  badge: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-border bg-muted/40 p-3">
      <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-muted-foreground">{title}</p>
        {badge}
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

/**
 * Small reusable scatter used by the Metric and Signal panels.
 * Renders absolutely inside a `relative flex-1` parent so it always fills
 * the space the flex/grid layout gives it, instead of guessing a fixed px height.
 */
function MiniScatter({
  points,
  color,
  viewBoxHeight = 118,
  xLabel,
  xUnit,
  yLabel,
  yUnit,
  xFmt = (v: number) => v.toFixed(1),
  yFmt = (v: number) => v.toFixed(1),
}: {
  points: { x: number; y: number; state: string; year: number }[];
  color: string;
  viewBoxHeight?: number;
  xLabel: string;
  xUnit: string;
  yLabel: string;
  yUnit: string;
  xFmt?: (v: number) => string;
  yFmt?: (v: number) => string;
}) {
  const width = 260;
  const height = viewBoxHeight;
  const margin = { top: 6, right: 6, bottom: 6, left: 6 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const xPad = (xMax - xMin) * 0.08 || 1;
  const yPad = (yMax - yMin) * 0.14 || 1;

  const toX = (v: number) =>
    ((v - (xMin - xPad)) / (xMax - xMin + xPad * 2)) * innerW;
  const toY = (v: number) =>
    innerH - ((v - (yMin - yPad)) / (yMax - yMin + yPad * 2)) * innerH;

  const { slope, intercept } = linearFit(xs, ys);
  const lineX0 = xMin - xPad;
  const lineX1 = xMax + xPad;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { tooltip, show, hide } = useHoverTooltip();

  return (
    <>
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
        viewBox={`0 0 ${width} ${height}`}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          <line
            stroke="var(--chart-foreground-muted)"
            strokeDasharray="4 3"
            strokeOpacity={0.85}
            strokeWidth={1.5}
            x1={toX(lineX0)}
            x2={toX(lineX1)}
            y1={toY(intercept + slope * lineX0)}
            y2={toY(intercept + slope * lineX1)}
          />
          {points.map((p, index) => (
            <circle
              cx={toX(p.x)}
              cy={toY(p.y)}
              fill={color}
              fillOpacity={hoveredIndex === index ? 1 : 0.75}
              key={index}
              onMouseEnter={(event) => {
                setHoveredIndex(index);
                show(
                  event.clientX,
                  event.clientY,
                  <div className="space-y-0.5">
                    <p className="font-medium text-popover-foreground">
                      {p.state} · {p.year}
                    </p>
                    <p>
                      {xLabel}: <span className="font-mono">{xFmt(p.x)}</span>{" "}
                      {xUnit}
                    </p>
                    <p>
                      {yLabel}: <span className="font-mono">{yFmt(p.y)}</span>{" "}
                      {yUnit}
                    </p>
                  </div>
                );
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
                hide();
              }}
              r={hoveredIndex === index ? 4.6 : 3.2}
              style={{
                cursor: "pointer",
                transition: "r 100ms ease, fill-opacity 100ms ease",
              }}
            />
          ))}
        </g>
      </svg>
      <HoverTooltip tooltip={tooltip} />
    </>
  );
}

/** "Metric" lens — mirrors the Rmd's fig1-normalization-flip (3 mortality metrics vs NO₂). */
export function MetricFlipVisual() {
  const panels = useMemo(() => {
    const no2 = masterData.map((r) => r.no2);
    const configs: {
      key: "deaths" | "mortPer100k" | "mortAgeStd";
      title: string;
      color: string;
      yLabel: string;
      yUnit: string;
      yFmt?: (v: number) => string;
    }[] = [
      {
        key: "deaths",
        title: "Raw counts",
        color: "var(--chart-5)",
        yLabel: "Deaths",
        yUnit: "count",
        yFmt: (v) => Math.round(v).toLocaleString(),
      },
      {
        key: "mortPer100k",
        title: "Crude rate",
        color: "var(--chart-3)",
        yLabel: "Crude rate",
        yUnit: "/100k",
      },
      {
        key: "mortAgeStd",
        title: "Age-standardised",
        color: "var(--chart-1)",
        yLabel: "Age-std mortality",
        yUnit: "/100k",
      },
    ];
    return configs.map((config) => {
      const ys = masterData.map((r) => r[config.key]);
      return {
        ...config,
        rValue: pearson(no2, ys),
        points: masterData.map((r) => ({
          x: r.no2,
          y: r[config.key],
          state: r.state,
          year: r.year,
        })),
      };
    });
  }, []);

  return (
    <div className="flex h-full flex-col p-5 sm:p-6">
      <div>
        <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          Same NO₂ data, three mortality metrics
        </h3>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          x-axis: NO₂ (µg/m³) on every panel · same 16 states × 5 years, only
          the y-axis metric changes
        </p>
      </div>
      <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
        {panels.map((panel) => (
          <VisualCard
            badge={
              <StatBadge
                color={panel.color}
                label={`r ${panel.rValue >= 0 ? "+" : ""}${panel.rValue.toFixed(2)}`}
              />
            }
            key={panel.key}
            title={panel.title}
          >
            <MiniScatter
              color={panel.color}
              points={panel.points}
              viewBoxHeight={165}
              xFmt={(v) => v.toFixed(1)}
              xLabel="NO₂"
              xUnit="µg/m³"
              yFmt={panel.yFmt}
              yLabel={panel.yLabel}
              yUnit={panel.yUnit}
            />
          </VisualCard>
        ))}
      </div>
    </div>
  );
}

/** "Signal" lens — mirrors fig2-scatter (NO₂ and PM₁₀ vs age-std mortality). */
export function SignalVisual() {
  const panels = useMemo(() => {
    const mortAgeStd = masterData.map((r) => r.mortAgeStd);
    const configs: {
      key: "no2" | "pm10";
      title: string;
      color: string;
      xLabel: string;
    }[] = [
      {
        key: "no2",
        title: "NO₂ vs age-std mortality",
        color: "var(--chart-1)",
        xLabel: "NO₂",
      },
      {
        key: "pm10",
        title: "PM₁₀ vs age-std mortality",
        color: "var(--chart-4)",
        xLabel: "PM₁₀",
      },
    ];
    return configs.map((config) => {
      const xs = masterData.map((r) => r[config.key]);
      return {
        ...config,
        rValue: pearson(xs, mortAgeStd),
        points: masterData.map((r) => ({
          x: r[config.key],
          y: r.mortAgeStd,
          state: r.state,
          year: r.year,
        })),
      };
    });
  }, []);

  return (
    <div className="flex h-full flex-col p-5 sm:p-6">
      <div>
        <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          NO₂ carries the signal — PM₁₀ doesn’t
        </h3>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Age-standardised deaths / 100k, 16 states × 5 years (2019–2023)
        </p>
      </div>
      <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
        {panels.map((panel) => (
          <VisualCard
            badge={
              <StatBadge
                color={panel.color}
                label={`r ${panel.rValue >= 0 ? "+" : ""}${panel.rValue.toFixed(2)}`}
              />
            }
            key={panel.key}
            title={panel.title}
          >
            <MiniScatter
              color={panel.color}
              points={panel.points}
              viewBoxHeight={170}
              xLabel={panel.xLabel}
              xUnit="µg/m³"
              yLabel="Age-std mortality"
              yUnit="/100k"
            />
          </VisualCard>
        ))}
      </div>
    </div>
  );
}

/** "Time" lens — mirrors fig3-trends (national means, COVID band, pollutant decline). */
export function TimeVisual() {
  const trends = useMemo(() => nationalTrends(masterData), []);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const { tooltip, show, hide } = useHoverTooltip();

  const width = 640;
  const topHeight = 90;
  const bottomHeight = 80;
  const margin = { left: 34, right: 14 };
  const innerW = width - margin.left - margin.right;

  const years = trends.map((t) => t.year);
  const yearToX = (year: number) =>
    margin.left +
    ((year - years[0]!) / (years.at(-1)! - years[0]!)) * innerW;

  const mortVals = trends.map((t) => t.mortAgeStd);
  const mortMin = Math.min(...mortVals);
  const mortMax = Math.max(...mortVals);
  const mortPad = (mortMax - mortMin) * 0.15 || 1;
  const mortToY = (v: number) =>
    10 +
    (topHeight - 22) *
      (1 - (v - (mortMin - mortPad)) / (mortMax - mortMin + mortPad * 2));

  const pollVals = [...trends.map((t) => t.no2), ...trends.map((t) => t.pm10)];
  const pollMin = Math.min(...pollVals, 0);
  const pollMax = Math.max(...pollVals);
  const pollToY = (v: number) =>
    8 + (bottomHeight - 22) * (1 - (v - pollMin) / (pollMax - pollMin || 1));

  const mortPath = trends
    .map((t, i) => `${i === 0 ? "M" : "L"}${yearToX(t.year)},${mortToY(t.mortAgeStd)}`)
    .join(" ");
  const no2Path = trends
    .map((t, i) => `${i === 0 ? "M" : "L"}${yearToX(t.year)},${pollToY(t.no2)}`)
    .join(" ");
  const pm10Path = trends
    .map((t, i) => `${i === 0 ? "M" : "L"}${yearToX(t.year)},${pollToY(t.pm10)}`)
    .join(" ");

  const handlePointerMove = (event: React.MouseEvent<SVGRectElement>) => {
    const svg = svgRef.current;
    if (!svg) {
      return;
    }
    const rect = svg.getBoundingClientRect();
    const scaleX = width / rect.width;
    const localX = (event.clientX - rect.left) * scaleX;
    let nearest = 0;
    let minDist = Number.POSITIVE_INFINITY;
    years.forEach((year, index) => {
      const dist = Math.abs(yearToX(year) - localX);
      if (dist < minDist) {
        minDist = dist;
        nearest = index;
      }
    });
    setHoverIdx(nearest);
    const t = trends[nearest]!;
    show(
      event.clientX,
      event.clientY,
      <div className="space-y-0.5">
        <p className="font-medium text-popover-foreground">{t.year}</p>
        <p>
          Age-std mortality:{" "}
          <span className="font-mono">{t.mortAgeStd.toFixed(1)}</span> /100k
        </p>
        <p>
          NO₂: <span className="font-mono">{t.no2.toFixed(1)}</span> µg/m³
        </p>
        <p>
          PM₁₀: <span className="font-mono">{t.pm10.toFixed(1)}</span> µg/m³
        </p>
      </div>
    );
  };

  const handlePointerLeave = () => {
    setHoverIdx(null);
    hide();
  };

  return (
    <div className="flex h-full flex-col p-5 sm:p-6">
      <div>
        <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          COVID interrupts the trend, pollution keeps falling
        </h3>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          National means by year, 2019–2023
        </p>
      </div>
      <div className="mt-3 flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-muted/40 p-3">
        <svg
          aria-label="Age-standardised mortality dips in 2020-2021 then rebounds while NO2 and PM10 decline steadily"
          className="min-h-0 w-full flex-1"
          preserveAspectRatio="xMidYMid meet"
          ref={svgRef}
          role="img"
          viewBox={`0 0 ${width} ${topHeight + bottomHeight}`}
        >
          <rect
            fill="var(--chart-foreground-muted)"
            fillOpacity={0.15}
            height={topHeight - 10}
            width={yearToX(2021) - yearToX(2020)}
            x={yearToX(2020)}
            y={6}
          />
          <text
            className="fill-muted-foreground text-[10px]"
            textAnchor="middle"
            x={(yearToX(2020) + yearToX(2021)) / 2}
            y={topHeight - 4}
          >
            COVID
          </text>
          <path d={mortPath} fill="none" stroke="var(--chart-3)" strokeWidth={2.5} />
          {trends.map((t) => (
            <circle
              cx={yearToX(t.year)}
              cy={mortToY(t.mortAgeStd)}
              fill="var(--chart-3)"
              key={`mort-${t.year}`}
              r={3.4}
            />
          ))}

          <line
            stroke="var(--chart-grid)"
            strokeWidth={1}
            x1={margin.left}
            x2={width - margin.right}
            y1={topHeight}
            y2={topHeight}
          />

          <g transform={`translate(0,${topHeight})`}>
            <path d={no2Path} fill="none" stroke="var(--chart-1)" strokeWidth={2.5} />
            <path
              d={pm10Path}
              fill="none"
              stroke="var(--chart-2)"
              strokeDasharray="5 3"
              strokeWidth={2.5}
            />
          </g>
          {years.map((year) => (
            <text
              className="fill-muted-foreground text-[10px]"
              key={year}
              textAnchor="middle"
              x={yearToX(year)}
              y={topHeight + bottomHeight - 4}
            >
              {year}
            </text>
          ))}

          {hoverIdx !== null && (
            <g style={{ pointerEvents: "none" }}>
              <line
                stroke="var(--chart-crosshair)"
                strokeDasharray="3 3"
                strokeWidth={1}
                x1={yearToX(trends[hoverIdx]!.year)}
                x2={yearToX(trends[hoverIdx]!.year)}
                y1={0}
                y2={topHeight + bottomHeight}
              />
              <circle
                cx={yearToX(trends[hoverIdx]!.year)}
                cy={mortToY(trends[hoverIdx]!.mortAgeStd)}
                fill="var(--chart-3)"
                r={5}
                stroke="var(--chart-background)"
                strokeWidth={1.5}
              />
              <circle
                cx={yearToX(trends[hoverIdx]!.year)}
                cy={topHeight + pollToY(trends[hoverIdx]!.no2)}
                fill="var(--chart-1)"
                r={4}
                stroke="var(--chart-background)"
                strokeWidth={1.5}
              />
              <circle
                cx={yearToX(trends[hoverIdx]!.year)}
                cy={topHeight + pollToY(trends[hoverIdx]!.pm10)}
                fill="var(--chart-2)"
                r={4}
                stroke="var(--chart-background)"
                strokeWidth={1.5}
              />
            </g>
          )}

          <rect
            fill="transparent"
            height={topHeight + bottomHeight}
            onMouseLeave={handlePointerLeave}
            onMouseMove={handlePointerMove}
            style={{ cursor: "crosshair" }}
            width={width}
            x={0}
            y={0}
          />
        </svg>
        <HoverTooltip tooltip={tooltip} />
        <div className="mt-2 flex shrink-0 flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ background: "var(--chart-3)" }}
            />
            Age-std mortality
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ background: "var(--chart-1)" }}
            />
            NO₂
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ background: "var(--chart-2)" }}
            />
            PM₁₀
          </span>
        </div>
      </div>
    </div>
  );
}

function colorForShare(t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  const stops: [number, [number, number, number]][] = [
    [0, [255, 255, 204]],
    [0.5, [253, 141, 60]],
    [1, [189, 0, 38]],
  ];
  let lo = stops[0]!;
  let hi = stops.at(-1)!;
  for (let i = 0; i < stops.length - 1; i += 1) {
    if (clamped >= stops[i]![0] && clamped <= stops[i + 1]![0]) {
      lo = stops[i]!;
      hi = stops[i + 1]!;
      break;
    }
  }
  const span = hi[0] - lo[0] || 1;
  const localT = (clamped - lo[0]) / span;
  const [r0, g0, b0] = lo[1];
  const [r1, g1, b1] = hi[1];
  const r = Math.round(r0 + (r1 - r0) * localT);
  const g = Math.round(g0 + (g1 - g0) * localT);
  const b = Math.round(b0 + (b1 - b0) * localT);
  return `rgb(${r}, ${g}, ${b})`;
}

/** "Space" lens — mirrors fig4-tilemap (states ranked by age-std mortality). */
export function SpaceVisual() {
  const ranked = useMemo(() => stateMeans(masterData), []);
  const highlight = new Set(["Berlin", "North Rhine-Westphalia", "Hamburg"]);
  const lowlight = "Baden-Württemberg";
  const { tooltip, show, hide } = useHoverTooltip();

  const min = Math.min(...ranked.map((r) => r.mortAgeStd));
  const max = Math.max(...ranked.map((r) => r.mortAgeStd));

  return (
    <div className="flex h-full flex-col p-5 sm:p-6">
      <div>
        <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          Urban, high-NO₂ states rank highest
        </h3>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Mean age-standardised deaths / 100k by state, 2019–2023
        </p>
      </div>
      <div className="mt-3 flex-1 rounded-xl border border-border bg-muted/40 p-3">
        <div className="grid h-full grid-cols-8 items-end gap-1.5 sm:gap-2">
          {ranked.map((row) => {
            const t = (row.mortAgeStd - min) / (max - min || 1);
            const heightPct = 20 + t * 80;
            const isHigh = highlight.has(row.state);
            const isLow = row.state === lowlight;
            return (
              <div
                className="flex h-full cursor-pointer flex-col items-center justify-end"
                key={row.state}
                onMouseEnter={(event) =>
                  show(
                    event.clientX,
                    event.clientY,
                    <div className="space-y-0.5">
                      <p className="font-medium text-popover-foreground">
                        {row.state}
                      </p>
                      <p>
                        Age-std mortality:{" "}
                        <span className="font-mono">
                          {row.mortAgeStd.toFixed(1)}
                        </span>{" "}
                        /100k
                      </p>
                    </div>
                  )
                }
                onMouseLeave={hide}
              >
                <span
                  className={`text-[10px] font-semibold ${
                    isHigh
                      ? "text-rose-600 dark:text-rose-400"
                      : isLow
                        ? "text-primary"
                        : "text-muted-foreground"
                  }`}
                >
                  {row.mortAgeStd.toFixed(0)}
                </span>
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${heightPct}%`,
                    background: colorForShare(t),
                    outline:
                      isHigh || isLow ? "2px solid var(--foreground)" : undefined,
                    outlineOffset: -1,
                  }}
                />
                <span
                  className={`mt-1.5 font-mono text-[10px] ${
                    isHigh
                      ? "font-bold text-rose-600 dark:text-rose-400"
                      : isLow
                        ? "font-bold text-primary"
                        : "text-muted-foreground"
                  }`}
                >
                  {STATE_ABBR[row.state] ?? row.state.slice(0, 2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <HoverTooltip tooltip={tooltip} />
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border-2 border-foreground bg-rose-400" />
          High NO₂ / high mortality (Berlin, NRW, Hamburg)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border-2 border-foreground bg-sky-200" />
          Low outlier (Baden-Württemberg)
        </span>
      </div>
    </div>
  );
}
