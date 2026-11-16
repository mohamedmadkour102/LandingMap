import type { CSSProperties } from 'react'
import manifest from './imageManifest.json'

/**
 * Curated, responsive images (built by scripts/build-assets.mjs into /public/iti/img).
 * Every key has AVIF + WebP at the widths listed in the manifest.
 */
const SIZES = manifest as Record<string, number[]>

const widthsOf = (key: string) => SIZES[key] ?? []

/** The smallest variant at least `target` px wide (or the largest there is) */
export function photoUrl(key: string, target = 960, ext: 'webp' | 'avif' = 'webp') {
  const ws = widthsOf(key)
  if (ws.length === 0) return `/iti/photos/${key}.jpg`
  const w = ws.find((x) => x >= target) ?? ws[ws.length - 1]
  return `/iti/img/${key}-${w}.${ext}`
}

const srcSet = (key: string, ext: 'webp' | 'avif') =>
  widthsOf(key)
    .map((w) => `/iti/img/${key}-${w}.${ext} ${w}w`)
    .join(', ')

interface PictureProps {
  k: string
  /** `sizes` attribute — how wide the image renders, so the browser fetches the right file */
  sizes: string
  alt?: string
  className?: string
  style?: CSSProperties
  /** Above-the-fold: load eagerly with high priority */
  priority?: boolean
}

export function Picture({ k, sizes, alt = '', className, style, priority = false }: PictureProps) {
  return (
    <picture className="contents">
      <source type="image/avif" srcSet={srcSet(k, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(k, 'webp')} sizes={sizes} />
      <img
        src={photoUrl(k, 960)}
        alt={alt}
        className={className}
        style={style}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        draggable={false}
      />
    </picture>
  )
}
