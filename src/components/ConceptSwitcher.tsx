import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/v1', label: 'V1' },
  { to: '/v2', label: 'V2' },
  { to: '/v5', label: 'V5' },
]

export function ConceptSwitcher() {
  return (
    <nav className="concept-switcher" aria-label="Concept switcher">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) => (isActive ? 'active' : undefined)}
          end={l.to === '/'}
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}
