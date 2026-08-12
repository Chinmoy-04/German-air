# German Air Site

Portfolio website + interactive explore dashboard for the German air quality & respiratory mortality study (2019–2023).

**Live: [german-air.vercel.app](https://german-air.vercel.app/)**

## Stack

- Next.js App Router + TypeScript + Tailwind CSS v4
- Kokonut UI (`smooth-tab`, `liquid-glass-card`)
- Bklit charts (Area, Line, Ring, Radar)
- Motion + Lenis

## Setup

```bash
cd site
npm install
npm run prepare:data   # regenerates src/data/*.json from parent CSVs
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Explore lives at `/explore`.

## Deploying to Vercel

The site is fully static (no API routes, no environment variables) and reads
pre-generated JSON committed at `src/data/master.json` / `src/data/stations.json`
— Vercel's build never needs the parent repo's raw CSVs or the Python step.

- If this repo's root **is** `site/` (its own repo): import it in Vercel as-is,
  framework auto-detects as Next.js, no config needed.
- If deploying from the parent monorepo: in the Vercel project settings, set
  **Root Directory** to `site`.

Only re-run `npm run prepare:data` (which needs the parent folder's CSVs) when
the source data changes, then commit the regenerated `src/data/*.json` — don't
rely on it running during the Vercel build.

## Install commands used

```bash
npx create-next-app@latest site --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --yes
npx shadcn@latest init -d --force
# registries in components.json: @bklit, @kokonutui
npx shadcn@latest add @bklit/area-chart @bklit/line-chart @bklit/ring-chart @bklit/radar-chart @bklit/scatter-chart @kokonutui/liquid-glass-card @kokonutui/bento-grid @kokonutui/smooth-tab --yes --overwrite
npm i lenis motion
```
