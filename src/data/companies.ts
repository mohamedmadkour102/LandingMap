import type { Company } from './types'

export const companies: Company[] = [
  {
    id: 'atrium-developments',
    name: 'Atrium Developments',
    shortName: 'Atrium',
    industry: 'Real Estate & Development',
    description:
      'Master-planned communities, mixed-use destinations and landmark residential towers across the Middle East and North Africa.',
    founded: 2001,
    locations: ['cairo', 'new-capital', 'riyadh', 'dubai', 'jeddah'],
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
    employees: 680,
    projects: 28,
    countries: 3,
    tagline: 'Places that endure.',
  },
  {
    id: 'forge-construction',
    name: 'Forge Construction',
    shortName: 'Forge',
    industry: 'Construction',
    description:
      'Complex infrastructure, commercial shells and precision delivery for government and private sector clients.',
    founded: 1999,
    locations: ['cairo', 'alexandria', 'riyadh', 'doha', 'amman'],
    image:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80',
    employees: 1420,
    projects: 45,
    countries: 4,
    tagline: 'Built with precision.',
  },
  {
    id: 'vertex-systems',
    name: 'Vertex Systems',
    shortName: 'Vertex',
    industry: 'Technology',
    description:
      'Enterprise platforms, smart-building intelligence and digital infrastructure for modern cities.',
    founded: 2012,
    locations: ['cairo', 'dubai', 'london', 'paris'],
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
    employees: 540,
    projects: 18,
    countries: 4,
    tagline: 'Intelligence at scale.',
  },
  {
    id: 'axis-logistics',
    name: 'Axis Logistics',
    shortName: 'Axis',
    industry: 'Logistics',
    description:
      'Regional freight corridors, bonded warehousing and last-mile networks connecting MENA trade routes.',
    founded: 2005,
    locations: ['alexandria', 'jeddah', 'dubai', 'doha'],
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80',
    employees: 890,
    projects: 12,
    countries: 3,
    tagline: 'Movement without friction.',
  },
  {
    id: 'solara-energy',
    name: 'Solara Energy',
    shortName: 'Solara',
    industry: 'Energy',
    description:
      'Utility-scale solar, hybrid grids and energy performance partnerships for commercial estates.',
    founded: 2010,
    locations: ['cairo', 'riyadh', 'abu-dhabi', 'amman'],
    image:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80',
    employees: 410,
    projects: 22,
    countries: 3,
    tagline: 'Power for the long view.',
  },
  {
    id: 'maison-hospitality',
    name: 'Maison Hospitality',
    shortName: 'Maison',
    industry: 'Hospitality',
    description:
      'Distinctive hotels, residences and culinary destinations calibrated for international travellers.',
    founded: 2008,
    locations: ['cairo', 'dubai', 'london', 'paris', 'doha'],
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    employees: 960,
    projects: 15,
    countries: 4,
    tagline: 'Hospitality as craft.',
  },
]

export const getCompany = (id: string) => companies.find((c) => c.id === id)
