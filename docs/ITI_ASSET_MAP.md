# ITI landing — enhancement pass (16 Nov 2026)

What changed, which client files the site now uses, and what still needs the client.

---

## 1. Changelog

### Global footprint (the globe)
- **"Navy jewel" globe.** Land is drawn as a lit dot-matrix on a canvas (≈7,500 points, shaded by a fixed light; market countries in copper). The ocean is a deep-navy sphere with a rim light, a steel atmosphere, a specular highlight and a night side. It sits in a deep-navy section, so the globe is the brightest object on the page.
- **Network.** Lifted great-circle arcs carry export and distribution lanes from Al Dekheila (Alexandria) to Houston, Tampa, Gdańsk, Ravenna, the Netherlands, Saudi Arabia and South Korea, each with a moving light comet. Every lane comes from the Word profiles. The head-office links from Barcelona are kept as subtle dashed lines.
- **Intro.** The first time the section is seen, the land ripples in outwards from Egypt while the globe turns into place. Markers and lanes appear after that.
- **Zoom.** The dots cross-fade into flat country shapes. The open market shows the real site photo clipped to its borders, in a navy-to-copper-cream duotone, so every client photo reads in one brand key.
- **Europe now goes down to site level**, with pins for Royal Cement EU (Pszczółki), Gdańsk, Ravenna and the Netherlands (Benelux terminal). The UK stays dashed (under construction).
- **Site cards** now show the logo, parent company, the headline from the Word file, a *Company facts* grid, the description, and the official website (only when a real URL exists).
- **Stays inside one viewport on desktop.** The side panels scroll on their own and the globe never moves. On phones, tapping a market scrolls the globe back into view, and the hints say "Tap" instead of "Hover".
- All interactions are kept: hover, zoom, pins, cards, prev/next, sector filter, Esc, drag-to-turn, EN/AR, and reduced motion (no spin, comets or reveal).

### Upper sections
- **Hero:** a real Group plant (Royal El Minya at dusk) with a slow push-in, the title rising word by word, and a photo caption.
- **About:** the Word "About ITI Group" text as lead and body, an aerial of Amreyah, and a full-width stats band.
- **Vision / Mission:** the vision as a large statement and the mission as a secondary row, over BMIC at night.
- **Values:** a sticky photo of the Cleopatra team next to a 2×3 numbered grid with a copper hover rule. The stock mood photos are no longer used.
- **New "Our Businesses" section:** the nine companies in the four groups from the Word file. Each card opens that company's site on the globe.
- **Contact:** a light section with the SESCO Houston silos.
- The navigation and footer gain a "Businesses" link.

### Content (`content.ts`)
- Every company's headline, description and facts come from the Word file, in English and Arabic.
- Where the Word file and the older brief disagreed, the Word file wins:

| Item | Before | Now |
|------|--------|-----|
| Amreyah | operating since 1989 | operating since **1987** |
| Cleopatra | 1994 | **1989** |
| BMIC | "operational since 2007" | **producing since 2012** (founded 2007) |
| Cyprometal investment | $250M | **$200M** |

- **Stats:** "5 continents" (the Word figure; the old "5+" is gone).
- **New entries:** the Europe assets and Royal Cement EU; Royal El Minya's distribution added to Saudi Arabia; SESCO's storage added to the USA.

### Performance
- **Smaller ITI route:** about 165 KB gzip of JS+CSS before the globe (it used to pull an 812 KB world atlas). The globe is its own chunk (114 KB gzip), prefetched when the browser is idle and mounted near the viewport.
- **Globe data is pre-built:** `geo/dots.json` (20 KB gzip) and `geo/regions.topo.json` (68 KB gzip, simplified 1:50m outlines limited to the zoom regions).
- **Responsive images:** AVIF and WebP at 480, 960, 1600 and 2400 px. The hero is preloaded with `fetchpriority=high`.
- **Fonts:** only the ITI families load on `/en` and `/ar`. The concept-lab fonts load on concept routes only.
- **Off-screen work stops:** the idle spin and canvas painting pause when the section is off screen.

### Tooling

| Command | What it does |
|---------|--------------|
| `npm run assets:logos` | Renders the `.ai` / `.pdf` logos to PNG (needs `pip install pymupdf`) |
| `npm run assets` | Builds the curated responsive photos and logos from the raw pack |
| `npm run assets:globe` | Rebuilds the globe data (`--dots` also recomputes the dot matrix, which takes a few minutes) |

`Neusoft - ITI Website/` is git-ignored. It is a source library only.

---

## 2. Asset map — client file → site file → where it is used

