import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, X } from 'lucide-react'
import inspireLogo from '../assets/logo-inspire.svg'
import './InspirePopup.css'

const DISMISSED_UNTIL = 'otimiza:inspire-popup:dismissed-until'
const SEEN = 'otimiza:inspire-popup:seen'
const ELIGIBLE_ROUTES = new Set(['/', '/quem-somos', '/nossa-abordagem', '/o-que-fazemos', '/cases', '/tecnologia', '/academia-otimiza'])

function isSuppressed() {
  try {
    return Number(localStorage.getItem(DISMISSED_UNTIL)) > Date.now() || sessionStorage.getItem(SEEN) === '1'
  } catch {
    return false
  }
}

export default function InspirePopup() {
  const { pathname, search } = useLocation()
  const titleId = useId()
  const [visiblePath, setVisiblePath] = useState(null)
  const shown = useRef(false)
  const eligible = ELIGIBLE_ROUTES.has(pathname) || pathname.startsWith('/cases/')
  const preview = import.meta.env.DEV && new URLSearchParams(search).get('inspirePopup') === 'preview'
  const visible = eligible && visiblePath === pathname

  useEffect(() => {
    if (!eligible || (!preview && (shown.current || isSuppressed()))) return undefined
    let elapsed = false
    let opened = false
    const check = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (opened || document.visibilityState === 'hidden') return
      if (!preview && (!elapsed || scrollable <= 0 || window.scrollY / scrollable < 0.35)) return
      opened = true
      shown.current = true
      setVisiblePath(pathname)
      if (!preview) {
        try { sessionStorage.setItem(SEEN, '1') } catch { /* Storage is optional. */ }
      }
    }
    const timer = window.setTimeout(() => { elapsed = true; check() }, preview ? 0 : 20000)
    window.addEventListener('scroll', check, { passive: true })
    document.addEventListener('visibilitychange', check)
    return () => {
      setVisiblePath(null)
      window.clearTimeout(timer)
      window.removeEventListener('scroll', check)
      document.removeEventListener('visibilitychange', check)
    }
  }, [eligible, pathname, preview])

  useEffect(() => {
    if (!visible) return undefined
    const close = (event) => {
      if (event.key !== 'Escape') return
      setVisiblePath(null)
      if (!preview) {
        try { localStorage.setItem(DISMISSED_UNTIL, String(Date.now() + 7 * 86400000)) } catch { /* Storage is optional. */ }
      }
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [visible, preview])

  function dismiss() {
    setVisiblePath(null)
    if (!preview) {
      try { localStorage.setItem(DISMISSED_UNTIL, String(Date.now() + 7 * 86400000)) } catch { /* Storage is optional. */ }
    }
  }

  if (!visible) return null

  return (
    <aside className="inspire-popup" aria-labelledby={titleId}>
      <button className="inspire-popup__close" type="button" aria-label="Fechar convite do Inspire" onClick={dismiss}>
        <X size={18} aria-hidden="true" />
      </button>
      <img className="inspire-popup__logo" src={inspireLogo} alt="Inspire" />
      <h2 id={titleId}>Novas ideias.<br /> Melhores resultados.</h2>
      <p>Um novo olhar sobre gestão, processos e o futuro dos negócios. Encontre sua próxima leitura no Inspire.</p>
      <Link className="inspire-popup__link" to="/inspire" onClick={dismiss}>
        Explorar o Inspire <ArrowUpRight size={19} aria-hidden="true" />
      </Link>
      <span className="inspire-popup__note">Conteúdo para transformar sua gestão.</span>
    </aside>
  )
}
