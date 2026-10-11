import { Reveal } from '../../components/Reveal'
import { projects, getCompany, getLocation } from '../../data'

export default function V1Projects() {
  const featured = projects.slice(0, 4)

  return (
    <section
      id="projects"
      className="relative border-t border-[var(--border)] py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 lg:px-14">
        <Reveal>
          <div className="mb-16 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-[var(--brand)]">
                Featured Work
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.4rem,4.5vw,4rem)] font-medium leading-[1.05] tracking-[-0.02em]">
                Projects that
                <br />
                define place.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[var(--text-muted)] md:text-right">
              A selection of current and recent commissions across the Meridian
              network.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-0 md:grid-cols-2">
          {featured.map((project, i) => {
            const company = getCompany(project.companyId)
            const location = getLocation(project.locationId)
            const large = i === 0 || i === 3

            return (
              <Reveal
                key={project.id}
                delay={0.08 * i}
                className={`group relative overflow-hidden border border-[var(--border)] ${
                  large ? 'md:min-h-[420px]' : 'md:min-h-[320px]'
                } ${i % 2 === 1 ? 'md:translate-y-12' : ''}`}
              >
                <article className="relative flex h-full min-h-[280px] flex-col justify-end">
                  <img
                    src={project.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/55 to-transparent" />

                  <div className="relative z-10 p-6 md:p-8 lg:p-10">
                    <div className="mb-3 flex flex-wrap items-center gap-3 text-[0.6rem] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                      <span className="text-[var(--brand)]">{project.category}</span>
                      <span aria-hidden>·</span>
                      <span>{project.year}</span>
                      <span aria-hidden>·</span>
                      <span>{project.status}</span>
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium tracking-[-0.01em] text-[var(--text)] md:text-3xl lg:text-[2.1rem]">
                      {project.name}
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
                      {project.description}
                    </p>
                    <p className="mt-5 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--text)]/70">
                      {company?.shortName}
                      {location ? ` · ${location.city}` : ''}
                    </p>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
