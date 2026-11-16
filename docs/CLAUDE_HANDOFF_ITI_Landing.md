# CLAUDE HANDOFF — ITI Group Landing Enhancement

**Read this entire document first, then explore the repo and the Neusoft asset pack, then implement.**  
Do not wait for further clarification on goals already stated here. Explore, propose briefly in your plan, then execute high-value improvements.

---

## 0. Mission (what you are hired to do)

You are continuing work on the **ITI Group corporate landing page**.

Your job is a **full enhancement pass**, not a rewrite:

1. **Map / Global Footprint** — raise the visual and content quality of the interactive globe map (already converted to orthographic 3D-style SVG globe; needs more polish + real client assets).
2. **Neusoft asset pack** — fully mine `Neusoft - ITI Website/` for **photos, logos, and Word descriptions**, and wire the best material into the live landing content.
3. **Upper sections** (Hero, About, Vision/Mission, Values, Contact) — enhance layout, imagery, hierarchy, and motion **based on existing copy and brand**, without inventing a different product story.
4. Stay inside ITI brand (light corporate navy/copper). Do **not** turn the page into a dark SaaS / neon globe clone unless a specific subsection clearly benefits and still matches brand.

**Primary product surface:** `/en` and `/ar` (ITI page).  
Concept lab routes `/v1` `/v2` `/v5` `/concepts` are **reference only** (especially V2 globe aesthetics) — do not ship Meridian placeholder content into ITI.

---

## 1. Project location & run

| Item | Value |
|------|--------|
| Project folder | `C:\Users\Lenovo\Downloads\landingMaP` (intended rename: `ITI_Frontend`; package name already `iti_frontend`) |
| Stack | React + Vite + TypeScript + Tailwind v4 + framer-motion + d3 |
| Dev | `npm run dev` |
| Build | `npm run build` |
| Live ITI routes | `/` → `/en`, also `/ar`; legacy `/iti/:lang` redirects |

### Key files

| Path | Role |
|------|------|
| `src/versions/iti/ItiPage.tsx` | Page shell / section order |
| `src/versions/iti/ItiSections.tsx` | Hero, About, Vision, Values, Contact, Footer |
| `src/versions/iti/ItiFootprint.tsx` | **Interactive globe map section** (large) |
| `src/versions/iti/content.ts` | **Single source of truth** for EN/AR copy, markets, assets, sectors |
| `src/versions/iti/ItiNav.tsx` / `ItiLogo.tsx` | Nav + official logo vectors |
| `src/index.css` | ITI design tokens + map/globe CSS |
| `public/iti/photos/` | Current production photos |
| `public/iti/logos/` | Current logos (partial) |
| `Neusoft - ITI Website/` | **New client asset dump** (photos, logos, Word) |
| `src/versions/v2/V2Globe.tsx` | Visual/technical **reference** for cinematic globe feel (Three.js) — do not paste as-is |

---

## 2. What was already done (context)

### Globe (Footprint)
- Flat Mercator map was replaced with **SVG orthographic globe** (`d3.geoOrthographic`) inside the **same Footprint UX**:
  - hover market → click zoom → plant pins → asset cards → sector filter → EN/AR
  - side panels kept
  - drag-to-rotate, intro turn, soft auto-rotate, limb fading for back-facing markers
  - lighting stack started: ocean gradient, specular, terminator, atmosphere glow, cast shadow, vignette
  - arcs HQ→markets with copper glow; pins polished
  - photos on country fill only after market **focus** (overview should look complete without sparse photo fills)

### Naming
- `package.json` / lockfile renamed to `iti_frontend`
- Folder rename to `ITI_Frontend` may still be blocked if Cursor has the folder open

### Explicit product decision
User wanted: **same ITI map approach, but as a 3D globe** — **not** gluing V2 globe beside the flat map, **not** a separate mode toggle.  
Later: visual polish + use Neusoft assets + enhance whole landing.

---

## 3. Current landing structure (do not discard)

```
ItiNav
ItiHero
ItiAbout (+ stats)
ItiVision / Mission
ItiValues (6 values)
ItiFootprint  ← interactive globe + markets/assets
ItiContact
ItiFooter
```

