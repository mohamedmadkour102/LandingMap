import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Reveal } from '../../components/Reveal'
import { companies } from '../../data'

export default function V1Companies() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section
      id="companies"
      className="relative border-t border-[var(--border)] py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 lg:px-14">
        <Reveal>
          <div className="mb-16 flex flex-col gap-6 md:mb-24 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-[var(--brand)]">
                Portfolio
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.4rem,4.5vw,4rem)] font-medium leading-[1.05] tracking-[-0.02em]">
                Six companies.
                <br />
                One holding.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[var(--text-muted)] md:text-right">
              Specialised operators united under Meridian — local expertise,
              global discipline.
            </p>
          </div>
        </Reveal>

        <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {companies.map((company, index) => {
            const isActive = hovered === company.id
            const num = String(index + 1).padStart(2, '0')

            return (
              <li key={company.id}>
                <a
                  href={`#presence`}
                  className="group relative flex flex-col gap-4 py-8 outline-none transition-colors focus-visible:bg-[var(--surface)] md:flex-row md:items-center md:gap-8 md:py-10 lg:gap-12"
                  onMouseEnter={() => setHovered(company.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(company.id)}
                  onBlur={() => setHovered(null)}
                >
                  <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--text-muted)] transition-colors group-hover:text-[var(--brand)] md:w-16">
                    {num}
                  </span>

                  {/* Hover image reveal */}
                  <div className="relative hidden h-24 w-36 shrink-0 overflow-hidden md:block lg:h-28 lg:w-44">
                    <AnimatePresence>
                      {isActive && (
                        <motion.img
                          key={company.id}
                          src={company.image}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                          initial={{ opacity: 0, scale: 1.12, x: -20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        />
                      )}
                    </AnimatePresence>
                    <div
                      className={`absolute inset-0 border transition-colors ${
                        isActive
                          ? 'border-[var(--brand)]/40'
                          : 'border-[var(--border)]'
                      }`}
                      aria-hidden
                    />
                  </div>

                  <div className="min-w-0 flex-1 md:grid md:grid-cols-[1.2fr_1fr_auto] md:items-center md:gap-8">
                    <div>
                      <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium tracking-[-0.01em] text-[var(--text)] transition-colors group-hover:text-[var(--brand)] md:text-3xl lg:text-[2rem]">
                        {company.name}
                      </h3>
                      <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                        {company.industry}
                      </p>
                    </div>

                    <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-muted)] md:mt-0">
                      {company.description}
                    </p>

                    <div className="mt-3 flex items-baseline gap-6 md:mt-0 md:flex-col md:items-end md:gap-1">
                      <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--text)]">
                        {company.countries}
                      </span>
                      <span className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                        {company.countries === 1 ? 'Country' : 'Countries'}
                      </span>
                    </div>
                  </div>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
