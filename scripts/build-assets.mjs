/**
 * Curated image pipeline for the ITI landing page.
 *
 *   node scripts/build-assets.mjs
 *
 * Reads the raw client pack ("Neusoft - ITI Website/") and a few legacy files,
 * and writes web-ready, responsive images into public/iti/img and logos into public/iti/logos.
 * The raw pack is a source library only — the site loads nothing from it.
 *
 * Output per photo: <name>-<w>.avif and <name>-<w>.webp for each width in WIDTHS
 * (capped at the source width). The page picks a width through srcset.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PACK = path.join(ROOT, 'Neusoft - ITI Website')
const LEGACY = path.join(ROOT, 'public/iti/photos')
const OUT_IMG = path.join(ROOT, 'public/iti/img')
const OUT_LOGO = path.join(ROOT, 'public/iti/logos')
const STAGED = path.join(ROOT, 'scripts/.staged') // logos rendered from .ai / .pdf (see scripts/README-assets.md)

export const WIDTHS = [480, 960, 1600, 2400]

/** name → source. Keep this table in sync with docs/ITI_ASSET_MAP.md */
const PHOTOS = {
  // Hero + section imagery (real Group sites only)
  hero: `${PACK}/Royal Elminya Cement/Royal El Minya Plant/WhatsApp Image 2026-09-24 at 12.16.59 PM.jpeg`,
  'amreyah-aerial': `${PACK}/Amreyah Cement/Amreyah Plant/Banner 5.jpg`,
  'bmic-night': `${PACK}/BMIC/BMIC Plant Photos/WhatsApp Image 2026-10-11 at 11.35.32 AM (1).jpeg`,
  'cleopatra-team': `${PACK}/Cleopatra Cement/Cleopatra Plant/AKM - Celopatra factory-0516.jpg`,
  'sesco-silos': `${PACK}/Sesco Cement/Sesco Pics/Houston/20260225_214406000_iOS.jpg`,

  // Plant / terminal cards
  amreyah: `${PACK}/Amreyah Cement/Amreyah Plant/Banner 1.jpg`,
  bmic: `${PACK}/BMIC/BMIC Plant Photos/WhatsApp Image 2026-10-11 at 10.43.59 AM (1).jpeg`,
  'royal-elminya': `${PACK}/Royal Elminya Cement/Royal El Minya Plant/WhatsApp Image 2026-09-24 at 12.17.39 PM.jpeg`,
  cleopatra: `${PACK}/Cleopatra Cement/Cleopatra Plant/AKM - Celpatra Factory--32.jpg`,
  european: `${PACK}/European Co/WhatsApp Image 2026-11-08 at 1.55.51 PM.jpeg`,
  'sesco-houston': `${PACK}/Sesco Cement/Sesco Pics/Houston/20260225_212646000_iOS.jpg`,
  'sesco-tampa': `${PACK}/Sesco Cement/Sesco Pics/Tampa/20260507_164532000_iOS.jpg`,
  'eu-gdansk': `${PACK}/Eur. Terminals - Royal Elminya EU/Gdańsk Terminal_Poland.jpg`,
  'eu-ravenna': `${PACK}/Eur. Terminals - Royal Elminya EU/Ravenna Terminal_ Italy.jpg`,
  'eu-benelux': `${PACK}/Eur. Terminals - Royal Elminya EU/Benelux Terminal_ Netherlands.jpg`,

  // Market thumbnails / focused-country fills
  'market-usa': `${PACK}/Sesco Cement/Sesco Pics/Houston/20260225_212906000_iOS.jpg`,

  // Vision & Mission, version 13 — stock plates from Pexels (free licence), not Group sites. Three per statement:
  //   purpose-mission:   "Industrial Structures at a Cement Factory" by Robert So, pexels.com/photo/18468425
  //   purpose-mission-2: "Industrial Production Plant" by mohamed Zekry, pexels.com/photo/10546018
  //   purpose-mission-3: "Industrial Metal Silos Against Blue Sky" by Muharrem Alper, pexels.com/photo/33520444
  //   purpose-vision:    "Industrial Cement Plant Illuminated at Night" by Joseph Russo, pexels.com/photo/29590119
  //   purpose-vision-2:  "Illuminated Industrial Structure at Night" by Andreas Zu, pexels.com/photo/34486235
  //   purpose-vision-3:  illuminated plant with cranes at night, by Hiếu Hoàng, pexels.com/photo/697279
  'purpose-mission': `${LEGACY}/purpose-mission.jpg`,
  'purpose-mission-2': `${LEGACY}/purpose-mission-2.jpg`,
  'purpose-mission-3': `${LEGACY}/purpose-mission-3.jpg`,
  'purpose-vision': `${LEGACY}/purpose-vision.jpg`,
  'purpose-vision-2': `${LEGACY}/purpose-vision-2.jpg`,
  'purpose-vision-3': `${LEGACY}/purpose-vision-3.jpg`,
  // Vision & Mission, version 14 — two images supplied by the client on 2026-11-24 (a plant for the Mission, a port for the Vision)
  'purpose-plant': `${LEGACY}/purpose-plant.webp`,
  'purpose-port': `${LEGACY}/purpose-port.webp`,
  // Vision & Mission, version 15 — supplied by the client on 2026-11-24. The silos are cut out by scripts/build-embeds.mjs (embed-silos)
  'purpose-harbour': `${LEGACY}/purpose-harbour.webp`,
  // Vision & Mission, version 16 — two aerial photographs supplied by the client on 2026-11-25 (a ring of silos, a ship at its berth)
  'purpose-ring': `${LEGACY}/purpose-ring.webp`,
  'purpose-berth': `${LEGACY}/purpose-berth.webp`,
  // Vision & Mission, version 17 — two photographs supplied by the client on 2026-11-25 (a cement plant at dusk, a container port at night)
  'purpose-works': `${LEGACY}/purpose-works.jpg`,
  'purpose-terminal': `${LEGACY}/purpose-terminal.jpg`,

  // Still illustrative — no client photography supplied yet
  cimpor: `${LEGACY}/hero.jpg`,
  ventura: `${LEGACY}/ventura.jpg`,
  cyprometal: `${LEGACY}/cyprometal.jpg`,
  saudi: `${LEGACY}/saudi.jpg`,
}

