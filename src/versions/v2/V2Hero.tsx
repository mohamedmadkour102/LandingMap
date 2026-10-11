import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { V2Nav } from './V2Nav'

const V2Globe = lazy(() =>
  import('./V2Globe').then((m) => ({ default: m.V2Globe })),
)

interface Props {
  selectedCompanyId: string | null
  onSelectLocation?: (id: string | null) => void
}

export function V2Hero({ selectedCompanyId, onSelectLocation }: Props) {
  return (
    <section
      id="top"
      className="relative h-svh min-h-[640px] w-full overflow-hidden bg-black"
      style={{ fontFamily: 'var(--font-geo)' }}
    >
      <V2Nav />

      <div className="absolute inset-0 z-0">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-[0.65rem] tracking-[0.35em] text-white/30 uppercase">
              Initialising network…
            </div>
          }
        >
          <V2Globe
            className="h-full w-full"
            selectedCompanyId={selectedCompanyId}
            onSelectLocation={onSelectLocation}
            autoRotate
            showSelector
          />
        </Suspense>
      </div>

      {/* Edge typography — maximum whitespace around globe */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-[22%] left-5 max-w-[14rem] md:left-10 md:top-[26%] md:max-w-[18rem]"
        >
          <h1 className="text-[1.65rem] leading-[1.15] font-light tracking-[0.04em] text-white md:text-[2.35rem] lg:text-[2.75rem]">
            ONE GROUP.
            <br />
            A WORLD OF
            <br />
            POSSIBILITIES.
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="absolute right-5 bottom-[22%] max-w-[11rem] text-right text-[0.6rem] leading-relaxed tracking-[0.2em] text-white/40 uppercase md:right-10 md:bottom-[24%] md:max-w-[14rem]"
        >
          Drag to orbit · Click a node to explore presence
        </motion.p>

        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
          <span className="text-[0.5rem] tracking-[0.35em] text-white/30 uppercase">
            Scroll
          </span>
          <span className="h-8 w-px bg-gradient-to-b from-white/40 to-transparent" />
        </div>

        {/* Optional floating category markers */}
        <div className="absolute top-[18%] right-[12%] hidden lg:block">
          <span className="text-[0.55rem] tracking-[0.3em] text-white/35 uppercase">
            Network
          </span>
        </div>
        <div className="absolute bottom-[36%] left-[8%] hidden lg:block">
          <span className="text-[0.55rem] tracking-[0.3em] text-white/35 uppercase">
            Presence
          </span>
        </div>
      </div>
    </section>
  )
}

export default V2Hero
