/**
 * "Embedded" plates for Vision & Mission, version 2 (Manifesto).
 *
 *   node scripts/build-embeds.mjs            → writes public/iti/img/<name>-<w>.{avif,webp} and updates the manifest
 *   node scripts/build-embeds.mjs --preview  → also writes scripts/.staged/embed-preview.jpg (every plate on the section's navy)
 *   node scripts/build-embeds.mjs --only=embed-day-2,embed-night-4   → just those
 *
 * The brief: a factory that belongs to the page, not a photograph placed on it. No frame, no rectangle.
 * So each plate is cut out of its sky here, once; the page only fades its outer edges.
 * The photographs keep their own colour — an earlier pass toned them blue, and the client disliked the effect.
 *
 * How a sky is found:
 *   rel   — how much bluer than red a pixel is, relative to its own blue (1 − r/b). A clear sky sits high on this
 *           whatever its brightness; sunlit or lamplit steel sits near or below zero; steel in shade sits in between.
 *   dark  — night plates: a black sky has no colour to go by, so darkness is the key.
 *   flood — pale sky, cloud or glare has no blue left in it; it is found by walking in from the top edge through
 *           everything bright and smooth.
 * Whatever is mistaken for sky simply becomes the page's navy, which is why this is forgiving.
 *
 * Sources are stock plates from Pexels (free licence), never Group sites.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'public/iti/photos')
const OUT = path.join(ROOT, 'public/iti/img')
const MANIFEST = path.join(ROOT, 'src/versions/iti/imageManifest.json')
const WIDTHS = [640, 1100, 1700]

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v))
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/** crop: fractions of the source. rel / dark: [from, to] thresholds. flood: { lum, rel } — bright, not-warm pixels reachable from the top.
 *  erase: [x0, y0, x1, y1] — a wisp of cloud or a plume of steam that touches the plant: whatever is bright (eraseLum) and not warm inside this box goes */
const PLATES = {
  // ---- daylight (beside the Mission)
  // "Industrial Urea Towers Against Blue Sky in Libya" by abdo alshreef, pexels.com/photo/29411309
  'embed-day-1': { src: 'embed-day-1.jpg', crop: [0, 0, 1, 0.97], rel: [0.1, 0.4], islands: true, erase: [0.44, 0.12, 0.58, 0.32] },
  // "Metal Pipes and Reservoirs of a Factory", pexels.com/photo/18468459
  'embed-day-2': { src: 'embed-day-2.jpg', crop: [0, 0, 1, 1], rel: [0.34, 0.52], islands: true },
  // white silo from below, pexels.com/photo/3089681 — the small silo and the cloud behind it are left out
  'embed-day-3': { src: 'embed-day-3.jpg', crop: [0.25, 0.05, 0.69, 0.95], rel: [0.16, 0.34], islands: true },
  // steel plant towers from below, pexels.com/photo/257700
  'embed-day-4': { src: 'embed-day-4.jpg', crop: [0, 0, 1, 1], rel: [0.34, 0.52], islands: true },
  // "Industrial Storage Tanks Against Blue Sky", pexels.com/photo/31403876
  'embed-day-5': { src: 'embed-day-5.jpg', crop: [0, 0, 1, 1], rel: [0.3, 0.48], islands: true },
  // "Industrial Cement Silos Against Blue Sky", pexels.com/photo/35981621 — the rusted frame at the right edge is left out
  'embed-day-6': { src: 'embed-day-6.jpg', crop: [0, 0, 0.93, 1], rel: [0.2, 0.4], islands: true, erase: [0.38, 0.28, 0.6, 0.5] },

  // ---- more daylight, for the Mist Grey stage (a night plate cannot be cut out of a black sky onto a light page)
  // "Industrial Storage Tanks With Blue Sky Background", pexels.com/photo/31587338 — the right-hand group, with its red pipes
  'embed-day-7': { src: 'embed-day-7.jpg', crop: [0.62, 0, 0.38, 0.86], rel: [0.3, 0.48], islands: true },
  // concrete silos from below, pexels.com/photo/2807233
  'embed-day-8': { src: 'embed-day-8.jpg', crop: [0, 0, 1, 1], rel: [0.34, 0.52], islands: true },
  // white tanks and their spiral stairs, pexels.com/photo/4793456
  'embed-day-10': { src: 'embed-day-10.jpg', crop: [0.31, 0, 0.69, 1], rel: [0.14, 0.32], islands: true },
  // the twilight plates again, cut by their blue sky alone (their dark steel stays)
  'embed-dusk-1': { src: 'embed-night-1.jpg', crop: [0, 0, 1, 0.86], rel: [0.4, 0.62], islands: true },
  'embed-dusk-2': { src: 'embed-night-2.jpg', crop: [0, 0, 1, 0.86], rel: [0.38, 0.58], islands: true, erase: [0.08, 0.38, 0.19, 0.66], eraseLum: 0.2 },
  'embed-dusk-3': { src: 'embed-night-3.jpg', crop: [0, 0, 1, 0.8], rel: [0.38, 0.58], islands: true, erase: [0.74, 0.36, 0.826, 0.64], eraseLum: 0.2 },

  // ---- Vision & Mission version 15: the client's own silos photograph, cut from its sky to stand in the navy as architecture
  'embed-silos': { src: 'purpose-silos.webp', crop: [0.4, 0.09, 0.6, 0.91], rel: [0.3, 0.5], islands: true, erase: [0.8, 0.82, 1, 1], eraseLum: 0.3 },

  // ---- night (beside the Vision)
  // "Industrial Cement Plant Illuminated at Night" by Joseph Russo, pexels.com/photo/29590119
  'embed-night-1': { src: 'embed-night-1.jpg', crop: [0, 0, 1, 0.9], rel: [0.4, 0.62], dark: [0.05, 0.2] },
  // "Industrial Refinery at Twilight in Rotterdam", pexels.com/photo/32399141
  'embed-night-2': { src: 'embed-night-2.jpg', crop: [0, 0, 1, 1], rel: [0.38, 0.58], dark: [0.03, 0.1] },
  // "Industrial Facility in Zuid-Holland at Dusk", pexels.com/photo/32399139
  'embed-night-3': { src: 'embed-night-3.jpg', crop: [0, 0, 1, 1], rel: [0.38, 0.58], dark: [0.03, 0.1] },
  // chimney and lit steam, pexels.com/photo/3855962
  'embed-night-4': { src: 'embed-night-4.jpg', crop: [0, 0, 1, 1], dark: [0.07, 0.24] },
  // refinery from the air at night, pexels.com/photo/12641124
  'embed-night-5': { src: 'embed-night-5.jpg', crop: [0, 0, 1, 1], dark: [0.06, 0.22] },
  // plant and its reflection, pexels.com/photo/257703
  'embed-night-6': { src: 'embed-night-6.jpg', crop: [0, 0, 1, 1], dark: [0.06, 0.2] },
}

