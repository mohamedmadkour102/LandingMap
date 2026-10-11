import { Reveal } from '../../components/Reveal'
import { group } from '../../data'

export default function V1Philosophy() {
  return (
    <section
      id="philosophy"
      className="relative overflow-hidden border-t border-[var(--border)] py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto grid max-w-[1600px] gap-16 px-6 md:grid-cols-12 md:gap-10 md:px-10 lg:px-14">
        <Reveal className="md:col-span-5">
          <p className="mb-5 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-[var(--brand)]">
            Philosophy
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.4rem,4.2vw,3.75rem)] font-medium leading-[1.08] tracking-[-0.02em]">
            Enduring value
            <br />
            at the intersection
            <br />
            of place & craft.
          </h2>
        </Reveal>

        <div className="flex flex-col gap-14 md:col-span-6 md:col-start-7">
          <Reveal delay={0.1}>
            <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[var(--text-muted)]">
              Ambition
            </p>
            <p className="mt-4 text-lg leading-[1.7] text-[var(--text)]/90 md:text-xl">
              {group.philosophy}
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="border-t border-[var(--border)] pt-10">
              <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[var(--brand)]">
                Sustainability
              </p>
              <p className="mt-4 text-base leading-[1.75] text-[var(--text-muted)] md:text-lg">
                {group.sustainability}
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Decorative oversized year */}
      <div
        className="pointer-events-none absolute -bottom-8 right-0 select-none font-[family-name:var(--font-display)] text-[clamp(6rem,18vw,14rem)] font-medium leading-none text-[var(--text)]/[0.04]"
        aria-hidden
      >
        {group.founded}
      </div>
    </section>
  )
}
