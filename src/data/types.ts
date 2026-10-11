export type Region = 'Middle East' | 'North Africa' | 'Europe'

export type Industry =
  | 'Real Estate & Development'
  | 'Construction'
  | 'Technology'
  | 'Logistics'
  | 'Energy'
  | 'Hospitality'

export interface Location {
  id: string
  city: string
  country: string
  countryCode: string
  region: Region
  coordinates: [number, number] // [lat, lng]
  role: string
  companies: string[]
  employeeCount: number
  projectCount: number
  image: string
  description: string
}

export interface Company {
  id: string
  name: string
  shortName: string
  industry: Industry
  description: string
  founded: number
  locations: string[]
  image: string
  employees: number
  projects: number
  countries: number
  tagline: string
}

export interface Project {
  id: string
  name: string
  companyId: string
  locationId: string
  year: number
  category: string
  description: string
  image: string
  status: 'Completed' | 'Under Construction' | 'Planning'
}

export interface NewsItem {
  id: string
  title: string
  excerpt: string
  date: string
  category: string
  image: string
}

export interface CountryPresence {
  id: string
  name: string
  code: string
  region: Region
  companies: number
  locations: number
  employees: number
  projects: number
  image: string
  description: string
  cities: string[]
}
