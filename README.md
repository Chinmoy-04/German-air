# German Air

**Live site: [german-air.vercel.app](https://german-air.vercel.app/)**

Air quality (NO₂, PM₁₀) and age-standardised respiratory mortality across Germany's
16 federal states, 2019–2023. The repo has two parts:

- **`/` (this level)** — the R analysis: raw UBA/GBE-Bund CSVs, the R Markdown
  notebooks that clean/join them and produce `master_clean.csv`, and the final
  PDF report.
- **[`/site`](./site)** — a Next.js portfolio site + interactive `/explore`
  dashboard built on top of `master_clean.csv` and the UBA station tables. See
  [`site/README.md`](./site/README.md) for its own setup instructions.

## Data sources

- **UBA annual tabulations** — station-level PM₁₀ and NO₂ means
  (`Annual-tabulation_*.csv`), 2019–2023.
- **GBE-Bund mortality** — respiratory deaths (ICD-10 J00–J99)
  (`*Respiratory Mortality.csv`) and age-standardised rates using the European
  Standard Population 2013 (`Age standardised mortality *.csv`).
- **Population baselines** — official 2022 resident populations, used to
  convert counts to crude/age-standardised rates.

`master_clean.csv` is the cleaned, joined state × year table (16 states × 5
years) that both the R notebooks and the site's KPIs/charts are built from.

## Analysis notebooks

- `1.Rmd`, `2.Rmd` — initial cleaning/exploration passes.
- `analysis.Rmd` / `analysis_final.Rmd` / `analysis_last.Rmd` — the main
  analysis notebook (correlation, normalization comparison, trend and
  tile-map figures) across its revisions.
- `Deep_Dive_Dashboard.Rmd` — the flexdashboard version of the deep-dive.
- `Data Visualisation Report.pdf` — the final written report.

Knitted HTML outputs and `*_run.R` render scripts are not tracked (regenerate
locally with `rmarkdown::render()` / knitr if needed — they're large and just
duplicate what the `.Rmd` sources already contain).

## Site

Live at [german-air.vercel.app](https://german-air.vercel.app/). The site is fully static — it reads pre-generated JSON (`site/src/data/*.json`)
produced from `master_clean.csv` and the UBA tabulations by
`site/scripts/prepare-data.py`. Deploys to Vercel with no environment
variables and no build-time dependency on this repo's CSVs (the generated
JSON is committed).

```bash
cd site
npm install
npm run dev
```

## Credits

Site design & build: Chinmoy Bora. Research, analysis & findings: Chinmoy
Bora, Adham Abdelhalim, Odinaka Obioha.
