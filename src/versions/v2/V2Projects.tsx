import { getCompany, getLocation, projects } from '../../data'
import { Reveal } from '../../components/Reveal'

export function V2Projects() {
  return (
    <section
      id="projects"
      className="bg-black px-5 py-24 md:px-10 md:py-32"
      style={{ fontFamily: 'var(--font-geo)' }}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-[0.6rem] tracking-[0.35em] text-white/35 uppercase">
                Active Signals
              </p>
              <h2 className="text-3xl font-light tracking-wide text-white md:text-4xl">
                Projects
              </h2>
            </div>
            <p className="max-w-xs text-sm text-white/40">
              Selected programmes across the Meridian network.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => {
            const company = getCompany(project.companyId)
            const location = getLocation(project.locationId)
            return (
              <Reveal key={project.id} delay={i * 0.06}>
                <article className="group flex h-full flex-col overflow-hidden border border-white/10 bg-[#050505] transition hover:border-white/25">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={project.image}
                      alt=""
                      className="h-full w-full object-cover opacity-70 grayscale transition duration-700 group-hover:scale-105 group-hover:opacity-90 group-hover:grayscale-0"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 text-[0.55rem] tracking-[0.22em] text-white/70 uppercase">
                      {project.status}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="mb-2 text-[0.55rem] tracking-[0.22em] text-white/35 uppercase">
                      {project.category} · {project.year}
                    </p>
                    <h3 className="mb-2 text-lg font-light tracking-wide text-white">
                      {project.name}
                    </h3>
                    <p className="mb-4 flex-1 text-xs leading-relaxed text-white/45">
                      {project.description}
                    </p>
                    <p className="text-[0.6rem] tracking-[0.16em] text-white/30 uppercase">
                      {company?.shortName} · {location?.city}
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

export default V2Projects