const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',')

async function build(name, plate) {
  const file = path.join(SRC, plate.src)
  const meta = await sharp(file).metadata()
  const [cl, ct, cw, ch] = plate.crop
  const region = {
    left: Math.round(cl * meta.width),
    top: Math.round(ct * meta.height),
    width: Math.round(cw * meta.width),
    height: Math.round(ch * meta.height),
  }
  const W = Math.min(WIDTHS[WIDTHS.length - 1], region.width)
  const { data, info } = await sharp(file).extract(region).resize({ width: W }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const N = info.width * info.height
  const lumAt = (p) => (0.2126 * data[p * 3] + 0.7152 * data[p * 3 + 1] + 0.0722 * data[p * 3 + 2]) / 255
  const relAt = (p) => (data[p * 3 + 2] > 6 ? 1 - data[p * 3] / data[p * 3 + 2] : 0)

  // walk in from the top edge through everything bright, not warm, and smooth
  const flooded = new Uint8Array(N)
  if (plate.flood) {
    const ok = (p) => lumAt(p) > plate.flood.lum && relAt(p) > plate.flood.rel
    const stack = []
    for (let x = 0; x < info.width; x++) if (ok(x)) (flooded[x] = 1), stack.push(x)
    while (stack.length) {
      const p = stack.pop()
      const x = p % info.width
      const l = lumAt(p)
      for (const q of [p - info.width, p + info.width, x > 0 ? p - 1 : -1, x < info.width - 1 ? p + 1 : -1]) {
        if (q < 0 || q >= N || flooded[q] || !ok(q) || Math.abs(lumAt(q) - l) > (plate.flood.step ?? 0.03)) continue
        flooded[q] = 1
        stack.push(q)
      }
    }
  }

  const out = Buffer.alloc(N * 4)
  for (let p = 0, i = 0, o = 0; p < N; p++, i += 3, o += 4) {
    const lum = lumAt(p)
    const rel = relAt(p)
    const sky = plate.rel ? smooth(plate.rel[0], plate.rel[1], rel) : 0
    const dark = plate.dark ? 1 - smooth(plate.dark[0], plate.dark[1], lum) : 0
    let a = flooded[p] ? 0 : 1 - Math.max(sky, dark)
    if (plate.erase) {
      const x = (p % info.width) / info.width
      const y = Math.floor(p / info.width) / info.height
      if (x > plate.erase[0] && x < plate.erase[2] && y > plate.erase[1] && y < plate.erase[3] && lum > (plate.eraseLum ?? 0.72) && rel > 0.03) a = 0
    }
    out[o] = data[i]
    out[o + 1] = data[i + 1]
    out[o + 2] = data[i + 2]
    out[o + 3] = Math.round(a * 255)
  }
  // soften the key by a hair, then pull it in: the half-sky pixels along every edge go, and no edge is a staircase
  const alpha = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).extractChannel(3).blur(1).raw().toBuffer()
  for (let p = 0, o = 0; p < N; p++, o += 4) {
    const a = smooth(0.3, 0.9, alpha[p] / 255)
    out[o + 3] = Math.round(a * 255)
    // what is left of the edge must not carry the sky's blue with it
    if (a > 0 && a < 0.98 && plate.rel) {
      const cap = Math.max(out[o], out[o + 1]) * 1.04 + 4
      if (out[o + 2] > cap) out[o + 2] = Math.round(cap)
    }
  }
  // islands: a cloud, the moon, a stray patch of haze — anything small that stands apart from the plant goes
  if (plate.islands) {
    const label = new Int32Array(N)
    const areas = [0]
    for (let s0 = 0; s0 < N; s0++) {
      if (label[s0] || out[s0 * 4 + 3] < 90) continue
      const id = areas.length
      let area = 0
      const stack = [s0]
      label[s0] = id
      while (stack.length) {
        const p = stack.pop()
        area++
        const x = p % info.width
        for (const q of [p - info.width, p + info.width, x > 0 ? p - 1 : -1, x < info.width - 1 ? p + 1 : -1]) {
          if (q < 0 || q >= N || label[q] || out[q * 4 + 3] < 90) continue
          label[q] = id
          stack.push(q)
        }
      }
      areas.push(area)
    }
    const keep = N * 0.006
    for (let p = 0; p < N; p++) if (label[p] === 0 ? out[p * 4 + 3] < 90 && false : areas[label[p]] < keep) out[p * 4 + 3] = 0
    // the faint halo left around a removed island goes with it: nothing below the threshold may float alone
    for (let p = 0; p < N; p++) {
      if (label[p] !== 0 || out[p * 4 + 3] === 0) continue
      const x = p % info.width
      let near = false
      for (const q of [p - info.width, p + info.width, x > 0 ? p - 1 : -1, x < info.width - 1 ? p + 1 : -1, p - 2 * info.width, p + 2 * info.width, p - 2, p + 2]) {
        if (q >= 0 && q < N && label[q] !== 0 && areas[label[q]] >= keep) near = true
      }
      if (!near) out[p * 4 + 3] = 0
    }
  }
  const master = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer()

  const widths = WIDTHS.filter((w) => w <= info.width)
  for (const w of widths) {
    await sharp(master).resize({ width: w }).avif({ quality: 55 }).toFile(path.join(OUT, `${name}-${w}.avif`))
    await sharp(master).resize({ width: w }).webp({ quality: 82, alphaQuality: 90 }).toFile(path.join(OUT, `${name}-${w}.webp`))
  }
  console.log(`embed ${name.padEnd(16)} ${widths.join(', ')}  (${info.width}×${info.height})`)
  return { widths, master }
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
const built = {}
for (const [name, plate] of Object.entries(PLATES)) {
  if (only && !only.includes(name)) continue
  built[name] = await build(name, plate)
  manifest[name] = built[name].widths
}
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 0) + '\n')

