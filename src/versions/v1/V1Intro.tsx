import { Reveal } from '../../components/Reveal'
import { AnimatedNumber } from '../../components/AnimatedNumber'
import { group } from '../../data'

const metrics = [
  { value: group.metrics.years, suffix: '+', label: 'Years' },
  { value: group.metrics.countries, suffix: '', label: 'Countries' },
  { value: group.metrics.companies, suffix: '', label: 'Companies' },
  { value: group.metrics.employees, suffix: '+', label: 'Employees' },
]

export default function V1Intro() {
  return (
    <section
      id="intro"
      className="relative overflow-hidden border-t border-[var(--border)] py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto grid max-w-[1600px] gap-16 px-6 md:grid-cols-12 md:gap-10 md:px-10 lg:px-14">
        <Reveal className="md:col-span-5 lg:col-span-4">
          <p className="mb-5 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-[var(--brand)]">
            The Group
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.4rem,4.5vw,4rem)] font-medium leading-[1.05] tracking-[-0.02em] text-[var(--text)]">
            One standard.
            <br />
            Many frontiers.
          </h2>
        </Reveal>

        <Reveal className="md:col-span-7 md:col-start-6 lg:col-span-6 lg:col-start-7" delay={0.1}>
          <p className="max-w-xl text-base leading-[1.75] text-[var(--text-muted)] md:text-lg">
            {group.description}
          </p>
          <p className="mt-6 max-w-xl text-base leading-[1.75] text-[var(--text)]/80 md:text-lg">
            {group.philosophy}
          </p>
        </Reveal>

        {/* Integrated metrics — not cards */}
        <div className="md:col-span-12 mt-4 md:mt-12">
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 border-t border-[var(--border)] pt-12 md:grid-cols-4 md:gap-x-6 lg:gap-x-12">
            {metrics.map((m, i) => (
              <Reveal key={m.label} delay={0.08 * i}>
                <div className="relative">
                  <p className="font-[family-name:var(--font-display)] text-[clamp(2.75rem,6vw,5.5rem)] font-medium leading-none tracking-[-0.03em] text-[var(--text)]">
                    <AnimatedNumber value={m.value} suffix={m.suffix} />
                  </p>
                  <p className="mt-3 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--text-muted)]">
                    {m.label}
                  </p>
                  {i < metrics.length - 1 && (
                    <span
                      className="absolute -right-4 top-2 hidden h-[70%] w-px bg-[var(--border)] md:block lg:-right-6"
                      aria-hidden
                    />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