| Neusoft file | Public path | Used by |
|---|---|---|
| Royal Elminya Cement/Royal El Minya Plant/WhatsApp … 12.16.59 PM.jpeg | `/iti/img/hero-*` | Hero |
| Royal Elminya Cement/Royal El Minya Plant/WhatsApp … 12.17.39 PM.jpeg | `/iti/img/royal-elminya-*` | `ASSETS.royal-elminya.photo`, `ASSETS.royal-eu.photo` |
| Amreyah Cement/Amreyah Plant/Banner 5.jpg | `/iti/img/amreyah-aerial-*` | About image, `MARKETS.egypt.photo` |
| Amreyah Cement/Amreyah Plant/Banner 1.jpg | `/iti/img/amreyah-*` | `ASSETS.amreyah.photo` |
| BMIC/BMIC Plant Photos/WhatsApp … 10.43.59 AM (1).jpeg | `/iti/img/bmic-*` | `ASSETS.bmic.photo` |
| BMIC/BMIC Plant Photos/WhatsApp … 11.35.32 AM (1).jpeg | `/iti/img/bmic-night-*` | Vision background |
| Cleopatra Cement/Cleopatra Plant/AKM - Celpatra Factory--32.jpg | `/iti/img/cleopatra-*` | `ASSETS.cleopatra.photo` |
| Cleopatra Cement/Cleopatra Plant/AKM - Celopatra factory-0516.jpg | `/iti/img/cleopatra-team-*` | Values photo |
| European Co/WhatsApp … 1.55.51 PM.jpeg | `/iti/img/european-*` | `ASSETS.european.photo` |
| Sesco Cement/Sesco Pics/Houston/20260225_212646000_iOS.jpg | `/iti/img/sesco-houston-*` | `ASSETS.sesco-houston.photo` |
| Sesco Cement/Sesco Pics/Houston/20260225_212906000_iOS.jpg | `/iti/img/market-usa-*` | `MARKETS.usa.photo` |
| Sesco Cement/Sesco Pics/Houston/20260225_214406000_iOS.jpg | `/iti/img/sesco-silos-*` | Contact photo |
| Sesco Cement/Sesco Pics/Tampa/20260507_164532000_iOS.jpg | `/iti/img/sesco-tampa-*` | `ASSETS.sesco-tampa.photo` |
| Eur. Terminals - Royal Elminya EU/Gdańsk Terminal_Poland.jpg | `/iti/img/eu-gdansk-*` | `ASSETS.eu-gdansk.photo` |
| Eur. Terminals - Royal Elminya EU/Ravenna Terminal_ Italy.jpg | `/iti/img/eu-ravenna-*` | `ASSETS.eu-ravenna.photo` |
| Eur. Terminals - Royal Elminya EU/Benelux Terminal_ Netherlands.jpg | `/iti/img/eu-benelux-*` | `ASSETS.eu-benelux.photo`, `MARKETS.europe.photo` |
| Amreyah Cement/Amreyah Logos/main logo.png | `/iti/logos/amreyah.png` | logo |
| BMIC/BMIC Logos/logo - Copy.png | `/iti/logos/bmic.png` | logo |
| Cleopatra Cement/logo 1.pngCleo.ai | `/iti/logos/cleopatra.png` | logo (rendered from .ai) |
| Royal Elminya Cement/Royal Logo/logo- Royal.pdf | `/iti/logos/royal-elminya.png` | logo for Royal, Royal Cement EU and the EU terminals (rendered from .pdf) |
| Sesco Cement/Sesco Cement Logos/images.png | `/iti/logos/sesco.png` | logo |
| European Co/EURO CO.png | `/iti/logos/european.png` | logo |
| Ventura Cables/لل-1-scaled.png | `/iti/logos/ventura.png` | logo (dark version) |
| Cyprometal Industries/Logo.png | `/iti/logos/cyprometal.png` | logo (white-on-black, recoloured to navy) |
| Group Companies Description.docx | — | all company copy in `content.ts` |

**Still illustrative (no client photography):**
- Cimpor
- Ventura Cables
- Cyprometal
- Saudi Arabia

These are marked "Illustrative image" on the site. The old `cimpor.jpg` was actually an Amreyah photo. It has been replaced, so Cimpor no longer shows another company's plant.

---

## 3. Questions for the client

Each item quotes the Word file ("Group Companies Description.docx") exactly.

1. **Cyprometal — location.**
   - Heading: `CYPROMETAL INDUSTRIES – El minya , Egypt`
   - Company Facts: `Location: Cairo, Egypt`
   - Which is the head office and which is the plant? *(The site currently shows El Minya and leaves the location out of the facts.)*
2. **Royal El Minya — plant location.**
   - Royal El Minya profile: `Location: El Minya, Egypt`
   - Royal Cement EU profile: `Manufacturing Base: Samalout, El Minya, Egypt`
   - Samalout is also Cleopatra's address (`Location: Samalout, El Minya, Egypt`).
   - Is Royal's plant in Samalout? *(The site shows "El Minya".)*
