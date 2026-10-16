import { NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/concepts', label: 'Home', end: true },
  { to: '/v1', label: 'V1' },
  { to: '/v2', label: 'V2' },
  { to: '/v5', label: 'V5' },
]

export function ConceptSwitcher() {
  const { pathname } = useLocation()
  const onConcept = pathname === '/concepts' || pathname === '/v1' || pathname === '/v2' || pathname === '/v5'
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
