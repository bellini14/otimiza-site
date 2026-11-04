import { useFormSecurity } from '../hooks/useFormSecurity'
import TurnstileChallenge from './TurnstileChallenge'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ChevronRight, X } from 'lucide-react'
import PostArticleContactPanel from './PostArticleContactPanel'

const EXPEDIENTE_CREDITS = [
  { role: <>Fundadora <em>(in memoriam)</em></>, key: 'fundadora', name: 'Silvana Tiburi Bettiol' },
  { role: 'Publisher', name: 'Augusto Bellini' },
  { role: 'Diretor Comercial', name: 'Rafael Tiburi Bettiol' },
  { role: 'Diretor de Operações', name: 'Alceu Viegas Pires Machado' },
  { role: 'Produção de Conteúdo', name: 'Augusto Bellini' },
  { role: 'Revisão', name: 'Viviane Lanfredi' },
  { role: 'Produção Digital', name: 'João Antônio Rizzon Bellini' },
]

function InspireNewsletterSignup() {
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [isExpedienteOpen, setIsExpedienteOpen] = useState(false)
  const expedienteTitleId = useId()
  const expedienteTriggerRef = useRef(null)
  const expedienteCloseRef = useRef(null)

  const closeExpediente = () => {
    setIsExpedienteOpen(false)
    expedienteTriggerRef.current?.focus()
  }

  useEffect(() => {
    if (!isExpedienteOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return
      if (document.querySelector('.post-detail__contact-screen')) return
      closeExpediente()
    }

    document.addEventListener('keydown', handleKeyDown)
    expedienteCloseRef.current?.focus()

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isExpedienteOpen])
  const security = useFormSecurity()
  const isSubmitting = status.type === 'loading'

  async function handleSubmit(event) {
    event.preventDefault()
    if (!security.token) {
      setStatus({ type: 'error', message: 'Aguarde ou conclua a verificação de segurança antes de enviar.' })
      return
    }
    const form = event.currentTarget
    const data = new FormData(form)
    setStatus({ type: 'loading', message: 'Assinando…' })
    try {
      const response = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ turnstileToken: security.token, name: data.get('name'), email: data.get('email'), consent: data.get('consent') === 'on', source: 'otimiza-inspire-sidebar', company: data.get('company') }) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Não foi possível assinar agora.')
      form.reset()
      setStatus({ type: 'success', message: result.message || 'Inscrição confirmada.' })
    } catch (error) { setStatus({ type: 'error', message: error.message }) }
    finally { security.reset() }
  }
  return (
    <section className="inspire-sidebar__newsletter" aria-labelledby="inspire-sidebar-newsletter-title">
      <h2 id="inspire-sidebar-newsletter-title" className="inspire-sidebar__newsletter-title">
        Assine o Inspire
      </h2>
      <p className="inspire-sidebar__newsletter-copy">
        Entre para uma comunidade que pensa a gestão com profundidade. Todo dia 10 enviamos o
        Inspire Editorial e, todo dia 25, uma nova edição do Inspire — uma biblioteca que já reúne
        mais de 150 edições com artigos sobre gestão.
      </p>

      <form className="inspire-sidebar__newsletter-form" onSubmit={handleSubmit}>
              <TurnstileChallenge action="newsletter" onToken={security.setToken} ref={security.challengeRef} />
        <label className="inspire-sidebar__newsletter-field">
          <span className="sr-only">Nome</span>
          <input
            className="inspire-sidebar__newsletter-input"
            type="text"
            name="name"
            placeholder="Nome"
            autoComplete="name"
            required
          />
        </label>

        <label className="inspire-sidebar__newsletter-field">
          <span className="sr-only">Email</span>
          <input
            className="inspire-sidebar__newsletter-input"
            type="email" spellCheck={false}
            name="email"
            placeholder="Email"
            autoComplete="email"
            required
          />
        </label>

        <label className="inspire-sidebar__newsletter-consent">
          <input type="checkbox" name="consent" required />
          <span>Aceito receber a newsletter Inspire e comunicações da Otimiza. Saiba mais em <Link to="/politica-de-privacidade">Política de Privacidade</Link>.</span>
        </label>
        <label className="contact-honeypot" aria-hidden="true"><span>Empresa</span><input name="company" tabIndex="-1" autoComplete="off" /></label>

        <button
          type="submit"
          disabled={isSubmitting || !security.token}
          className="inspire-sidebar__newsletter-submit"
          data-inspire-tooltip="Assinar newsletter"
        >
          {isSubmitting ? 'Assinando…' : 'Assinar newsletter'}
        </button>
        {status.message ? <p className={`inspire-sidebar__newsletter-status inspire-sidebar__newsletter-status--${status.type}`} role={status.type === 'error' ? 'alert' : 'status'} aria-live="polite">{status.message}</p> : null}
      </form>

      <section
        className="inspire-sidebar__expediente"
        aria-label="Expediente"
      >
        <button
          ref={expedienteTriggerRef}
          type="button"
          className="inspire-sidebar__expediente-toggle"
          aria-haspopup="dialog"
          aria-expanded={isExpedienteOpen}
          onClick={() => setIsExpedienteOpen(true)}
        >
          EXPEDIENTE
          <ChevronRight className="inspire-sidebar__expediente-chevron" aria-hidden="true" />
        </button>
        {isExpedienteOpen && createPortal(
          <div
            className="inspire-share-screen"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeExpediente()
            }}
          >
            <section
              className="inspire-share-dialog inspire-expediente-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby={expedienteTitleId}
            >
              <header className="inspire-share-dialog__header">
                <div>
                  <p className="inspire-expediente-dialog__eyebrow">Inspire</p>
                  <h2 id={expedienteTitleId} className="inspire-share-dialog__title">
                    Expediente
                  </h2>
                </div>
                <button
                  ref={expedienteCloseRef}
                  type="button"
                  className="inspire-share-dialog__close"
                  aria-label="Fechar expediente"
                  onClick={closeExpediente}
                >
                  <X size={18} strokeWidth={1.8} />
                </button>
              </header>
              <div className="inspire-sidebar__expediente-text inspire-expediente-dialog__body">
                <p className="inspire-expediente-dialog__intro">
                  Inspire é uma publicação da Otimiza Consultoria em Administração, dedicada à difusão de
                  ideias, tendências e reflexões sobre estratégia, gestão, inovação e desenvolvimento
                  organizacional para os segmentos empresarial e acadêmico.
                </p>
                <ul className="inspire-expediente-dialog__credits">
                  {EXPEDIENTE_CREDITS.map(({ role, key, name }) => (
                    <li key={key || role} className="inspire-expediente-dialog__credit">
                      <span className="inspire-expediente-dialog__role">{role}:</span>{' '}
                      <span className="inspire-expediente-dialog__name">{name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <footer className="inspire-expediente-dialog__footer">
                <PostArticleContactPanel
                  variant="editorial"
                  triggerClassName="inspire-sidebar__editorial-contact inspire-share-dialog__option inspire-expediente-dialog__contact"
                  triggerLabel="Escreva para a redação"
                />
              </footer>
            </section>
          </div>,
          document.body,
        )}
        <Link className="inspire-sidebar__privacy-link" to="/politica-de-privacidade">Política de Privacidade</Link>
      </section>
    </section>
  )
}

export default InspireNewsletterSignup
