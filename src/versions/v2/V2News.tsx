import { news } from '../../data'
import { Reveal } from '../../components/Reveal'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function V2News() {
  return (
    <section
      id="news"
      className="border-t border-white/10 bg-black px-5 py-24 md:px-10 md:py-32"
      style={{ fontFamily: 'var(--font-geo)' }}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="mb-3 text-[0.6rem] tracking-[0.35em] text-white/35 uppercase">
            Signals
          </p>
          <h2 className="mb-14 text-3xl font-light tracking-wide text-white md:text-4xl">
            News
          </h2>
        </Reveal>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {news.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <article className="grid grid-cols-1 gap-6 py-8 md:grid-cols-[140px_1fr_200px] md:items-center md:gap-10">
                <p className="text-[0.6rem] tracking-[0.2em] text-white/35 uppercase">
                  {formatDate(item.date)}
                </p>
                <div>
                  <p className="mb-2 text-[0.55rem] tracking-[0.22em] text-white/30 uppercase">
                    {item.category}
                  </p>
                  <h3 className="mb-2 text-lg font-light tracking-wide text-white md:text-xl">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-white/45 md:text-sm">
                    {item.excerpt}
                  </p>
                </div>
                <div className="hidden overflow-hidden md:block">
                  <img
                    src={item.image}
                    alt=""
                    className="aspect-[4/3] w-full object-cover opacity-60 grayscale"
                    loading="lazy"
                  />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default V2News
