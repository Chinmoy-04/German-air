export type MasterRow = {
  state: string;
  year: number;
  deaths: number;
  mortAgeStd: number;
  no2: number;
  pm10: number;
  population: number;
  mortPer100k: number;
};

export type StationType = "traffic" | "background" | "industry" | string;

export type StationRow = {
  state: string;
  stationCode: string;
  stationName: string;
  setting: string;
  type: StationType;
  pm10Mean: number;
  no2Mean: number;
  year: number;
};

export const STATION_TYPE_COLORS: Record<string, string> = {
  traffic: "#E63946",
  background: "#06B6D4",
  industry: "#F59E0B",
};

export const YEARS = [2019, 2020, 2021, 2022, 2023] as const;

// Same short codes used in the R notebook's tile-grid map (fig4-tilemap).
export const STATE_ABBR: Record<string, string> = {
  "Schleswig-Holstein": "SH",
  Bremen: "HB",
  Hamburg: "HH",
  "Mecklenburg-Western Pomerania": "MV",
  "Lower Saxony": "NI",
  "Saxony-Anhalt": "ST",
  Brandenburg: "BB",
  Berlin: "BE",
  "North Rhine-Westphalia": "NW",
  Hesse: "HE",
  Thuringia: "TH",
  Saxony: "SN",
  "Rhineland-Palatinate": "RP",
  Bavaria: "BY",
  Saarland: "SL",
  "Baden-Württemberg": "BW",
};
