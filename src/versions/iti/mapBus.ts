/**
 * Lets other sections ask the (lazy-loaded) globe to open a site.
 * A request made before the globe has mounted is kept and picked up on mount.
 */
const EVENT = 'iti:open-asset'
let pending: string | null = null

export function requestAsset(id: string) {
  pending = id
  document.getElementById('footprint')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.dispatchEvent(new CustomEvent(EVENT, { detail: id }))
}

/** Take (and clear) a request made before the globe mounted */
export function takePendingAsset() {
  const id = pending
  pending = null
  return id
}

export function onAssetRequest(fn: (id: string) => void) {
  const handler = (e: Event) => {
    pending = null
    fn((e as CustomEvent<string>).detail)
  }
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}
