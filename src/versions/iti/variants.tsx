import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

/* ------------------------------------------------------------------ */
/* Section versions for review. The page stays one page; a section     */
/* can be swapped through the address:                                 */
/*   /en?purpose=12&contact=6                                          */
/* No parameter = version 1, the current design. Add ?review to show   */
/* the switcher, so a link can be shared with the right versions set.  */
/*                                                                     */
/* Version numbers are stable. When a version is dropped its number is */
/* retired, never reused — "version 5" means the same design in every  */
/* round of feedback. Retired so far: Vision & Mission 3, 6, 7, 8, 9.  */
/* ------------------------------------------------------------------ */

export const VARIANTS = {
  purpose: {
    title: 'Vision & Mission',
    anchor: 'vision',
    options: [
      { id: 1, label: 'Ground to horizon' },
      { id: 2, label: 'Manifesto' },
      { id: 4, label: 'The ITI arrow' },
      { id: 5, label: 'Corporate' },
      { id: 10, label: 'Compass' },
      { id: 11, label: 'Duet' },
      { id: 12, label: 'Editorial' },
      { id: 13, label: 'Light' },
      { id: 14, label: 'Plant & port' },
      { id: 15, label: 'From Production to Global Reach' },
      { id: 16, label: 'Industrial Precision & Connectivity' },
      { id: 17, label: 'One Continuous Industrial Story' },
    ],
  },
  /** Vision & Mission version 2 only: the ground the statements stand on */
  ground: {
    title: 'V&M 2 ground',
    anchor: 'vision',
    onlyWith: { key: 'purpose', id: 2 },
    options: [
      { id: 1, label: 'Mist Grey' },
      { id: 2, label: 'Night' },
    ],
  },
  /** Vision & Mission version 2 only: which pair of plants stands beside the statements. The pairs differ by ground (see MANIFESTO_SETS) */
  plates: {
    title: 'V&M 2 photos',
    anchor: 'vision',
    onlyWith: { key: 'purpose', id: 2 },
    options: [
      { id: 1, label: 'Pair 1' },
      { id: 2, label: 'Pair 2' },
      { id: 3, label: 'Pair 3' },
      { id: 4, label: 'Pair 4' },
      { id: 5, label: 'Pair 5' },
      { id: 6, label: 'Pair 6' },
    ],
  },
  contact: {
    title: 'Contact',
    anchor: 'contact',
    options: [
      { id: 1, label: 'Routes + drawer' },
      { id: 2, label: 'Statement + drawer' },
      { id: 3, label: 'Inline reveal' },
      { id: 4, label: 'Navy band + modal' },
      { id: 5, label: 'Invitation' },
      { id: 6, label: 'Orbit' },
      { id: 7, label: 'Headline' },
      { id: 8, label: 'Plate' },
    ],
  },
} as const

export type VariantKey = keyof typeof VARIANTS

/** the version number of a section, read from the address; anything unknown (or retired) falls back to 1 */
export function useVariant(key: VariantKey): number {
  const [params] = useSearchParams()
  const n = Number(params.get(key))
  return VARIANTS[key].options.some((o) => o.id === n) ? n : 1
}

/** A small floating panel to flip between versions; only shown with ?review (or once a version is chosen) */
export function VersionSwitcher() {
  const [params, setParams] = useSearchParams()
  // on a phone the panel would sit on top of the page it is there to review, so it starts folded into one small button
  const [folded, setFolded] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches)
  const on = params.has('review') || (Object.keys(VARIANTS) as VariantKey[]).some((k) => params.has(k))
  if (!on) return null

  const pick = (key: VariantKey, n: number) => {
    const next = new URLSearchParams(params)
    next.set('review', '')
    if (n === 1) next.delete(key)
    else next.set(key, String(n))
    setParams(next, { replace: true, preventScrollReset: true })
  }

  return (
    <div className={`iti-versions ${folded ? 'is-folded' : ''}`} dir="ltr" role="region" aria-label="Section versions">
      <button type="button" className="iti-versions-fold" aria-expanded={!folded} onClick={() => setFolded((f) => !f)}>
        {folded ? 'Versions' : 'Hide'}
      </button>
      {(Object.keys(VARIANTS) as VariantKey[]).map((key) => {
        const group = VARIANTS[key]
        // a group that belongs to one version of another section only shows while that version is up
        const dep = 'onlyWith' in group ? group.onlyWith : null
        if (dep && Number(params.get(dep.key)) !== dep.id) return null
        const asked = Number(params.get(key))
        const current = group.options.some((o) => o.id === asked) ? asked : 1
        return (
          <div key={key} className="iti-versions-row">
            <span className="iti-versions-title">{group.title}</span>
            <div className="flex gap-1">
              {group.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  title={o.label}
                  aria-label={`${group.title} ${o.id}: ${o.label}`}
                  aria-pressed={current === o.id}
                  onClick={() => {
                    pick(key, o.id)
                    document.getElementById(group.anchor)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className={`iti-versions-btn ${current === o.id ? 'is-on' : ''}`}
                >
                  {o.id}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
