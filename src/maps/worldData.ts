import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { FeatureCollection, Feature, Geometry } from 'geojson'
import countriesTopology from 'world-atlas/countries-50m.json'
import landTopology from 'world-atlas/land-110m.json'

/** Meridian focus countries → ISO 3166-1 numeric (Natural Earth / world-atlas) */
export const COUNTRY_ISO: Record<string, string> = {
  egypt: '818',
  'saudi-arabia': '682',
  uae: '784',
  qatar: '634',
  jordan: '400',
  'united-kingdom': '826',
  france: '250',
}

export const ISO_TO_COUNTRY_ID: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_ISO).map(([k, v]) => [v, k]),
)

export type CountryFeature = Feature<Geometry, { name?: string }> & { id?: string | number }

const countriesTopo = countriesTopology as unknown as Topology<{
  countries: GeometryCollection
}>
const landTopo = landTopology as unknown as Topology<{ land: GeometryCollection }>

export const worldCountries = feature(
  countriesTopo,
  countriesTopo.objects.countries,
) as FeatureCollection<Geometry, { name?: string }>

export const worldLand = feature(
  landTopo,
  landTopo.objects.land,
) as FeatureCollection

export function getCountryFeature(countryId: string): CountryFeature | undefined {
  const iso = COUNTRY_ISO[countryId]
  if (!iso) return undefined
  return worldCountries.features.find(
    (f) => String(f.id) === iso,
  ) as CountryFeature | undefined
}

export function isFocusCountry(featureId: string | number | undefined) {
  return featureId != null && ISO_TO_COUNTRY_ID[String(featureId)] != null
}

export function countryIdFromIso(iso: string | number | undefined) {
  if (iso == null) return null
  return ISO_TO_COUNTRY_ID[String(iso)] ?? null
}
