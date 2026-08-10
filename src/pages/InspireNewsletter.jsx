import { useState } from 'react'
import { Link } from 'react-router-dom'
import Threads from '../components/Threads'

function InspireNewsletter() {
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const isSubmitting = status.type === 'loading'

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setStatus({ type: 'loading', message: 'Confirmando sua inscrição…' })
    try {
      const response = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.get('name'), email: data.get('email'), consent: data.get('consent') === 'on', source: 'otimiza-inspire-newsletter-page', company: data.get('company') }) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Não foi possível assinar agora.')
      form.reset()
      setStatus({ type: 'success', message: result.message || 'Inscrição confirmada.' })
    } catch (error) { setStatus({ type: 'error', message: error.message }) }
  }
  return (
    <section className="inspire-newsletter" aria-labelledby="inspire-newsletter-title">
      <div
        className="inspire-newsletter__threads-layer inspire-newsletter__threads-layer--top inspire-newsletter__threads-layer--overscan inspire-newsletter__threads-layer--interactive"
        aria-hidden="true"
      >
        <div className="inspire-newsletter__threads-stage">
          <Threads
            data-testid="threads-background"
            color={[0, 0, 0]}
            amplitude={1}
            distance={0}
            enableMouseInteraction
          />
        </div>
      </div>

      <div className="inspire-newsletter__content">
        <p className="inspire-newsletter__eyebrow">Newsletter Inspire</p>
        <h1 id="inspire-newsletter-title" className="inspire-newsletter__title">
          Assine a newsletter
        </h1>
        <p className="inspire-newsletter__copy">
          Receba novas leituras, repertorio de gestao e selecoes editoriais da Otimiza em uma curadoria
          direta no seu inbox.
        </p>

        <form className="inspire-newsletter__form" onSubmit={handleSubmit}>
          <label className="inspire-newsletter__field">
            <span>Nome</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Seu nome"
              className="inspire-newsletter__input"
            />
          </label>

          <label className="inspire-newsletter__field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="voce@empresa.com"
              className="inspire-newsletter__input"
              required
            />
          </label>

          <label className="inspire-newsletter__consent">
            <input type="checkbox" name="consent" required />
            <span>Aceito receber a newsletter Inspire e comunicações da Otimiza. Saiba mais em <Link to="/politica-de-privacidade">Política de Privacidade</Link>.</span>
          </label>
          <label className="contact-honeypot" aria-hidden="true"><span>Empresa</span><input name="company" tabIndex="-1" autoComplete="off" /></label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inspire-newsletter__submit"
            data-inspire-tooltip="Assinar newsletter"
          >
            {isSubmitting ? 'Assinando…' : 'Assinar newsletter'}
          </button>
          {status.message ? <p className={`inspire-newsletter__status inspire-newsletter__status--${status.type}`} role={status.type === 'error' ? 'alert' : 'status'} aria-live="polite">{status.message}</p> : null}
        </form>
      </div>
    </section>
  )
}

export default InspireNewsletter
