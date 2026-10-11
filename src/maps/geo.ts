/** Simple equirectangular projection helpers for SVG maps */

export function project(
  lat: number,
  lng: number,
  bounds: { minLng: number; maxLng: number; minLat: number; maxLat: number },
  width: number,
  height: number,
  padding = 40,
): [number, number] {
  const x =
    padding +
    ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) *
      (width - padding * 2)
  const y =
    padding +
    ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) *
      (height - padding * 2)
  return [x, y]
}

export const REGION_BOUNDS = {
  minLng: -10,
  maxLng: 60,
  minLat: 12,
  maxLat: 60,
}

/** Approximate country outlines for MENA + Europe focus (simplified polygons) */
export const countryPaths: Record<
  string,
  { d: string; label: [number, number]; viewFocus?: { cx: number; cy: number; scale: number } }
> = {
  egypt: {
    d: 'M 48 62 L 52 58 L 56 60 L 58 68 L 56 78 L 52 82 L 46 80 L 44 72 L 42 66 Z',
    label: [50, 70],
    viewFocus: { cx: 50, cy: 70, scale: 3.2 },
  },
  'saudi-arabia': {
    d: 'M 56 58 L 68 52 L 78 56 L 80 68 L 74 78 L 62 80 L 56 72 L 54 64 Z',
    label: [66, 66],
    viewFocus: { cx: 66, cy: 66, scale: 2.8 },
  },
  uae: {
    d: 'M 76 58 L 82 56 L 84 62 L 80 66 L 76 64 Z',
    label: [80, 60],
    viewFocus: { cx: 80, cy: 61, scale: 5 },
  },
  qatar: {
    d: 'M 72 56 L 75 55 L 76 60 L 73 62 L 71 59 Z',
    label: [73.5, 58],
    viewFocus: { cx: 73.5, cy: 58, scale: 6 },
  },
  jordan: {
    d: 'M 50 54 L 56 52 L 58 58 L 54 62 L 48 60 Z',
    label: [53, 57],
    viewFocus: { cx: 53, cy: 57, scale: 4.5 },
  },
  'united-kingdom': {
    d: 'M 18 28 L 24 24 L 28 28 L 26 38 L 22 42 L 16 38 L 14 32 Z',
    label: [21, 33],
    viewFocus: { cx: 21, cy: 33, scale: 4 },
  },
  france: {
    d: 'M 22 40 L 32 38 L 36 44 L 34 52 L 26 54 L 20 48 Z',
    label: [28, 46],
    viewFocus: { cx: 28, cy: 46, scale: 3.5 },
  },
}

/** Broader landmass silhouettes for atlas aesthetic (viewBox 0 0 100 100) */
export const landmassPaths = {
  northAfrica:
    'M 30 58 L 42 54 L 52 56 L 58 62 L 56 78 L 48 84 L 36 82 L 28 72 L 26 64 Z',
  arabianPeninsula:
    'M 54 54 L 68 48 L 82 52 L 86 64 L 80 78 L 66 82 L 56 74 L 52 62 Z',
  levant: 'M 46 48 L 56 46 L 60 54 L 54 60 L 46 58 Z',
  europeWest:
    'M 14 26 L 28 22 L 38 28 L 36 42 L 28 50 L 18 48 L 12 38 Z',
  europeSouth: 'M 28 48 L 42 46 L 48 52 L 44 60 L 32 58 Z',
}
