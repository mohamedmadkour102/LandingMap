import * as THREE from 'three'
import * as d3 from 'd3'
import { worldLand } from '../../maps/worldData'

/** Convert geographic lat/lng (degrees) to a Vector3 on a sphere. */
export function latLngToVector3(
  lat: number,
  lng: number,
  radius: number,
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

/** Great-arc polyline raised above the surface for network links. */
export function createArcPoints(
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  segments = 48,
  altitude = 0.28,
): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  const startN = start.clone().normalize()
  const endN = end.clone().normalize()

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const mid = new THREE.Vector3().lerpVectors(startN, endN, t).normalize()
    const lift = Math.sin(t * Math.PI) * altitude
    mid.multiplyScalar(radius * (1 + lift))
    points.push(mid)
  }
  return points
}

/**
 * Dense land point-cloud (night-lights aesthetic).
 * Samples real continent masks from world-atlas — no CDN textures.
 */
export function generateNetworkDots(
  count: number,
  radius: number,
  _seed = 42,
): Float32Array {
  const W = 1024
  const H = 512
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)

  const projection = d3
    .geoEquirectangular()
    .translate([W / 2, H / 2])
    .scale(W / (2 * Math.PI))
  const path = d3.geoPath(projection, ctx)

  ctx.beginPath()
  path(worldLand as never)
  ctx.fillStyle = '#fff'
  ctx.fill()

  const { data } = ctx.getImageData(0, 0, W, H)
  const landPixels: Array<[number, number]> = []
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4] > 128) landPixels.push([x, y])
    }
  }

  const positions = new Float32Array(count * 3)
  const n = landPixels.length || 1
  for (let i = 0; i < count; i++) {
    const [px, py] = landPixels[(Math.random() * n) | 0] ?? [W / 2, H / 2]
    const jx = px + (Math.random() - 0.5)
    const jy = py + (Math.random() - 0.5)
    const lng = (jx / W) * 360 - 180
    const lat = 90 - (jy / H) * 180
    const r = radius * (1.001 + Math.random() * 0.006)
    const v = latLngToVector3(lat, lng, r)
    positions[i * 3] = v.x
    positions[i * 3 + 1] = v.y
    positions[i * 3 + 2] = v.z
  }
  return positions
}
