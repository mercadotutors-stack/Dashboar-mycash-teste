import { useEffect, useRef, useState } from 'react'

export function useAnimatedNumber(target: number, duration = 800) {
  const [value, setValue] = useState(target)
  const frame = useRef<number>()

  useEffect(() => {
    const start = performance.now()
    const initial = value
    const delta = target - initial

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = initial + delta * progress
      setValue(eased)

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick)
      }
    }

    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [target, duration])

  return value
}
