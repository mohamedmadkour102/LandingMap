import { group } from '../../data'
import { AnimatedNumber } from '../../components/AnimatedNumber'
import { Reveal } from '../../components/Reveal'

const stats = [
  { label: 'Years of craft', value: group.metrics.years, suffix: '+' },
  { label: 'Countries', value: group.metrics.countries, suffix: '' },
  { label: 'Operating companies', value: group.metrics.companies, suffix: '' },
  { label: 'Professionals', value: group.metrics.employees, suffix: '+' },
  { label: 'Locations', value: group.metrics.locations, suffix: '' },
  { label: 'Projects delivered', value: group.metrics.projects, suffix: '+' },
]

export function V2Stats() {
  return (
    <section
      className="border-y border-white/10 bg-[#050505] px-5 py-20 md:px-10 md:py-24"
      style={{ fontFamily: 'var(--font-geo)' }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.05}>
            <div className="text-center lg:text-left">
              <p className="text-3xl font-light tracking-wide text-white tabular-nums md:text-4xl">
                <AnimatedNumber value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-[0.55rem] tracking-[0.24em] text-white/35 uppercase">
                {s.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export function V2Philosophy() {
  return (
    <section
      className="bg-black px-5 py-24 md:px-10 md:py-32"
      style={{ fontFamily: 'var(--font-geo)' }}
    >
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <p className="mb-6 text-[0.6rem] tracking-[0.35em] text-white/35 uppercase">
            Philosophy
          </p>
          <blockquote className="mb-10 text-2xl leading-snug font-light tracking-wide text-white md:text-3xl lg:text-4xl">
            {group.philosophy}
          </blockquote>
          <p className="max-w-2xl text-sm leading-relaxed text-white/45">
            {group.sustainability}
          </p>
        </Reveal>
      </div>
    </section>
  )
}

export default V2Stats
