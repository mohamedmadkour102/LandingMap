import { motion } from 'framer-motion'
import { companies } from '../../data'
import { Reveal } from '../../components/Reveal'

interface Props {
  selectedCompanyId: string | null
  onSelectCompany: (id: string | null) => void
}

export function V2Companies({ selectedCompanyId, onSelectCompany }: Props) {
  return (
    <section
      id="companies"
      className="relative bg-black px-5 py-24 md:px-10 md:py-32"
      style={{ fontFamily: 'var(--font-geo)' }}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-[0.6rem] tracking-[0.35em] text-white/35 uppercase">
                Network Nodes
              </p>
              <h2 className="text-3xl font-light tracking-wide text-white md:text-4xl">
                Companies
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/40">
              Select a node to filter the globe to that company’s footprint.
              {selectedCompanyId ? (
                <button
                  type="button"
                  onClick={() => onSelectCompany(null)}
                  className="ml-2 text-white/70 underline-offset-4 hover:underline"
                >
                  Clear filter
                </button>
              ) : null}
            </p>
          </div>
        </Reveal>

        <div className="relative">
          {/* Network connector lines (decorative) */}
          <svg
            className="pointer-events-none absolute inset-0 hidden h-full w-full opacity-30 md:block"
            aria-hidden
          >
            {companies.slice(0, -1).map((c, i) => {
              const x1 = ((i % 3) * 33 + 16)
              const y1 = Math.floor(i / 3) * 50 + 20
              const x2 = (((i + 1) % 3) * 33 + 16)
              const y2 = Math.floor((i + 1) / 3) * 50 + 20
              return (
                <line
                  key={c.id}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1"
                />
              )
            })}
          </svg>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, i) => {
              const active = selectedCompanyId === company.id
              return (
                <Reveal key={company.id} delay={i * 0.05}>
                  <motion.button
                    type="button"
                    onClick={() => {
                      const next = active ? null : company.id
                      onSelectCompany(next)
                      if (next) {
                        document.getElementById('top')?.scrollIntoView({
                          behavior: 'smooth',
                        })
                      }
                    }}
                    whileHover={{ y: -2 }}
                    className={`group relative w-full border px-5 py-6 text-left transition ${
                      active
                        ? 'border-white/40 bg-white/[0.04]'
                        : 'border-white/10 bg-transparent hover:border-white/25'
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          active ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                      <span className="text-[0.55rem] tracking-[0.25em] text-white/30 uppercase">
                        Est. {company.founded}
                      </span>
                    </div>
                    <h3 className="mb-1 text-lg font-light tracking-wide text-white">
                      {company.name}
                    </h3>
                    <p className="mb-4 text-[0.6rem] tracking-[0.2em] text-white/40 uppercase">
                      {company.industry}
                    </p>
                    <p className="mb-5 text-xs leading-relaxed text-white/45">
                      {company.tagline}
                    </p>
                    <div className="flex gap-6 text-[0.6rem] tracking-[0.16em] text-white/35 uppercase">
                      <span>{company.locations.length} cities</span>
                      <span>{company.employees.toLocaleString()} people</span>
                    </div>
                  </motion.button>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default V2Companies
