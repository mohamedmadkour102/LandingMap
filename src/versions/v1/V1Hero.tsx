import { motion } from 'framer-motion'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=2000&q=80'

export default function V1Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col justify-end overflow-hidden pb-16 pt-28 md:justify-center md:pb-24 md:pt-24"
    >
      {/* Full-bleed cinematic image with creative crop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0 md:left-[38%] lg:left-[42%]"
          style={{
            clipPath:
              'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 18%)',
          }}
        >
          <img
            src={HERO_IMAGE}
            alt=""
            className="h-full w-full object-cover object-[center_30%] opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/70 to-transparent md:via-[var(--bg)]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-[var(--bg)]/50" />
        </div>
        {/* Soft vignette on left for copy legibility */}
        <div className="absolute inset-y-0 left-0 w-full bg-[radial-gradient(ellipse_at_20%_50%,rgba(11,26,20,0.2)_0%,transparent_55%)] md:w-[55%]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1600px] gap-12 px-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-end md:gap-8 md:px-10 lg:px-14">
        <div className="max-w-xl lg:max-w-2xl">
          <motion.p
            className="mb-6 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-[var(--text-muted)]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            Meridian Group
          </motion.p>

          <motion.h1
            className="font-[family-name:var(--font-display)] text-[clamp(3.25rem,9vw,7.5rem)] font-medium leading-[0.9] tracking-[-0.02em] text-[var(--text)]"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            Built across
            <br />
            <span className="text-[var(--brand)]">borders.</span>
          </motion.h1>

          <motion.p
            className="mt-8 max-w-md text-[0.95rem] leading-relaxed text-[var(--text-muted)] md:text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            A diversified international holding — real estate, construction,
            technology, logistics, energy and hospitality — shaping cities
            across seven countries.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            <a
              href="#companies"
              className="inline-flex items-center border border-[var(--brand)] bg-[var(--brand)] px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#0b1a14] transition hover:bg-transparent hover:text-[var(--brand)]"
            >
              Explore the Group
            </a>
            <a
              href="#presence"
              className="inline-flex items-center border border-[var(--border)] px-7 py-3.5 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[var(--text)] transition hover:border-[var(--text)]"
            >
              Our Presence
            </a>
          </motion.div>
        </div>

        {/* Desktop-only secondary caption aligned to image */}
        <motion.div
          className="hidden justify-self-end self-end pb-4 text-right md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <p className="text-[0.6rem] uppercase tracking-[0.28em] text-[var(--text-muted)]">
            Est. 1998 · Cairo
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-lg italic text-[var(--text)]/70">
            Building across borders.
          </p>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        aria-hidden
      >
        <span className="text-[0.55rem] uppercase tracking-[0.3em] text-[var(--text-muted)]">
          Scroll
        </span>
        <span className="h-10 w-px bg-gradient-to-b from-[var(--text-muted)] to-transparent" />
      </motion.div>
    </section>
  )
}
