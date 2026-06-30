import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, useAnimationControls } from 'framer-motion'

/* ─── Context: exposes the "displayed" location to Routes ─── */
const TransitionLocationContext = createContext(null)

export function useTransitionLocation() {
  return useContext(TransitionLocationContext)
}

/* ─── Timing ─── */
const COVER_DURATION = 0.8
const HOLD_DURATION = 0.18
const REVEAL_DURATION = 0.7
const EASE_COVER = [0.65, 0, 0.2, 1]
const EASE_REVEAL = [0.4, 0, 0.15, 1]

export function scrollToLocationTarget(location) {
  const hash = location.hash?.slice(1)

  if (hash) {
    const target = document.getElementById(decodeURIComponent(hash))

    if (target) {
      target.scrollIntoView({ block: 'start', behavior: 'smooth' })
      return
    }
  }

  window.scrollTo({ top: 0, behavior: 'instant' })
}

function PageTransition({ children }) {
  const location = useLocation()
  const [displayedLocation, setDisplayedLocation] = useState(location)
  const prevPathRef = useRef(location.pathname)
  const isAnimatingRef = useRef(false)
  const pendingLocationRef = useRef(null)

  const curtainControls = useAnimationControls()
  const iconControls = useAnimationControls()

  const runTransition = useCallback(async (newLocation) => {
    if (isAnimatingRef.current) {
      pendingLocationRef.current = newLocation
      return
    }

    isAnimatingRef.current = true

    // Phase 1: Curtain slides UP from below to cover the screen
    // Old page remains fully visible underneath as the curtain covers it
    await Promise.all([
      curtainControls.start({
        y: '0%',
        transition: { duration: COVER_DURATION, ease: EASE_COVER },
      }),
      iconControls.start({
        y: '0%',
        transition: { duration: COVER_DURATION, ease: EASE_COVER },
      }),
    ])

    // Phase 2: Screen is fully covered — swap the page content underneath
    setDisplayedLocation(newLocation)
    window.requestAnimationFrame(() => scrollToLocationTarget(newLocation))

    // Brief hold so new page mounts under the curtain
    await new Promise((r) => setTimeout(r, HOLD_DURATION * 1000))

    // Phase 3: Curtain slides UP to exit — reveals new page like a curtain lifting
    await Promise.all([
      curtainControls.start({
        y: '-100%',
        transition: { duration: REVEAL_DURATION, ease: EASE_REVEAL },
      }),
      iconControls.start({
        y: '75%',
        transition: { duration: REVEAL_DURATION, ease: EASE_REVEAL },
      }),
    ])

    // Phase 4: Reset curtain back to starting position (below screen)
    curtainControls.set({ y: '100%' })
    iconControls.set({ y: '75%' })

    isAnimatingRef.current = false

    // If another navigation happened during animation, run it now
    if (pendingLocationRef.current) {
      const next = pendingLocationRef.current
      pendingLocationRef.current = null
      runTransition(next)
    }
  }, [curtainControls, iconControls])

  // Initialize curtain position
  useEffect(() => {
    curtainControls.set({ y: '100%' })
    iconControls.set({ y: '75%' })
  }, [curtainControls, iconControls])

  // Watch for route changes
  useEffect(() => {
    if (location.pathname === prevPathRef.current) {
      // Same page (query/hash change) — update immediately
      setDisplayedLocation(location)
      window.requestAnimationFrame(() => scrollToLocationTarget(location))
      return
    }

    prevPathRef.current = location.pathname
    runTransition(location)
  }, [location, runTransition])

  const contextValue = useMemo(() => displayedLocation, [displayedLocation])

  return (
    <TransitionLocationContext.Provider value={contextValue}>
      {children}

      {/* Curtain — always mounted, positioned off-screen when idle */}
      <motion.div
        className="page-curtain"
        initial={{ y: '100%' }}
        animate={curtainControls}
        aria-hidden="true"
      >
        <motion.div
          className="page-curtain__inner"
          initial={{ y: '75%' }}
          animate={iconControls}
        >
          <svg
            className="page-curtain__svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="80 55 210 170"
          >
            <path
              fill="#5c6673"
              d="M273,207.5c-2.5,2.5-6.1,3.7-10.5,3.7-6.5,0-14.8-2.5-24.2-7,15.1-4.2,27.1-16,31.6-30.9,7.5,15.7,9.1,28.3,3.2,34.3"
            />
            <path
              fill="#e62451"
              d="M271.8,160c0,4.6-.7,9-1.9,13.2-4.5,15-16.5,26.7-31.6,30.9-.7-.4-1.5-.7-2.3-1.1-.8-.4-1.7-.9-2.6-1.3-.3-.2-.6-.3-.9-.5-1.1-.6-2.2-1.2-3.3-1.8-1.3-.7-2.6-1.5-3.9-2.3-.1,0-.2-.1-.3-.2-1.3-.8-2.5-1.6-3.8-2.4-5.5-3.5-11.1-7.6-16.9-12.1,0,0,0,0,0,0-8-6.2-16.1-13.4-24.2-21.2v-1c0-12.3,4.8-23.4,12.7-31.6t0,0c8.3-8.7,20.1-14.2,33.1-14.2h.2c25.2.1,45.6,20.6,45.6,45.9"
            />
            <path
              fill="#5c6673"
              d="M108.4,85.6c-4,5.5-6.4,13-7,21.5,0,.3,0,.6,0,.9,0,.3,0,.6,0,.9v.2c0,.3,0,.6,0,.9,0,1.2,0,2.4,0,3.5v.6c0,.3,0,.6,0,.8,0,1.7.2,3.5.4,5.3,0,.5,0,1,.2,1.5,0,.2,0,.5.1.8,0,.3,0,.5,0,.8.1.8.2,1.6.4,2.4,2.1,12.1,6.7,25.3,13.9,38.1,9.8,17.4,22.6,31,35.4,39,.9.6,1.7,1.1,2.6,1.6l1,.6c.3.2.7.4,1,.6.7.3,1.3.7,2,1,.6.3,1.3.6,1.9.9h0c.6.3,1.3.6,1.9.8.3.1.6.2.9.4,5.1,1.8,10,2.7,14.6,2.5h.6c4-.2,7.8-1.3,11.2-3.2,4.2-2.4,7.6-5.9,10-10.4-11.6-8.1-19.2-21.4-19.5-36.5-1-1-2-2-3-3-30.8-30.8-51-63.2-52.9-82.4h0c20.1-3.7,47.7,15.3,65.5,46.9,1.1,2,2.1,3.9,3.1,5.9t0,0c8.3-8.7,20.1-14.2,33.1-14.2h.2c-.8-.9-1.7-1.7-2.6-2.6-40.1-40.2-83.1-62.3-95.9-49.4l-19.2,23.5Z"
            />
          </svg>
        </motion.div>
      </motion.div>
    </TransitionLocationContext.Provider>
  )
}

export default PageTransition
