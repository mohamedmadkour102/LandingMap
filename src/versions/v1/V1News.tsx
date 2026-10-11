import { Reveal } from '../../components/Reveal'
import { news } from '../../data'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function V1News() {
  return (
    <section
      id="news"
      className="relative border-t border-[var(--border)] py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 lg:px-14">
        <Reveal>
          <div className="mb-12 flex items-end justify-between gap-6 md:mb-16">
            <div>
              <p className="mb-4 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-[var(--brand)]">
                Journal
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,4vw,3.5rem)] font-medium tracking-[-0.02em]">
                Recent news
              </h2>
            </div>
            <a
              href="#contact"
              className="hidden text-[0.65rem] uppercase tracking-[0.22em] text-[var(--text-muted)] transition hover:text-[var(--brand)] md:inline"
            >
              All stories →
            </a>
          </div>
        </Reveal>

        <ul className="grid gap-0 border-t border-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
          {news.map((item, i) => (
            <Reveal key={item.id} delay={0.06 * i}>
              <li className="group h-full border-b border-[var(--border)] sm:border-r sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(4n)]:border-r-0">
                <a
                  href="#contact"
                  className="flex h-full flex-col p-5 transition hover:bg-[var(--surface)]/40 md:p-6"
                >
                  <div className="mb-5 aspect-[16/10] overflow-hidden">
                    <img
                      src={item.image}
                      alt=""
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                  <p className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    <span className="text-[var(--brand)]">{item.category}</span>
                    <span aria-hidden> · </span>
                    {formatDate(item.date)}
                  </p>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-medium leading-snug text-[var(--text)] group-hover:text-[var(--brand)] md:text-[1.35rem]">
                    {item.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--text-muted)]">
                    {item.excerpt}
                  </p>
                </a>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
