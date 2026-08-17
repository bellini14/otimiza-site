import { useState } from 'react'
import { Link } from 'react-router-dom'
import PostArticleContactPanel from './PostArticleContactPanel'

function InspireNewsletterSignup() {
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const isSubmitting = status.type === 'loading'

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setStatus({ type: 'loading', message: 'Assinando…' })
    try {
      const response = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.get('name'), email: data.get('email'), consent: data.get('consent') === 'on', source: 'otimiza-inspire-sidebar', company: data.get('company') }) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Não foi possível assinar agora.')
      form.reset()
      setStatus({ type: 'success', message: result.message || 'Inscrição confirmada.' })
    } catch (error) { setStatus({ type: 'error', message: error.message }) }
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
            type="email"
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
          disabled={isSubmitting}
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
        <p className="inspire-sidebar__expediente-text">
          EXPEDIENTE
          <br />
          <br />
          Inspire é uma publicação da Otimiza Consultoria em Administração, dedicada à difusão de
          ideias, tendências e reflexões sobre estratégia, gestão, inovação e desenvolvimento
          organizacional para os segmentos empresarial e acadêmico.
          <br />
          <br />
          Fundadora <em>(in memoriam)</em>: Silvana Tiburi Bettiol
          <br />
          Publisher: Augusto Bellini
          <br />
          Diretor Comercial: Rafael Tiburi Bettiol
          <br />
          Diretor de Operações: Alceu Viegas Pires Machado
          <br />
          Produção de Conteúdo: Augusto Bellini
          <br />
          Revisão: Viviane Lanfredi
          <br />
          Produção Digital: João Antônio Rizzon Bellini
        </p>
        <PostArticleContactPanel
          variant="editorial"
          triggerClassName="inspire-sidebar__editorial-contact"
          triggerLabel="Escreva para a redação"
        />
        <Link className="inspire-sidebar__privacy-link" to="/politica-de-privacidade">Política de Privacidade</Link>
      </section>
    </section>
  )
}

export default InspireNewsletterSignup
