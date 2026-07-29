import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { getScrollProgress } from '../../lib/memorialPresentation'

function MemorialVideo({
  src = import.meta.env.VITE_SILVANA_VIDEO_URL || '',
  hasAudio = import.meta.env.VITE_SILVANA_VIDEO_HAS_AUDIO === 'true',
}) {
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    let frame = 0
    const update = () => {
      frame = 0
      const rect = section.getBoundingClientRect()
      const progress = getScrollProgress(-rect.top, Math.max(1, rect.height - window.innerHeight))
      section.style.setProperty('--memorial-video-progress', String(progress))
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  const toggleSound = () => {
    const next = !muted
    setMuted(next)
    if (videoRef.current) videoRef.current.muted = next
  }

  return (
    <section
      ref={sectionRef}
      className="memorial-video-section"
      aria-label="Vídeo em homenagem à Silvana"
    >
      <div className="memorial-video-stage">
        <div className="memorial-video-frame">
          {src ? (
            <video
              ref={videoRef}
              src={src}
              muted={muted}
              autoPlay
              loop
              playsInline
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
          {src && hasAudio && (
            <button
              className="memorial-sound"
              type="button"
              onClick={toggleSound}
              aria-label={muted ? 'Ativar som do vídeo' : 'Desativar som do vídeo'}
            >
              {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default MemorialVideo
