import type { MasterRow, StationRow } from "./types";

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;
  const xMean = mean(xs.slice(0, n));
  const yMean = mean(ys.slice(0, n));
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = xs[i]! - xMean;
    const dy = ys[i]! - yMean;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

export function nationalTrends(rows: MasterRow[]) {
  const byYear = new Map<number, MasterRow[]>();
  for (const row of rows) {
    const list = byYear.get(row.year) ?? [];
    list.push(row);
    byYear.set(row.year, list);
  }

  return [...byYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, group]) => ({
      date: new Date(Date.UTC(year, 0, 1)),
      year,
      no2: mean(group.map((row) => row.no2)),
      pm10: mean(group.map((row) => row.pm10)),
      mortAgeStd: mean(group.map((row) => row.mortAgeStd)),
      deaths: group.reduce((sum, row) => sum + row.deaths, 0),
    }));
}

/** A single state, a list of states, `"all"`, or omitted — all mean "no state filter" once normalized. */
export type StateFilter = string | string[] | "all" | undefined;

/**
 * Normalizes the many ways callers express "don't filter by state" (`"all"`,
 * `undefined`, `[]`) down to `null`, and a single state to a one-item array,
 * so every filter just needs an `includes` check.
 */
function normalizeStates(state: StateFilter): string[] | null {
  if (!state || state === "all") return null;
  const list = Array.isArray(state) ? state : [state];
  return list.length === 0 ? null : list;
}

export function filterMaster(
  rows: MasterRow[],
  opts: { year?: number | "all"; state?: StateFilter }
) {
  const states = normalizeStates(opts.state);
  return rows.filter((row) => {
    if (opts.year && opts.year !== "all" && row.year !== opts.year) return false;
    if (states && !states.includes(row.state)) return false;
    return true;
  });
}

export function filterStations(
  rows: StationRow[],
  opts: { year?: number | "all"; state?: StateFilter; type?: string | "all" }
) {
  const states = normalizeStates(opts.state);
  return rows.filter((row) => {
    if (opts.year && opts.year !== "all" && row.year !== opts.year) return false;
    if (states && !states.includes(row.state)) return false;
    if (opts.type && opts.type !== "all" && row.type !== opts.type) return false;
    return true;
  });
}

export function stationTypeMix(rows: StationRow[]) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.type, (counts.get(row.type) ?? 0) + 1);
  }
  const total = rows.length || 1;
  return [...counts.entries()].map(([label, value]) => ({
    label,
    value,
    maxValue: total,
  }));
}

export function stateMeans(rows: MasterRow[]) {
  const byState = new Map<string, MasterRow[]>();
  for (const row of rows) {
    const list = byState.get(row.state) ?? [];
    list.push(row);
    byState.set(row.state, list);
  }

  return [...byState.entries()]
    .map(([state, group]) => ({
      state,
      no2: mean(group.map((row) => row.no2)),
      pm10: mean(group.map((row) => row.pm10)),
      mortAgeStd: mean(group.map((row) => row.mortAgeStd)),
      mortPer100k: mean(group.map((row) => row.mortPer100k)),
      deaths: mean(group.map((row) => row.deaths)),
    }))
    .sort((a, b) => b.mortAgeStd - a.mortAgeStd);
}

/** Ordinary least squares fit — used to draw trend lines on mini scatters. */
export function linearFit(xs: number[], ys: number[]) {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return { slope: 0, intercept: mean(ys) };
  const xMean = mean(xs.slice(0, n));
  const yMean = mean(ys.slice(0, n));
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = xs[i]! - xMean;
    num += dx * (ys[i]! - yMean);
    den += dx * dx;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  return { slope, intercept };
}

export function normalize01(value: number, min: number, max: number) {
  if (max === min) return 50;
  return ((value - min) / (max - min)) * 100;
}

export function kpiSummary(rows: MasterRow[]) {
  const no2 = rows.map((row) => row.no2);
  const pm10 = rows.map((row) => row.pm10);
  const mort = rows.map((row) => row.mortAgeStd);
  // Pearson r needs at least 2 (state, year) points to have any variance to
  // correlate. A single-row filter (one state + one year) makes it
  // mathematically undefined, not "no correlation" — surface that as `null`
  // instead of `pearson()`'s internal 0 fallback, which would misleadingly
  // read as a computed zero relationship.
  const hasVariance = rows.length >= 2;
  return {
    meanNo2: mean(no2),
    meanPm10: mean(pm10),
    meanMort: mean(mort),
    rNo2: hasVariance ? pearson(no2, mort) : null,
    rPm10: hasVariance ? pearson(pm10, mort) : null,
    totalDeaths: rows.reduce((sum, row) => sum + row.deaths, 0),
  };
}

/** Formats a Pearson r that may be `null` (not enough rows to correlate). */
export function formatPearson(r: number | null): string {
  if (r === null) return "N/A";
  return `${r >= 0 ? "+" : ""}${r.toFixed(2)}`;
}
