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
  const submitting = useRef(false)
  const [status, setStatus] = useState({ type: 'idle', message: '' })
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
      if (!preview && (!elapsed || scrollable <= 0 || window.scrollY / scrollable < 0.15)) return
      opened = true
      shown.current = true
      setVisiblePath(pathname)
      if (!preview) {
        try { sessionStorage.setItem(SEEN, '1') } catch { /* Storage is optional. */ }
      }
    }
    const timer = window.setTimeout(() => { elapsed = true; check() }, preview ? 0 : 8000)
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

  async function subscribe(event) {
    event.preventDefault()
    if (submitting.current) return
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const data = new FormData(form)
    submitting.current = true
    setStatus({ type: 'loading', message: '' })
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.get('email'), consent: true, source: 'inspire-popup', company: data.get('company') }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Não foi possível assinar agora. Tente novamente.')
      setStatus({ type: 'success', message: result.message || 'Inscrição confirmada. Bem-vindo ao Inspire.' })
      if (!preview) {
        try { localStorage.setItem(DISMISSED_UNTIL, String(Date.now() + 7 * 86400000)) } catch { /* Storage is optional. */ }
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Não foi possível assinar agora. Tente novamente.' })
    } finally {
      submitting.current = false
    }
  }

  if (!visible) return null

  return (
    <aside className="inspire-popup" aria-labelledby={titleId}>
      <button className="inspire-popup__close" type="button" aria-label="Fechar convite do Inspire" onClick={dismiss}>
        <X size={18} aria-hidden="true" />
      </button>
      <img className="inspire-popup__logo" src={inspireLogo} alt="Inspire" />
      <h2 id={titleId}>Novas ideias.<br /> No seu e-mail.</h2>
      <p>Receba o Inspire e acompanhe ideias sobre gestão, estratégia e o futuro dos negócios.</p>
      {status.type === 'success' ? <p className="inspire-popup__status" role="status">{status.message}</p> : (
        <form onSubmit={subscribe} aria-label="Inscrição no Inspire">
          <label className="inspire-popup__field">E-mail
            <input type="email" name="email" placeholder="Seu e-mail" autoComplete="email" maxLength={254} required disabled={status.type === 'loading'} />
          </label>
          <label className="contact-honeypot" aria-hidden="true">Empresa<input name="company" tabIndex={-1} autoComplete="off" /></label>
          <p className="inspire-popup__privacy">Ao assinar, aceito receber a newsletter Inspire. Veja a <Link to="/politica-de-privacidade">Política de Privacidade</Link>.</p>
          <button className="inspire-popup__link" type="submit" disabled={status.type === 'loading'}>
            {status.type === 'loading' ? 'Assinando…' : 'Assinar o Inspire'} <ArrowUpRight size={19} aria-hidden="true" />
          </button>
          {status.type === 'error' && <p className="inspire-popup__status" role="alert">{status.message}</p>}
        </form>
      )}
    </aside>
  )
}