All marketing copy, markets, and plant assets live in `content.ts` (`COPY`, `MARKETS`, `ASSETS`, `SECTORS`, bilingual `L = { en, ar }`).

### Footprint data model (important)
- **Markets:** `egypt | usa | europe | saudi`
  - `depth: 'plants'` → zoom shows pins (egypt, usa)
  - `depth: 'overview'` → overview card only (europe, saudi today)
- **Assets:** plants/terminals tied to egypt/usa (Amreyah, Cimpor, Ventura, European, Royal Elminya, Cleopatra, Cyprometal, BMIC, Sesco Houston, Sesco Tampa)
- Some assets marked `illustrative: true` (placeholder mood photos) — **replace with real Neusoft photos when available** and remove `illustrative` when real.

---

## 4. Neusoft pack — treat as primary content upgrade source

**Path:** `Neusoft - ITI Website/`

### Contents (explore fully)
- Company folders with plant photos + logos:
  - Amreyah Cement
  - BMIC (many aerials — gold)
  - Cleopatra Cement
  - Royal Elminya Cement
  - Sesco Cement (Houston + Tampa)
  - Eur. Terminals - Royal Elminya EU (Gdańsk, Ravenna, Benelux) — **critical for Europe**
  - European Co
  - Ventura Cables
  - Cyprometal Industries
- `Group Companies Description.docx` — **official company descriptions** from client

### How to use (mandatory workflow)

1. **Read the Word doc end-to-end** (pandoc or unzip `word/document.xml`). Extract per-company blurbs.
2. **Map each Neusoft company → `ASSETS` / `MARKETS` entry** in `content.ts`.
3. **Curate, don’t dump:** pick 1 hero photo per asset (+ optional 1 market thumbnail). Prefer aerial / clear industrial composition, well-lit, web-croppable 16:9 or 4:3.
4. **Export logos** from PNG where possible; for `.psd` / `.ai` / `.pdf` export clean transparent PNG into `public/iti/logos/`.
5. Copy selected files into `public/iti/photos/` and `public/iti/logos/` with **stable kebab-case names**.
6. Update `content.ts` paths; tighten `about` / market `summary` / `headline` / Europe `points` from Word — keep bilingual (translate carefully to Arabic if Word is EN-only; do not leave Arabic stale).
7. Remove or reduce `illustrative: true` once real photography is wired.
8. Do **not** commit the entire raw Neusoft dump as production runtime dependency; curated `public/iti/**` is what the site loads. Keep Neusoft as source library (or document which files were chosen).

### High-value mappings

| Neusoft | Landing use |
|---------|-------------|
| Sesco Houston/Tampa photos | Asset cards + USA market thumbnail / zoom fill |
| BMIC / Cleopatra / Amreyah / Royal photos | Egypt asset cards + stronger Egypt market imagery |
| EU terminals (PL/IT/NL) | Europe overview card + market photo; consider enriching Europe content |
| Logos (Amreyah, BMIC, Sesco, Royal, …) | AssetCard logo slot (today many fall back to monogram) |
| Word descriptions | Replace/improve `ASSETS[].about` and market summaries |

**Gaps to note:** Cimpor / Saudi may have little or nothing in Neusoft — keep existing assets or mark as still needing client media.

---

## 5. Map / globe enhancement goals

Keep the **same interaction model**. Improve presence:

### Visual
- Push lighting contrast further if still “pale disc”
- Stronger but brand-safe atmosphere / specular / terminator
- Arc network more alive on hover (already started)
- Pins/labels readability on both overview and zoom
- When zoomed (`plants` mode), flat-readable surface is OK; overview must feel spherical
- Mobile: drag vs scroll, bottom sheets, performance

### Content on map
- Real photos in cards and focused country fills
- Logos on cards
- Europe should stop feeling empty/illustrative if EU terminal photos exist
- Optional later: Europe plant-level pins if content supports it — only if Word + photos justify; don’t invent sites

### Reference (steal feeling, not brand)
- Soft lit SVG globe techniques (ocean/spec/term layers)
- V2’s network energy (arcs, pulse) adapted to ITI navy/copper light UI
- Avoid Stripe-dark particle Earth unless user later asks for dark theme

---

## 6. Full landing enhancement (upper sections) — explore then improve

