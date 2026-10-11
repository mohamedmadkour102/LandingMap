import { Reveal } from '../../components/Reveal'

export default function V1Cta() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-[var(--border)] py-28 md:py-36"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 70% 40%, rgba(200,224,106,0.12), transparent 55%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1600px] px-6 text-center md:px-10 lg:px-14">
        <Reveal>
          <p className="mb-6 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-[var(--brand)]">
            Begin a conversation
          </p>
          <h2 className="mx-auto max-w-4xl font-[family-name:var(--font-display)] text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-[1.02] tracking-[-0.02em] text-[var(--text)]">
            Ready to build
            <br />
            across borders?
          </h2>
          <p className="mx-auto mt-8 max-w-md text-base leading-relaxed text-[var(--text-muted)]">
            Partnerships, commissions and investment enquiries — our Cairo
            headquarters connects every Meridian company.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:hello@meridiangroup.example"
              className="inline-flex border border-[var(--brand)] bg-[var(--brand)] px-8 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#0b1a14] transition hover:bg-transparent hover:text-[var(--brand)]"
            >
              Contact Meridian
            </a>
            <a
              href="#presence"
              className="inline-flex border border-[var(--border)] px-8 py-4 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[var(--text)] transition hover:border-[var(--text)]"
            >
              View Presence
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
