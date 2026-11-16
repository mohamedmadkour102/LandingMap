/**
 * Bakes the globe's Earth texture — a muted, brand-graded "hybrid realistic" surface.
 *
 *   node scripts/build-earth.mjs
 *
 * Sources (public domain, staged in scripts/.staged/earth — not committed):
 *   blue-marble.jpg     NASA Blue Marble (topo + bathy), 4096×2048 equirectangular
 *   earth-topology.png  NASA SRTM/GTOPO height map, 2048×1024
 * Both mirrored by the three-globe package: cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/
 *
 * Coastlines come from world-atlas land-50m, so land and sea separate cleanly and line up
 * with the SVG country borders drawn over the globe.
 *
 * Grade:
 *   land  — Blue Marble, ~45% desaturated, split-toned (navy shadows, champagne highlights),
 *           with a soft hillshade from the height map; ice and desert highlights compressed
 *   ocean — rebuilt in the brand navy, depth read from the Blue Marble bathymetry
 *
 * Output: public/iti/earth/earth-{4096,2048}.webp
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import * as d3 from 'd3'
import { feature } from 'topojson-client'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'scripts/.staged/earth')
const OUT = path.join(ROOT, 'public/iti/earth')
const W = 4096
const H = 2048

const land = JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules/world-atlas/land-50m.json'), 'utf8'))

/* ---------- land mask: world-atlas polygons rasterised in the same equirectangular frame ---------- */
const proj = d3
  .geoEquirectangular()
  .scale(W / (2 * Math.PI))
  .translate([W / 2, H / 2])
const landPath = d3.geoPath(proj)(feature(land, land.objects.land))
const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#000"/><path d="${landPath}" fill="#fff"/></svg>`
const mask = await sharp(Buffer.from(maskSvg), { limitInputPixels: false })
  .greyscale()
  .blur(0.9) // a feathered coast, about one texel
  .raw()
  .toBuffer()

/* ---------- sources ---------- */
const bm = await sharp(path.join(SRC, 'blue-marble.jpg')).resize(W, H).removeAlpha().raw().toBuffer()
const height = await sharp(path.join(SRC, 'earth-topology.png')).greyscale().resize(W, H, { kernel: 'cubic' }).blur(1.2).raw().toBuffer()

/* ---------- ocean depth range (robust percentiles of the bathymetry luminance) ---------- */
const lumOf = (i) => 0.2126 * bm[i * 3] + 0.7152 * bm[i * 3 + 1] + 0.0722 * bm[i * 3 + 2]
const hist = new Uint32Array(256)
// open water between 60°S and 60°N only — polar ice shelves are not in the land polygons
for (let i = Math.round(H / 6) * W; i < Math.round((H * 5) / 6) * W; i += 7) if (mask[i] < 8) hist[Math.round(lumOf(i))]++
const pct = (q) => {
  const total = hist.reduce((a, b) => a + b, 0)
  let acc = 0
  for (let v = 0; v < 256; v++) if ((acc += hist[v]) >= total * q) return v
  return 255
}
const deepL = pct(0.08)
const shallowL = pct(0.985)
console.log('ocean luminance range', deepL, shallowL)

const mix = (a, b, t) => a + (b - a) * t
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}

// brand-derived palette (linear-ish 0..1)
const DEEP = [0.012, 0.09, 0.15] //   #03182a-ish abyss
const MID = [0.03, 0.17, 0.26] //     #072b42 open ocean
const SHELF = [0.07, 0.235, 0.32] // #123c52 continental shelf
const SHADOW = [0.06, 0.13, 0.17] //  navy shadow tint for land
const LIGHT = [0.93, 0.8, 0.66] //    champagne highlight tint

const out = Buffer.alloc(W * H * 3)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x
    const r = bm[i * 3] / 255
    const g = bm[i * 3 + 1] / 255
    const b = bm[i * 3 + 2] / 255
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b

    /* ----- land ----- */
    // hillshade from the height map, light from the north-west (matches the globe's sun)
    const xl = (x - 1 + W) % W
    const xr = (x + 1) % W
    const yu = Math.max(0, y - 1)
    const yd = Math.min(H - 1, y + 1)
    const dx = (height[y * W + xr] - height[y * W + xl]) / 255
    const dy = (height[yd * W + x] - height[yu * W + x]) / 255
    const shade = 1 + Math.max(-0.22, Math.min(0.18, (-dx * 0.7 - dy * 0.7) * 4.2))

    // compress ice and bright desert so nothing glares next to the copper markers
    const Lc = L > 0.55 ? 0.55 + (L - 0.55) * 0.42 : L
    const k = L > 0 ? Lc / L : 1
    let lr = mix(r * k, Lc, 0.45)
    let lg = mix(g * k, Lc, 0.45)
    let lb = mix(b * k, Lc, 0.45)
    // split tone: navy in the shadows, champagne in the highlights
    const tone = smooth(0.12, 0.6, Lc)
    lr = mix(lr, mix(SHADOW[0], LIGHT[0], tone) * (0.4 + Lc), 0.22)
    lg = mix(lg, mix(SHADOW[1], LIGHT[1], tone) * (0.4 + Lc), 0.22)
    lb = mix(lb, mix(SHADOW[2], LIGHT[2], tone) * (0.4 + Lc), 0.22)
    const dim = 0.82 * shade
    lr *= dim
    lg *= dim
    lb *= dim

    /* ----- ocean ----- */
    const depth = 1 - clamp01((L * 255 - deepL) / Math.max(1, shallowL - deepL))
    const shelf = 0.8 * Math.pow(1 - depth, 2.6)
    const or = mix(mix(MID[0], DEEP[0], smooth(0.35, 1, depth)), SHELF[0], shelf)
    const og = mix(mix(MID[1], DEEP[1], smooth(0.35, 1, depth)), SHELF[1], shelf)
    const ob = mix(mix(MID[2], DEEP[2], smooth(0.35, 1, depth)), SHELF[2], shelf)

    const m = mask[i] / 255
    out[i * 3] = Math.round(clamp01(mix(or, lr, m)) * 255)
    out[i * 3 + 1] = Math.round(clamp01(mix(og, lg, m)) * 255)
    out[i * 3 + 2] = Math.round(clamp01(mix(ob, lb, m)) * 255)
  }
}

fs.mkdirSync(OUT, { recursive: true })
const base = sharp(out, { raw: { width: W, height: H, channels: 3 } })
for (const w of [4096, 2048]) {
  const file = path.join(OUT, `earth-${w}.webp`)
  await base
    .clone()
    .resize(w, w / 2, { kernel: 'lanczos3' })
    .webp({ quality: w === 4096 ? 80 : 82, effort: 6, smartSubsample: true })
    .toFile(file)
  console.log(file, (fs.statSync(file).size / 1024).toFixed(0), 'KB')
}
