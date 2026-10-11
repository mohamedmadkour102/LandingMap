import { lazy, Suspense, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { group } from '../../data'
import { AnimatedNumber } from '../../components/AnimatedNumber'
import { Reveal } from '../../components/Reveal'

const V2Globe = lazy(() =>
  import('./V2Globe').then((m) => ({ default: m.V2Globe })),
)

interface Props {
  selectedCompanyId: string | null
}

const metrics = [
  { label: 'Years', value: group.metrics.years, suffix: '+' },
  { label: 'Countries', value: group.metrics.countries, suffix: '' },
  { label: 'Companies', value: group.metrics.companies, suffix: '' },
  { label: 'People', value: group.metrics.employees, suffix: '+' },
]

export function V2Presence({ selectedCompanyId }: Props) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const globeX = useTransform(scrollYProgress, [0.15, 0.55], ['0%', '-28%'])
  const globeScale = useTransform(scrollYProgress, [0.15, 0.55], [1, 0.78])
  const copyOpacity = useTransform(scrollYProgress, [0.25, 0.5], [0, 1])
  const copyX = useTransform(scrollYProgress, [0.25, 0.5], [40, 0])

  return (
    <section
      id="presence"
      ref={ref}
      className="relative min-h-[160vh] bg-black"
      style={{ fontFamily: 'var(--font-geo)' }}
    >
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <motion.div
          style={{ x: globeX, scale: globeScale }}
          className="absolute inset-y-0 left-0 flex w-full items-center justify-center lg:w-[58%]"
        >
          <Suspense fallback={null}>
            <V2Globe
              className="h-[70vh] w-full max-w-3xl"
              selectedCompanyId={selectedCompanyId}
              autoRotate
              showSelector={false}
              compact
            />
          </Suspense>
        </motion.div>

        <motion.div
          style={{ opacity: copyOpacity, x: copyX }}
          className="relative z-10 ml-auto hidden w-full max-w-md px-10 lg:block xl:max-w-lg xl:pr-16"
        >
          <p className="mb-4 text-[0.6rem] tracking-[0.35em] text-white/35 uppercase">
            The Group
          </p>
          <h2 className="mb-6 text-3xl font-light tracking-wide text-white xl:text-4xl">
            A networked holding
            <br />
            across seven markets.
          </h2>
          <p className="mb-10 text-sm leading-relaxed text-white/50">
            {group.description}
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {metrics.map((m) => (
              <div key={m.label} className="border-t border-white/10 pt-3">
                <p className="text-2xl font-light text-white tabular-nums">
                  <AnimatedNumber value={m.value} suffix={m.suffix} />
                </p>
                <p className="mt-1 text-[0.55rem] tracking-[0.28em] text-white/35 uppercase">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mobile / tablet copy below sticky interaction */}
        <div className="absolute inset-x-0 bottom-8 px-6 lg:hidden">
          <Reveal>
            <p className="mb-2 text-[0.55rem] tracking-[0.3em] text-white/35 uppercase">
              The Group
            </p>
            <h2 className="mb-3 text-2xl font-light text-white">
              Networked across seven markets.
            </h2>
            <p className="text-xs leading-relaxed text-white/45 line-clamp-3">
              {group.description}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default V2Presence