3. **Royal El Minya — incomplete sentence.** `Operating since 2010, its manufacturing facility in El Minya, Egypt .` — please send the intended sentence. The facts themselves are consistent: `Established: 2006`, `Production Commencement: 2010`.
4. **SESCO and European Co. share a headline.** Both have `Headline: Connecting Cement to Global Markets`. What is SESCO's own headline? *(The site uses it for both for now.)*
5. **"Five continents".** The About text says `operations across five continents`, but the places named in the file cover four: Africa, North America, Europe and Asia. What is the fifth?
6. **Ventura Cables** has no *Company Facts* block (no establishment year, capacity or workforce).
7. **Cimpor Cement Egypt and the Saudi Arabia grinding plants** are on the current site (from the brief) but not in the Word file. Are both still part of the Group, and is there photography?
8. **"Our Businesses"** has a heading in the Word file but no text. The site builds it from the four sector groups. Is there an intro paragraph?
9. **Project dates from the brief have passed.**
   - Ventura: "Completion Q3 2026"
   - Tampa: "Operational mid-year"
   - Please confirm the current status.
10. **Benelux terminal.** The photo file name says only "Netherlands". Which city or port? *(The pin is placed in the Rotterdam area and labelled "Netherlands".)*
11. **Official URLs.** Cimpor and European Co. have no website in the Word file, so their cards hide the "Visit website" link.
12. **Arabic copy** is a first translation and needs a review by the ITI team.

---

## 4. Round 2 — craft pass (16 Nov 2026)

**Direction: "day to night".** The page starts in daylight and moves into night:
1. Light sections: About and Values.
2. A night-blue stats band that leads into Vision.
3. A dusk gradient out of Our Businesses into the globe.
4. A planet-horizon finale.

**Motion toolkit** (`src/versions/iti/fx.tsx`), reused across sections. Every piece is static when reduced motion is on.

| Piece | What it does |
|-------|--------------|
| `SplitReveal` | Words rise out of a mask; a headline's closing words get a copper-to-champagne gradient. |
| `ScrollWords` | A paragraph lights up word by word as you read it. |
| `MaskReveal` | Shutter-opening images with an inner parallax drift. |
| `Parallax` | A layer that drifts at its own speed as you scroll. |
| `Magnetic` | A button that leans gently toward the cursor (fine pointers only). |
| `spotlight` | A soft light that follows the cursor across cards. |

**Hero**
- The photo sinks more slowly than the page as you scroll, and the copy lifts and fades.
- The brand outline draws itself in and drifts slightly against the mouse.
- A dusk glow sits behind the plant, and a copper filament runs along the base on load.

**About** — an editorial composition:
- The aerial of Amreyah plus a BMIC dusk photo, layered with parallax.
- A glass badge with counts taken straight from the data: 9 companies, 4 regions, 14 sites.
- A giant outlined "50+" and a copper rule drawn down the seam.
- The lead lights up as you read it.
- The stats moved to a night-blue band with glowing numbers.

**Vision**
- The photo drifts with scroll.
- An oversized copper quote mark.
- The mission lights up as you read it.

**Values**
- The photo opens with a mask reveal.
- On hover, each row's numeral fills with copper and tilts, and a cursor spotlight follows.

**Businesses**
- Group rules draw themselves in.
- Card hover: a lift, a spotlight, and a pulse ring on the "View on the map" dot.
- The section dissolves into the globe's night.

**Contact finale**
- A dark section with a planet horizon (an SVG with a dot texture) rising under the last words.
- Barcelona is lit at the crown, with lanes and light comets running out to the world.
- Glass tiles with a cursor light.
- The live local time in Barcelona.
- A "Copy email" button with confirmation feedback.
- Magnetic CTAs, and a back-to-top button in the footer.

**Navigation**
- A copper scroll-progress filament.
- A scrollspy indicator that slides between links.
- The bar turns to dark glass over the night sections.

**Buttons** — a gradient copper fill, a light sweep on hover, and an arrow that slides.

**Globe — speed and fluidity**
- Flights are about 40% shorter: 520–1250 ms, down from 800–1900 ms.
- New easing, `cubic-bezier(0.3, 0, 0.12, 1)`: the map answers the click immediately and lands softly.
- A drag now continues with momentum and slows down smoothly.
- Paths use coarser geometry while the camera moves.
- Pins, cards, labels and the leader line respond faster.
- The intro reveal is shorter: 1.7 s, down from 2.2 s.

**Palette** — new tokens:

| Token | Value |
|-------|-------|
| `--iti-ink-deep` | `#01131f` |
| `--iti-night` | `#021a2b` |
| `--iti-ice` | `#cfe3ee` |
| `--iti-champagne` | `#efc9a4` |
| `--iti-grad-copper` | copper-to-champagne gradient |

A film grain is added on the night sections so large gradients don't band.

**Cost:** about 5.6 KB gzip extra on the ITI page. No new dependencies.
