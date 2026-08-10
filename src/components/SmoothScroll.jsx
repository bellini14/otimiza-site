import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

function SmoothScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      return undefined
    }

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    })

    let animationFrameId = 0

    const raf = (time) => {
      lenis.raf(time)
      animationFrameId = window.requestAnimationFrame(raf)
    }

    animationFrameId = window.requestAnimationFrame(raf)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      lenis.destroy()
    }
  }, [])

  return null
}

export default SmoothScroll
