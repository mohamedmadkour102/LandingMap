import { useCountUp, useInView } from '../hooks/useCountUp'

interface Props {
  value: number
  suffix?: string
  prefix?: string
  className?: string
}

export function AnimatedNumber({ value, suffix = '', prefix = '', className }: Props) {
  const { ref, inView } = useInView(0.3)
  const n = useCountUp(value, 1600, inView)

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={className}>
      {prefix}
      {n.toLocaleString()}
      {suffix}
    </span>
  )
}
