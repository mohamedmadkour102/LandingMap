import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '../../components/Reveal'

export function V2CTA() {
  return (
    <section
      id="contact"
      className="bg-black px-5 py-28 md:px-10 md:py-36"
      style={{ fontFamily: 'var(--font-geo)' }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <p className="mb-5 text-[0.6rem] tracking-[0.35em] text-white/35 uppercase">
            Connect
          </p>
          <h2 className="mb-6 text-3xl font-light tracking-wide text-white md:text-5xl">
            Partner with a network
            <br className="hidden md:block" />
            built for lasting places.
          </h2>
          <p className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-white/45">
            Whether you are developing, delivering or investing — Meridian
            companies collaborate as one disciplined group.
          </p>
          <a
            href="mailto:hello@meridian.group"
            className="inline-flex items-center gap-3 border border-white/30 px-8 py-4 text-[0.65rem] tracking-[0.28em] text-white uppercase transition hover:bg-white hover:text-black"
          >
            Start a conversation
            <ArrowUpRight size={14} />
          </a>
        </Reveal>
      </div>
    </section>
  )
}

export default V2CTA
