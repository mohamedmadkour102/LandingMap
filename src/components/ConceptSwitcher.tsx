import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const CONCEPT_FONTS =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap'

/** The concept lab's display fonts are only fetched on concept routes (and the admin), never on the ITI page */
function useConceptFonts(on: boolean) {
  useEffect(() => {
    if (!on || document.getElementById('concept-fonts')) return
    const link = document.createElement('link')
    link.id = 'concept-fonts'
    link.rel = 'stylesheet'
    link.href = CONCEPT_FONTS
    document.head.appendChild(link)
  }, [on])
}

const links = [
  { to: '/concepts', label: 'Home', end: true },
  { to: '/v1', label: 'V1' },
  { to: '/v2', label: 'V2' },
  { to: '/v5', label: 'V5' },
]

export function ConceptSwitcher() {
  const { pathname } = useLocation()
  const onConcept = pathname === '/concepts' || pathname === '/v1' || pathname === '/v2' || pathname === '/v5'
  useConceptFonts(onConcept || pathname === '/admin')
  if (!onConcept) return null

  return (
    <nav className="concept-switcher" aria-label="Concept switcher">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) => (isActive ? 'active' : undefined)}
          end={l.end}
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}
