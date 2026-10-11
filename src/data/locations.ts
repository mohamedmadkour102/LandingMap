import type { Location, CountryPresence } from './types'

export const locations: Location[] = [
  {
    id: 'cairo',
    city: 'Cairo',
    country: 'Egypt',
    countryCode: 'EG',
    region: 'North Africa',
    coordinates: [30.0444, 31.2357],
    role: 'Group Headquarters',
    companies: [
      'atrium-developments',
      'forge-construction',
      'vertex-systems',
      'solara-energy',
      'maison-hospitality',
    ],
    employeeCount: 1200,
    projectCount: 32,
    image:
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1200&q=80',
    description:
      'The operational heart of Meridian — strategy, development and delivery under one skyline.',
  },
  {
    id: 'alexandria',
    city: 'Alexandria',
    country: 'Egypt',
    countryCode: 'EG',
    region: 'North Africa',
    coordinates: [31.2001, 29.9187],
    role: 'Industrial & Logistics Hub',
    companies: ['forge-construction', 'axis-logistics'],
    employeeCount: 380,
    projectCount: 8,
    image:
      'https://images.unsplash.com/photo-1596422846543-75c6fc7107ba?w=1200&q=80',
    description:
      'Mediterranean gateway for construction logistics and regional freight operations.',
  },
  {
    id: 'new-capital',
    city: 'New Administrative Capital',
    country: 'Egypt',
    countryCode: 'EG',
    region: 'North Africa',
    coordinates: [29.9965, 31.7343],
    role: 'Development Frontier',
    companies: ['atrium-developments', 'forge-construction'],
    employeeCount: 270,
    projectCount: 11,
    image:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    description:
      'Landmark mixed-use and civic projects defining Egypt’s next urban chapter.',
  },
  {
    id: 'riyadh',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    region: 'Middle East',
    coordinates: [24.7136, 46.6753],
    role: 'Kingdom Headquarters',
    companies: [
      'atrium-developments',
      'forge-construction',
      'solara-energy',
    ],
    employeeCount: 620,
    projectCount: 19,
    image:
      'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=1200&q=80',
    description:
      'Strategic delivery hub for Vision-aligned real estate and energy programmes.',
  },
  {
    id: 'jeddah',
    city: 'Jeddah',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    region: 'Middle East',
    coordinates: [21.4858, 39.1925],
    role: 'Coastal Operations',
    companies: ['atrium-developments', 'axis-logistics'],
    employeeCount: 210,
    projectCount: 7,
    image:
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=80',
    description:
      'Red Sea corridor for residential development and logistics capacity.',
  },
  {
    id: 'dubai',
    city: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    region: 'Middle East',
    coordinates: [25.2048, 55.2708],
    role: 'Regional Commercial Hub',
    companies: [
      'atrium-developments',
      'vertex-systems',
      'axis-logistics',
      'maison-hospitality',
    ],
    employeeCount: 480,
    projectCount: 16,
    image:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    description:
      'Commercial, technology and hospitality flagship across the Emirates.',
  },
  {
    id: 'abu-dhabi',
    city: 'Abu Dhabi',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    region: 'Middle East',
    coordinates: [24.4539, 54.3773],
    role: 'Energy & Investment',
    companies: ['solara-energy'],
    employeeCount: 95,
    projectCount: 5,
    image:
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=80',
    description:
      'Clean energy partnerships and long-horizon infrastructure investment.',
  },
  {
    id: 'doha',
    city: 'Doha',
    country: 'Qatar',
    countryCode: 'QA',
    region: 'Middle East',
    coordinates: [25.2854, 51.531],
    role: 'Gulf Operations',
    companies: ['forge-construction', 'axis-logistics', 'maison-hospitality'],
    employeeCount: 240,
    projectCount: 9,
    image:
      'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80',
    description:
      'Construction excellence and refined hospitality for a growing capital.',
  },
  {
    id: 'amman',
    city: 'Amman',
    country: 'Jordan',
    countryCode: 'JO',
    region: 'Middle East',
    coordinates: [31.9454, 35.9284],
    role: 'Levant Hub',
    companies: ['forge-construction', 'solara-energy'],
    employeeCount: 145,
    projectCount: 6,
    image:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80',
    description:
      'Regional construction and renewable programmes across the Levant.',
  },
  {
    id: 'london',
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'Europe',
    coordinates: [51.5074, -0.1278],
    role: 'European Headquarters',
    companies: ['vertex-systems', 'maison-hospitality'],
    employeeCount: 320,
    projectCount: 8,
    image:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',
    description:
      'European technology leadership and hospitality brand presence.',
  },
  {
    id: 'paris',
    city: 'Paris',
    country: 'France',
    countryCode: 'FR',
    region: 'Europe',
    coordinates: [48.8566, 2.3522],
    role: 'European Studio',
    companies: ['vertex-systems', 'maison-hospitality'],
    employeeCount: 180,
    projectCount: 5,
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
    description:
      'Design-led technology partnerships and culinary hospitality.',
  },
]

export const countries: CountryPresence[] = [
  {
    id: 'egypt',
    name: 'Egypt',
    code: 'EG',
    region: 'North Africa',
    companies: 5,
    locations: 3,
    employees: 1850,
    projects: 51,
    image:
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1200&q=80',
    description:
      'Home market and group headquarters — the densest concentration of Meridian companies and talent.',
    cities: ['cairo', 'alexandria', 'new-capital'],
  },
  {
    id: 'saudi-arabia',
    name: 'Saudi Arabia',
    code: 'SA',
    region: 'Middle East',
    companies: 4,
    locations: 2,
    employees: 830,
    projects: 26,
    image:
      'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=1200&q=80',
    description:
      'Strategic growth market spanning development, construction and energy.',
    cities: ['riyadh', 'jeddah'],
  },
  {
    id: 'uae',
    name: 'United Arab Emirates',
    code: 'AE',
    region: 'Middle East',
    companies: 5,
    locations: 2,
    employees: 575,
    projects: 21,
    image:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    description:
      'Commercial and technology bridge connecting Meridian to global capital.',
    cities: ['dubai', 'abu-dhabi'],
  },
  {
    id: 'qatar',
    name: 'Qatar',
    code: 'QA',
    region: 'Middle East',
    companies: 3,
    locations: 1,
    employees: 240,
    projects: 9,
    image:
      'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80',
    description:
      'Precision construction and hospitality in one of the Gulf’s most dynamic capitals.',
    cities: ['doha'],
  },
  {
    id: 'jordan',
    name: 'Jordan',
    code: 'JO',
    region: 'Middle East',
    companies: 2,
    locations: 1,
    employees: 145,
    projects: 6,
    image:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80',
    description:
      'Levant operations focused on infrastructure delivery and renewables.',
    cities: ['amman'],
  },
  {
    id: 'united-kingdom',
    name: 'United Kingdom',
    code: 'GB',
    region: 'Europe',
    companies: 2,
    locations: 1,
    employees: 320,
    projects: 8,
    image:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',
    description:
      'European headquarters for technology and hospitality brand stewardship.',
    cities: ['london'],
  },
  {
    id: 'france',
    name: 'France',
    code: 'FR',
    region: 'Europe',
    companies: 2,
    locations: 1,
    employees: 180,
    projects: 5,
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
    description:
      'Design and culinary excellence hub within the European network.',
    cities: ['paris'],
  },
]

export const getLocation = (id: string) => locations.find((l) => l.id === id)
export const getCountry = (id: string) => countries.find((c) => c.id === id)
