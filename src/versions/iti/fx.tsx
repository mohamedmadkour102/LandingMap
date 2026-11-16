/**
 * ITI motion toolkit — small, reusable pieces of "quiet magic".
 * Everything here degrades to static content under prefers-reduced-motion.
 */
import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from 'framer-motion'

export const EASE_OUT = [0.22, 1, 0.36, 1] as const
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

/* ------------------------------------------------------------------ */
/* SplitReveal — words rise out of a mask, one after another           */
/* ------------------------------------------------------------------ */

const lineParent: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.055 } } }
const lineWord: Variants = {
  hidden: { y: '108%' },
  show: { y: '0%', transition: { duration: 0.95, ease: EASE_OUT } },
}

interface SplitRevealProps {
  text: string
  as?: 'h1' | 'h2' | 'p'
  className?: string
  /** how many words at the end get the copper-champagne gradient */
  emphasis?: number
  delay?: number
  /** animate on mount instead of on scroll (hero) */
  immediate?: boolean
  id?: string
}

export function SplitReveal({ text, as = 'h2', className, emphasis = 0, delay = 0, immediate = false, id }: SplitRevealProps) {
  const reduce = useReducedMotion()
  const words = text.split(' ')
  const Comp = as === 'h1' ? motion.h1 : as === 'p' ? motion.p : motion.h2
  const trigger = immediate ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true, margin: '0px 0px -12% 0px' } }
  return (
    <Comp
      id={id}
      className={className}
      variants={lineParent}
      initial={reduce ? false : 'hidden'}
      {...trigger}
      transition={{ delayChildren: delay }}
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`}>
          <span className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
            <motion.span
              className={`inline-block ${i >= words.length - emphasis ? 'iti-grad-text' : ''}`}
              variants={reduce ? undefined : lineWord}
            >
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Comp>
  )
}

/* ------------------------------------------------------------------ */
/* ScrollWords — a paragraph that "lights up" word by word on scroll   */
/* ------------------------------------------------------------------ */

function LitWord({ word, progress, from, to }: { word: string; progress: MotionValue<number>; from: number; to: number }) {
  const opacity = useTransform(progress, [from, to], [0.16, 1])
  return (
    <>
      <motion.span style={{ opacity }}>{word}</motion.span>{' '}
    </>
  )
}

export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement | null>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.88', 'end 0.5'] })
  if (reduce) return <p className={className}>{text}</p>
  const words = text.split(' ')
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <LitWord key={`${w}-${i}`} word={w} progress={scrollYProgress} from={i / words.length} to={(i + 1.6) / words.length} />
      ))}
    </p>
  )
}

/* ------------------------------------------------------------------ */
/* MaskReveal — an image that opens like a shutter, then drifts        */
/* ------------------------------------------------------------------ */

interface MaskRevealProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** px of parallax travel for the inner layer (0 to disable) */
  drift?: number
  /** direction the shutter opens from */
  from?: 'bottom' | 'top' | 'start'
  radius?: number
  delay?: number
}

export function MaskReveal({ children, className, style, drift = 60, from = 'bottom', radius = 28, delay = 0 }: MaskRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-drift, drift])
  const closed =
    from === 'top'
      ? `inset(0% 0% 100% 0% round ${radius}px)`
      : from === 'start'
        ? `inset(0% 100% 0% 0% round ${radius}px)`
        : `inset(100% 0% 0% 0% round ${radius}px)`
  return (
    <motion.div
      ref={ref}
      className={`${/\b(absolute|fixed)\b/.test(className ?? '') ? '' : 'relative '}overflow-hidden ${className ?? ''}`}
      style={{ borderRadius: radius, ...style }}
      initial={reduce ? false : { clipPath: closed }}
      whileInView={{ clipPath: `inset(0% 0% 0% 0% round ${radius}px)` }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.25, ease: EASE_IN_OUT, delay }}
    >
      <motion.div
        className="absolute -inset-y-[12%] inset-x-0"
        style={reduce || drift === 0 ? undefined : { y }}
        initial={reduce ? false : { scale: 1.18 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: EASE_OUT, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Parallax — any layer drifting with scroll                           */
/* ------------------------------------------------------------------ */

export function Parallax({ children, className, distance = 80, style }: { children?: ReactNode; className?: string; distance?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])
  return (
    <motion.div ref={ref} className={className} style={reduce ? style : { ...style, y }}>
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Magnetic — a control that leans gently towards the cursor           */
/* ------------------------------------------------------------------ */

const finePointer = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

export function Magnetic({ children, strength = 0.28, className }: { children: ReactNode; strength?: number; className?: string }) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.6 })
  const on = !reduce && finePointer()
  return (
    <motion.span
      className={`inline-flex ${className ?? ''}`}
      style={on ? { x: sx, y: sy } : undefined}
      onPointerMove={(e) => {
        if (!on) return
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}

/* ------------------------------------------------------------------ */
/* Spotlight — a soft light that follows the cursor across a surface   */
/* (pairs with the .iti-spot CSS class)                                */
/* ------------------------------------------------------------------ */

export function spotlight(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}
