import { companies } from '../../data'
import type { Industry } from '../../data/types'
import { Reveal } from '../../components/Reveal'

const industryMeta: Record<
  Industry,
  { label: string; note: string }
> = {
  'Real Estate & Development': {
    label: 'Real Estate',
    note: 'Masterplans and landmark destinations',
  },
  Construction: {
    label: 'Construction',
    note: 'Infrastructure and precision delivery',
  },
  Technology: {
    label: 'Technology',
    note: 'Platforms for intelligent cities',
  },
  Logistics: {
    label: 'Logistics',
    note: 'Corridors connecting MENA trade',
  },
  Energy: {
    label: 'Energy',
    note: 'Utility-scale and hybrid grids',
  },
  Hospitality: {
    label: 'Hospitality',
    note: 'Hotels and residences as craft',
  },
}

export function V2Industries() {
  const industries = Object.keys(industryMeta) as Industry[]

  return (
    <section
      id="industries"
      className="border-t border-white/10 bg-black px-5 py-24 md:px-10 md:py-32"
      style={{ fontFamily: 'var(--font-geo)' }}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="mb-3 text-[0.6rem] tracking-[0.35em] text-white/35 uppercase">
            Spectrum
          </p>
          <h2 className="mb-14 text-3xl font-light tracking-wide text-white md:text-4xl">
            Industries
          </h2>
        </Reveal>

        <ul className="divide-y divide-white/10 border-y border-white/10">
          {industries.map((industry, i) => {
            const meta = industryMeta[industry]
            const count = companies.filter((c) => c.industry === industry).length
            return (
              <Reveal key={industry} delay={i * 0.04}>
                <li className="group flex flex-col gap-2 py-6 md:flex-row md:items-center md:justify-between md:gap-8">
                  <div className="flex items-baseline gap-6">
                    <span className="w-8 text-[0.6rem] tracking-[0.2em] text-white/25 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="text-xl font-light tracking-wide text-white transition group-hover:text-white/80 md:text-2xl">
                        {meta.label}
                      </h3>
                      <p className="mt-1 text-xs text-white/40">{meta.note}</p>
                    </div>
                  </div>
                  <span className="pl-14 text-[0.6rem] tracking-[0.22em] text-white/30 uppercase md:pl-0">
                    {count} {count === 1 ? 'company' : 'companies'}
                  </span>
                </li>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export default V2Industries
