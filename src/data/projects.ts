import type { Project } from './types'

export const projects: Project[] = [
  {
    id: 'nile-quarter',
    name: 'The Nile Quarter',
    companyId: 'atrium-developments',
    locationId: 'cairo',
    year: 2024,
    category: 'Mixed-Use',
    description:
      'A waterfront district of residences, galleries and civic gardens along the Nile corniche.',
    image:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    status: 'Under Construction',
  },
  {
    id: 'capital-gate',
    name: 'Capital Gate Towers',
    companyId: 'forge-construction',
    locationId: 'new-capital',
    year: 2025,
    category: 'Commercial',
    description:
      'Twin commercial towers anchoring the financial district of Egypt’s new capital.',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
    status: 'Under Construction',
  },
  {
    id: 'riyadh-spine',
    name: 'Riyadh Green Spine',
    companyId: 'atrium-developments',
    locationId: 'riyadh',
    year: 2023,
    category: 'Urban Design',
    description:
      'Linear park and residential enclaves stitching northern Riyadh communities together.',
    image:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    status: 'Completed',
  },
  {
    id: 'dubai-vertex',
    name: 'Vertex DIFC Platform',
    companyId: 'vertex-systems',
    locationId: 'dubai',
    year: 2024,
    category: 'Technology',
    description:
      'Smart-building operating system deployed across a 14-tower financial campus.',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
    status: 'Completed',
  },
  {
    id: 'solara-valley',
    name: 'Solara Valley Array',
    companyId: 'solara-energy',
    locationId: 'riyadh',
    year: 2025,
    category: 'Energy',
    description:
      '180MW utility-scale solar installation powering industrial estates east of Riyadh.',
    image:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80',
    status: 'Under Construction',
  },
  {
    id: 'maison-mayfair',
    name: 'Maison Mayfair',
    companyId: 'maison-hospitality',
    locationId: 'london',
    year: 2023,
    category: 'Hospitality',
    description:
      'A 68-key townhouse hotel reinterpreting London residential hospitality.',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    status: 'Completed',
  },
]