// each plate's width ÷ height, read back from what is on disk: the page sizes the plant's box to its picture
const aspect = {}
for (const name of Object.keys(PLATES)) {
  const smallest = path.join(OUT, `${name}-${WIDTHS[0]}.webp`)
  if (!fs.existsSync(smallest)) continue
  const m = await sharp(smallest).metadata()
  aspect[name] = Math.round((m.width / m.height) * 1000) / 1000
}
fs.writeFileSync(path.join(ROOT, 'src/versions/iti/embedAspect.json'), JSON.stringify(aspect, null, 0) + '\n')

if (process.argv.includes('--preview')) {
  const staged = path.join(ROOT, 'scripts/.staged')
  fs.mkdirSync(staged, { recursive: true })
  const TW = 640
  const TH = 430
  const cols = 3
  const tiles = []
  let i = 0
  for (const [name, b] of Object.entries(built)) {
    const buf = await sharp(b.master).resize(TW, TH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer()
    const label = Buffer.from(`<svg width="${TW}" height="26"><text x="8" y="19" font-family="Arial" font-size="17" fill="#f0a">${name}</text></svg>`)
    const left = (i % cols) * (TW + 6)
    const top = Math.floor(i / cols) * (TH + 6)
    tiles.push({ input: buf, left, top }, { input: label, left, top })
    i++
  }
  await sharp({ create: { width: cols * (TW + 6), height: Math.ceil(i / cols) * (TH + 6), channels: 3, background: process.argv.find((a) => a.startsWith('--bg='))?.slice(5) ?? '#03243a' } })
    .composite(tiles)
    .jpeg({ quality: 84 })
    .toFile(path.join(staged, 'embed-preview.jpg'))
  console.log('preview → scripts/.staged/embed-preview.jpg')
}