User wants suggestions **and implementation** grounded in **existing content**, not a new narrative.

### Explore first
- Read `ItiSections.tsx`, `content.ts`, `index.css` ITI tokens, current `public/iti/photos` usage (hero, vision, values, contact).
- Identify weak spots: hierarchy, whitespace, image quality, motion, RTL, mobile, section rhythm into Footprint.

### Enhancement directions (prioritize)
1. **Hero** — stronger first viewport: typography scale, photo treatment, CTA clarity, maybe subtle motion; brand first (ITI), don’t overpower with secondary clutter.
2. **About + stats** — clearer scan path; stats more premium; optional supporting imagery from curated industrial photos if on-brand.
3. **Vision / Mission** — more intentional composition (not two flat text blocks if layout can improve).
4. **Values** — six principles: better visual system; value images already exist under `value-*.jpg` — ensure they’re used well; don’t emoji-fy.
5. **Contact / Footer** — polish trust + clarity.
6. **Cross-page cohesion** — same navy/copper/mist language; Footprint should feel like climax, not a different website.
7. **EN/AR** — every new string bilingual; RTL unbroken.

### Constraints
- Preserve official ITI logo treatment in `ItiLogo.tsx` / brand guidelines already coded.
- Don’t add fake metrics or companies.
- Don’t rebuild as a dashboard.
- Prefer refining existing sections over adding many new sections.
- If you propose a new section, it must be justified by Word/assets (e.g. “Group companies” strip) and kept lean.

---

## 7. Execution plan (do this order)

### Phase A — Discover (short)
1. Run the app; click through `/en` and `/ar`, especially Footprint.
2. Inventory Neusoft folders vs `ASSETS`/`MARKETS`.
3. Extract Word descriptions into a working checklist (company → proposed about text).

### Phase B — Content wiring
1. Curate + copy photos/logos into `public/iti/...`
2. Update `content.ts` (photos, logos, about, market copy, illustrative flags)
3. Verify cards, tooltips, market list thumbnails, Europe overview

### Phase C — Globe visual polish
1. Iterate lighting / arcs / pins / overview completeness
2. Fix any regressions (drag, zoom, Escape, sector filter, RTL)

### Phase D — Upper landing polish
1. Hero → About → Vision → Values → Contact visual/UX pass
2. Motion: intentional 2–3 beats, respect `prefers-reduced-motion`
3. Mobile pass

### Phase E — Verify
1. `npm run build` must pass
2. Spot-check EN + AR
3. Summarize what changed + which Neusoft files were used

---

## 8. Brand tokens (already in CSS)

Use existing ITI variables — extend carefully if needed:

- `--iti-navy: #053552`
- `--iti-steel: #215c7e`
- `--iti-copper: #a9613a`
- `--iti-mist` / line colors
- Fonts: Schibsted Grotesk (head), Figtree (body), IBM Plex Sans Arabic (RTL)

Light premium industrial — **not** purple SaaS, not cream terracotta, not broadsheet.

---

## 9. Out of scope / don’t do

- Don’t replace Footprint with raw Three.js V2Globe unless lighting polish on SVG is exhausted and you can preserve full ITI UX + bilingual cards.
- Don’t merge concept lab Meridian content into ITI.
- Don’t delete Neusoft source until curated copies are safely in `public/iti` (you may leave the dump in place).
- Don’t rename the whole repo/folder mid-task unless asked.
- Don’t touch MedTech.Solution backend work — wrong repo context.

---

## 10. Success criteria

- Footprint globe feels premium and on-brand (sphere lighting + network, not a flat grey disc).
- Plant/market cards show **real** Neusoft photography where available; logos where available.
- Copy on cards/markets improved from Word descriptions (EN + AR).
- Upper sections feel tighter and more intentional without changing the business story.
- `/en` + `/ar` work; production build passes.

---

## 11. Start command for you (Claude)

1. Read this handoff.  
2. Explore `src/versions/iti/*`, `public/iti/**`, `Neusoft - ITI Website/**`.  
3. Extract Word content.  
4. Implement Phases B→E.  
5. End with a concise changelog + asset mapping table (Neusoft file → public path → content.ts field).

**User language:** Arabic preferred in communication; code/UI strings follow existing EN/AR pattern in `content.ts`.
