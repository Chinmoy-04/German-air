import masterJson from "@/data/master.json";
import stationsJson from "@/data/stations.json";
import type { MasterRow, StationRow } from "./types";

export const masterData = masterJson as MasterRow[];
export const stationData = stationsJson as StationRow[];

export const states = [...new Set(masterData.map((row) => row.state))].sort(
  (a, b) => a.localeCompare(b)
);

export * from "./metrics";
export * from "./types";
