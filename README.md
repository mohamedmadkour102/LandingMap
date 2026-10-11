# Meridian Group — Concept Explorations

Four premium landing-page concepts for a fictional international holding company, built to compare map-led corporate experiences.

## Concepts

| Route | Concept |
|-------|---------|
| `/`   | Concept selector |
| `/v1` | Editorial Geographic Atlas |
| `/v2` | Global 3D Network (point-cloud globe) |
| `/v3` | Cinematic Country Explorer |
| `/v4` | Experimental Corporate Network |
| `/v5` | Cinematic Route Map |

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Framer Motion
- React Three Fiber / Drei (V2 globe)
- D3 (V4 network)
- Lucide icons

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Data

Centralized dummy data lives in `src/data/` — group metrics, companies, locations, projects, and news are shared across all four versions.
