"""Convert project CSVs into typed JSON for the Next.js site."""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parents[1] / "src" / "data"
OUT.mkdir(parents=True, exist_ok=True)

VALID = {
    "Baden-Württemberg",
    "Bavaria",
    "Berlin",
    "Brandenburg",
    "Bremen",
    "Hamburg",
    "Hesse",
    "Lower Saxony",
    "Mecklenburg-Western Pomerania",
    "North Rhine-Westphalia",
    "Rhineland-Palatinate",
    "Saarland",
    "Saxony",
    "Saxony-Anhalt",
    "Schleswig-Holstein",
    "Thuringia",
}

STATE_ALIASES = {
    "Baden-Wurttemberg": "Baden-Württemberg",
    "Mecklenburg Western Pomerania": "Mecklenburg-Western Pomerania",
    "Mecklenburg-West Pomerania": "Mecklenburg-Western Pomerania",
    "Saxony Anhalt": "Saxony-Anhalt",
}


def std_state(value: str) -> str:
    cleaned = value.strip().strip('"')
    return STATE_ALIASES.get(cleaned, cleaned)


def parse_float(value: str) -> float | None:
    try:
        return float(str(value).replace(",", "."))
    except (TypeError, ValueError):
        return None


def read_pollution(files: list[Path], mean_key: str) -> list[dict]:
    rows: list[dict] = []
    for path in files:
        year_match = re.search(r"(\d{4})", path.name)
        if not year_match:
            continue
        year = int(year_match.group(1))
        with path.open(encoding="utf-8") as handle:
            reader = csv.reader(handle, delimiter=";")
            next(reader, None)
            for cols in reader:
                if len(cols) < 7:
                    continue
                state = std_state(cols[0])
                if state not in VALID:
                    continue
                station_type = (cols[4] or "").strip().lower()
                if not station_type:
                    continue
                mean = parse_float(cols[5])
                if mean is None:
                    continue
                rows.append(
                    {
                        "state": state,
                        "stationCode": cols[1].strip(),
                        "stationName": cols[2].strip().strip('"'),
                        "setting": cols[3].strip(),
                        "type": station_type,
                        mean_key: mean,
                        "year": year,
                    }
                )
    return rows


def main() -> None:
    master: list[dict] = []
    with (ROOT / "master_clean.csv").open(encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            master.append(
                {
                    "state": std_state(row["State"]),
                    "year": int(row["Year"]),
                    "deaths": float(row["Deaths"]),
                    "mortAgeStd": float(row["Mort_age_std"]),
                    "no2": float(row["NO2"]),
                    "pm10": float(row["PM10"]),
                    "population": float(row["Population"]),
                    "mortPer100k": float(row["Mort_per_100k"]),
                }
            )

    pm_rows = read_pollution(
        sorted(ROOT.glob("Annual-tabulation_Particulate matter_*.csv")),
        "pm10Mean",
    )
    no2_rows = read_pollution(
        sorted(ROOT.glob("Annual-tabulation_Nitrogen dioxide_*.csv")),
        "no2Mean",
    )

    joined: dict[tuple[str, int], dict] = {}
    for row in pm_rows:
        joined[(row["stationCode"], row["year"])] = dict(row)
    for row in no2_rows:
        key = (row["stationCode"], row["year"])
        if key in joined:
            joined[key]["no2Mean"] = row["no2Mean"]

    stations = [
        {
            "state": value["state"],
            "stationCode": value["stationCode"],
            "stationName": value["stationName"],
            "setting": value["setting"],
            "type": value["type"],
            "pm10Mean": value["pm10Mean"],
            "no2Mean": value["no2Mean"],
            "year": value["year"],
        }
        for value in joined.values()
        if "pm10Mean" in value and "no2Mean" in value and value.get("type")
    ]

    (OUT / "master.json").write_text(
        json.dumps(master, ensure_ascii=False),
        encoding="utf-8",
    )
    (OUT / "stations.json").write_text(
        json.dumps(stations, ensure_ascii=False),
        encoding="utf-8",
    )

    type_counts = {
        station_type: sum(1 for station in stations if station["type"] == station_type)
        for station_type in sorted({station["type"] for station in stations})
    }
    print(f"master={len(master)} stations={len(stations)} types={type_counts}")


if __name__ == "__main__":
    main()
