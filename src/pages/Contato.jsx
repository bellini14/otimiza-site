import { useRef, useState } from 'react'
import { Mail, Phone } from 'lucide-react'
import ContactMap from '../components/ContactMap'

const contactSocialLinks = [
  {
    href: 'https://www.facebook.com/Otimizaconsultoria',
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M14.2 8.4V6.7c0-.8.5-1 1-1h2.6V2.1L14.7 2C11.4 2 10 4 10 6.4v2H7v4h3V22h4.2v-9.6h3.2l.5-4h-3.7Z" />
      </svg>
    ),
  },
  {
    href: 'https://www.youtube.com/channel/UC8blc6s_gWY5tvWDhW6Y7IA',
    label: 'YouTube',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M21.2 7.1a2.7 2.7 0 0 0-1.9-1.9C17.6 4.7 12 4.7 12 4.7s-5.6 0-7.3.5a2.7 2.7 0 0 0-1.9 1.9A28 28 0 0 0 2.3 12a28 28 0 0 0 .5 4.9 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.3.5 7.3.5s5.6 0 7.3-.5a2.7 2.7 0 0 0 1.9-1.9 28 28 0 0 0 .5-4.9 28 28 0 0 0-.5-4.9Z" />
        <path d="m10 15.2 5-3.2-5-3.2v6.4Z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: 'https://www.instagram.com/otm_consultoria/',
    label: 'Instagram',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.4" cy="6.6" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: 'https://www.linkedin.com/company/otimiza-consultoria',
    label: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V9h4v1.7A5 5 0 0 1 16 8Z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
]

function Contato() {
  const formRef = useRef(null)
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const isSubmitting = status.type === 'loading'

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())
    payload.newsletterConsent = formData.get('newsletterConsent') === 'on'
    payload.newsletterSource = 'otimiza-contact-page-newsletter'

    setStatus({ type: 'loading', message: '' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.error || 'Não foi possível enviar agora. Tente novamente mais tarde.')
      }

      form.reset()
      setStatus({ type: 'success', message: result.message || 'Mensagem recebida.' })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível enviar agora. Tente novamente mais tarde.',
      })
    }
  }

  return (
    <div className="contact-page -mt-32 sm:-mt-36">
      <section className="contact-hero">
        <div className="contact-hero__map" data-testid="contact-hero-map">
          <ContactMap />
        </div>
        <div className="contact-hero__gradient" aria-hidden="true" />
        <div className="contact-shell contact-hero__content">
          <h1>Contato</h1>
          <p>Rua Frei Pacífico, 260 — São José, Caxias do Sul — RS, 95032-380.</p>
        </div>
      </section>

      <section className="contact-details" aria-label="Informações de contato">
        <div className="contact-shell contact-details__row">
          <a className="contact-details__link" href="mailto:otm@otm.com.br">
            <Mail aria-hidden="true" />
            <span>otm@otm.com.br</span>
          </a>
          <a className="contact-details__link" href="tel:+555432116045">
            <Phone aria-hidden="true" />
            <span>+55 54 3211.6045</span>
          </a>
          <nav className="contact-details__socials" aria-label="Redes sociais da Otimiza">
            {contactSocialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                target="_blank"
                rel="noreferrer"
              >
                {social.icon}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="contact-main" aria-label="Formulário de contato">
        <div className="contact-shell contact-form-panel" data-testid="contact-form-panel">
            <h2>Mande uma mensagem</h2>
            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="contact-form__names">
                <label>
                  <span className="sr-only">Nome</span>
                  <input className="contact-form__field" name="firstName" placeholder="Nome" autoComplete="given-name" maxLength="80" required />
                </label>
                <label>
                  <span className="sr-only">Sobrenome</span>
                  <input className="contact-form__field" name="lastName" placeholder="Sobrenome" autoComplete="family-name" maxLength="80" required />
                </label>
              </div>

              <label>
                <span className="sr-only">E-mail</span>
                <input className="contact-form__field" name="email" type="email" placeholder="E-mail" autoComplete="email" maxLength="254" required />
              </label>

              <label>
                <span className="sr-only">Comentário ou mensagem</span>
                <textarea className="contact-form__field" name="message" placeholder="Digite sua mensagem..." rows="2" maxLength="5000" required />
              </label>

              <label className="contact-form__consent">
                <input type="checkbox" name="newsletterConsent" />
                <span>Aceito receber a newsletter Inspire e comunicações da Otimiza. Saiba mais em <a href="/politica-de-privacidade">Política de Privacidade</a>.</span>
              </label>

              <label className="contact-honeypot" aria-hidden="true">
                <span>Empresa</span>
                <input name="company" tabIndex="-1" autoComplete="off" />
              </label>

              <div className="contact-form__footer">
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando…' : 'Enviar'}
                </button>
                {status.message ? (
                  <p
                    className={`contact-form__status contact-form__status--${status.type}`}
                    role={status.type === 'error' ? 'alert' : 'status'}
                    aria-live="polite"
                  >
                    {status.message}
                  </p>
                ) : null}
              </div>
            </form>
        </div>
      </section>
    </div>
  )
}

export default Contato
