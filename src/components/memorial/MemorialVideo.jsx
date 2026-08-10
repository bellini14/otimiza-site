import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getScrollProgress,
  getVideoScrollPhases,
} from '../../lib/memorialPresentation'
import {
  MEMORIAL_VIDEO_PLAYBACK_RATE,
  MEMORIAL_VIDEO_POSTER,
  resolveVideoDefaults,
} from '../../lib/memorialVideoConfig'

const videoDefaults = resolveVideoDefaults(import.meta.env)
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function MemorialVideo({ src = videoDefaults.src }) {
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const [inViewport, setInViewport] = useState(false)
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState !== 'hidden')
  const [reducedMotion, setReducedMotion] = useState(() => (
    window.matchMedia?.(REDUCED_MOTION_QUERY).matches || false
  ))
  const [fallback, setFallback] = useState(false)

  const setSlowPlayback = useCallback(() => {
    if (!videoRef.current) return
    videoRef.current.defaultPlaybackRate = MEMORIAL_VIDEO_PLAYBACK_RATE
    videoRef.current.playbackRate = MEMORIAL_VIDEO_PLAYBACK_RATE
  }, [])

  useEffect(() => {
    setFallback(false)
  }, [src])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    let frame = 0

    const update = () => {
      frame = 0
      const rect = section.getBoundingClientRect()
      const viewportHeight = window.visualViewport?.height || window.innerHeight
      const distance = Math.max(1, rect.height - viewportHeight)
      const progress = getScrollProgress(-rect.top, distance)
      const phases = getVideoScrollPhases(progress)
      section.style.setProperty('--memorial-video-progress', String(progress))
      section.style.setProperty('--memorial-video-expand-progress', String(phases.expansion))
      section.style.setProperty('--memorial-video-contract-progress', String(phases.contraction))
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    const resizeObserver = new ResizeObserver(schedule)
    resizeObserver.observe(section)
    window.addEventListener('scroll', schedule, { passive: true })
    document.body?.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('orientationchange', schedule)
    window.visualViewport?.addEventListener('resize', schedule)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', schedule)
      document.body?.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('orientationchange', schedule)
      window.visualViewport?.removeEventListener('resize', schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      setInViewport(Boolean(entry?.isIntersecting))
    }, { rootMargin: '12% 0px', threshold: 0.01 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onVisibilityChange = () => setPageVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  useEffect(() => {
    const media = window.matchMedia?.(REDUCED_MOTION_QUERY)
    if (!media) return undefined
    const onChange = (event) => setReducedMotion(event.matches)
    media.addEventListener?.('change', onChange)
    return () => media.removeEventListener?.('change', onChange)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    setSlowPlayback()
    if (!inViewport || !pageVisible || reducedMotion || fallback) {
      video.pause()
      return
    }
    const playback = video.play()
    playback?.catch(() => setFallback(true))
  }, [fallback, inViewport, pageVisible, reducedMotion, setSlowPlayback, src])

  const showPoster = fallback || reducedMotion

  return (
    <section
      ref={sectionRef}
      className="memorial-video-section"
      aria-label="Vídeo em homenagem à Silvana"
      data-static={showPoster || undefined}
    >
      <div className="memorial-video-stage">
        <div className="memorial-video-frame">
          {showPoster ? (
            <img
              className="memorial-video-poster"
              src={MEMORIAL_VIDEO_POSTER}
              alt="Imagem do vídeo em homenagem à Silvana"
            />
          ) : src ? (
            <video
              ref={videoRef}
              src={src}
              poster={MEMORIAL_VIDEO_POSTER}
              muted
              autoPlay
              loop
              playsInline
              preload="metadata"
              onLoadedMetadata={setSlowPlayback}
              onError={() => setFallback(true)}
              aria-label="Vídeo em homenagem à Silvana"
            >
              Seu navegador não suporta a reprodução deste vídeo.
            </video>
          ) : (
            <div className="memorial-video-placeholder" aria-label="Vídeo será adicionado em breve">
              <span>Um filme para lembrar dela</span>
              <small>vídeo em preparação</small>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default MemorialVideo
