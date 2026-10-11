import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

const concepts = [
  {
    id: '01',
    path: '/v1',
    name: 'Editorial Story Atlas',
    description:
      'Veolia-style geography — hover a country and its landscape fills the borders with a Discover Stories badge.',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80',
    accent: '#c8e06a',
    bg: '#0b1a14',
  },
  {
    id: '02',
    path: '/v2',
    name: 'Global 3D Network',
    description:
      'A cinematic dark globe — luminous location points, drag rotation and company-filtered global presence.',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&q=80',
    accent: '#ffffff',
    bg: '#000000',
  },
  {
    id: '05',
    path: '/v5',
    name: 'Cinematic Route Map',
    description:
      'Dark cartography as documentary — glowing amber corridors, glass story panels and geography-as-narrative.',
    image:
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1400&q=80',
    accent: '#e8a54b',
    bg: '#0a0e14',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#f0ece4]">
      <header className="flex items-center justify-between px-6 md:px-12 py-8 border-b border-white/10">
        <div>
          <p className="text-[0.65rem] tracking-[0.35em] uppercase text-white/40 mb-1">
            Concept Exploration
          </p>
          <h1
            className="text-2xl md:text-3xl font-light tracking-wide"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Meridian Group
          </h1>
        </div>
        <p className="hidden md:block text-sm text-white/40 max-w-xs text-right leading-relaxed">
          Three map directions for a premium holding-company presence.
        </p>
      </header>

      <main className="px-6 md:px-12 py-12 md:py-16">
        <div className="mb-12 md:mb-16 max-w-3xl">
          <h2
            className="text-4xl md:text-6xl lg:text-7xl leading-[1.05] mb-6"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Compare three map-led
            <br />
            <em className="text-white/50">corporate worlds.</em>
          </h2>
          <p className="text-white/45 text-base md:text-lg leading-relaxed max-w-xl">
            Each concept reinterprets Meridian’s international footprint —
            editorial atlas, 3D network, and cinematic route map. Choose a
            direction to explore.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
          {concepts.map((c, i) => (
            <motion.article
              key={c.id}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden min-h-[340px] md:min-h-[400px]"
              style={{ background: c.bg }}
            >
              <img
                src={c.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
                loading={i < 2 ? 'eager' : 'lazy'}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(160deg, ${c.bg}ee 10%, ${c.bg}66 55%, ${c.bg}cc 100%)`,
                }}
              />

              <div className="relative z-10 flex flex-col justify-between h-full min-h-[340px] md:min-h-[400px] p-7 md:p-10">
                <div className="flex items-start justify-between">
                  <span
                    className="text-xs tracking-[0.3em] font-medium"
                    style={{ color: c.accent }}
                  >
                    {c.id}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: c.accent }}
                    aria-hidden
                  />
                </div>

                <div>
                  <h3
                    className="text-2xl md:text-3xl mb-3 leading-tight"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  >
                    {c.name}
                  </h3>
                  <p className="text-sm md:text-[0.95rem] text-white/55 leading-relaxed mb-8 max-w-md">
                    {c.description}
                  </p>
                  <Link
                    to={c.path}
                    className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase border border-white/25 px-5 py-3 hover:bg-white hover:text-black transition-colors duration-300"
                  >
                    Explore Concept
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </main>

      <footer className="px-6 md:px-12 py-10 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs tracking-wider text-white/30 uppercase">
        <span>Meridian Group — Concept Lab 2026</span>
        <span>Desktop primary · Map experiences prioritised</span>
      </footer>
    </div>
  )
}
