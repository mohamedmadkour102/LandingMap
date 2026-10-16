import { useCountUp, useInView } from '../hooks/useCountUp'

interface Props {
  value: number
  suffix?: string
  prefix?: string
  className?: string
  /** Count again each time the number scrolls back into view */
  replay?: boolean
}

export function AnimatedNumber({ value, suffix = '', prefix = '', className, replay = false }: Props) {
  const { ref, inView } = useInView(0.6, '0px 0px -30% 0px', !replay)
  const n = useCountUp(value, 1600, inView)

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={className}>
      {prefix}
      {n.toLocaleString()}
      {suffix}
    </span>
  )
}