/** name → { src, trim background?, flatten? } — trimmed, max 240px tall, PNG */
const LOGOS = {
  amreyah: { src: `${PACK}/Amreyah Cement/Amreyah Logos/main logo.png` },
  bmic: { src: `${PACK}/BMIC/BMIC Logos/logo - Copy.png` },
  sesco: { src: `${PACK}/Sesco Cement/Sesco Cement Logos/images.png` },
  european: { src: `${PACK}/European Co/EURO CO.png` },
  ventura: { src: `${PACK}/Ventura Cables/لل-1-scaled.png` },
  cyprometal: { src: `${PACK}/Cyprometal Industries/Logo.png`, recolor: '#053552' },
  'royal-elminya': { src: `${STAGED}/royal.png` },
  cleopatra: { src: `${STAGED}/cleopatra.png` },
}

const fresh = (src, out) => fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs

async function photo(name, src) {
  const meta = await sharp(src).metadata()
  const srcW = meta.orientation && meta.orientation >= 5 ? meta.height : meta.width
  const widths = WIDTHS.filter((w) => w <= srcW * 1.05)
  const top = widths.at(-1) ?? 0
  if (top < WIDTHS[WIDTHS.length - 1] && srcW > top * 1.25) widths.push(Math.round(srcW))
  const made = []
  for (const w of widths) {
    const base = path.join(OUT_IMG, `${name}-${w}`)
    if (fresh(src, `${base}.avif`) && fresh(src, `${base}.webp`)) {
      made.push(w)
      continue
    }
    const pipe = sharp(src, { limitInputPixels: false }).rotate().resize({ width: w, withoutEnlargement: true })
    await pipe.clone().avif({ quality: 52, effort: 5 }).toFile(`${base}.avif`)
    await pipe.clone().webp({ quality: 74, effort: 5 }).toFile(`${base}.webp`)
    made.push(w)
  }
  return made
}

async function logo(name, { src, recolor }) {
  const out = path.join(OUT_LOGO, `${name}.png`)
  let buf
  if (recolor) {
    // white logo on black supplied: its brightness becomes the alpha, painted in a brand colour
    const mask = await sharp(await sharp(src).flatten({ background: '#000' }).greyscale().toBuffer())
      .trim({ background: '#000000', threshold: 40 })
      .resize({ height: 240, withoutEnlargement: true })
      .extractChannel(0)
      .raw()
      .toBuffer({ resolveWithObject: true })
    const { width, height } = mask.info
    buf = await sharp({ create: { width, height, channels: 3, background: recolor } })
      .joinChannel(mask.data, { raw: { width, height, channels: 1 } })
      .png()
      .toBuffer()
  } else {
    buf = await sharp(src).trim({ threshold: 18 }).resize({ height: 240, withoutEnlargement: true }).png().toBuffer()
  }
  await sharp(buf).png({ compressionLevel: 9, palette: true }).toFile(out)
  return out
}

fs.mkdirSync(OUT_IMG, { recursive: true })
fs.mkdirSync(OUT_LOGO, { recursive: true })

const manifest = {}
for (const [name, src] of Object.entries(PHOTOS)) {
  if (!fs.existsSync(src)) {
    console.warn(`! missing source for ${name}: ${src}`)
    continue
  }
  manifest[name] = await photo(name, src)
  console.log(`photo ${name.padEnd(16)} ${manifest[name].join(', ')}`)
}
for (const [name, def] of Object.entries(LOGOS)) {
  if (!fs.existsSync(def.src)) {
    console.warn(`! missing logo source for ${name}: ${def.src}`)
    continue
  }
  await logo(name, def)
  console.log(`logo  ${name}`)
}

fs.writeFileSync(
  path.join(ROOT, 'src/versions/iti/imageManifest.json'),
  JSON.stringify(manifest, null, 0) + '\n',
)
console.log('wrote src/versions/iti/imageManifest.json')
