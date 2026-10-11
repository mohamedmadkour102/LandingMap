import { useMemo } from 'react'
import * as d3 from 'd3'
import type { GeoPermissibleObjects } from 'd3-geo'
import { worldCountries, worldLand, isFocusCountry, countryIdFromIso } from './worldData'

export const MAP_W = 900
export const MAP_H = 620

/** Default view: Europe + MENA — where Meridian operates */
export const REGION_EXTENT: [[number, number], [number, number]] = [
  [-12, 12],
  [58, 60],
]

export function useGeoProjection(
  fitFeature?: GeoPermissibleObjects | null,
  padding = 48,
) {
  return useMemo(() => {
    const projection = d3.geoMercator()
    const path = d3.geoPath(projection)

    if (fitFeature) {
      projection.fitExtent(
        [
          [padding, padding],
          [MAP_W - padding, MAP_H - padding],
        ],
        fitFeature,
      )
    } else {
      // Fit to MENA + Europe bbox via a synthetic MultiPoint extent
      const bbox = {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'Polygon' as const,
          coordinates: [
            [
              [REGION_EXTENT[0][0], REGION_EXTENT[0][1]],
              [REGION_EXTENT[1][0], REGION_EXTENT[0][1]],
              [REGION_EXTENT[1][0], REGION_EXTENT[1][1]],
              [REGION_EXTENT[0][0], REGION_EXTENT[1][1]],
              [REGION_EXTENT[0][0], REGION_EXTENT[0][1]],
            ],
          ],
        },
      }
      projection.fitExtent(
        [
          [padding, padding],
          [MAP_W - padding, MAP_H - padding],
        ],
        bbox,
      )
    }

    return { projection, path }
  }, [fitFeature, padding])
}

export function projectLatLng(
  projection: d3.GeoProjection,
  lat: number,
  lng: number,
): [number, number] | null {
  const p = projection([lng, lat])
  if (!p || Number.isNaN(p[0]) || Number.isNaN(p[1])) return null
  return [p[0], p[1]]
}

export { worldCountries, worldLand, isFocusCountry, countryIdFromIso }
