function InspireNewsletterSignup() {
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

      <form className="inspire-sidebar__newsletter-form" action="/inspire/newsletter" method="get">
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
          <input type="checkbox" name="consentimento" required />
          <span>Eu aceito receber atualizações.</span>
        </label>

        <button
          type="submit"
          className="inspire-sidebar__newsletter-submit"
          data-inspire-tooltip="Assinar newsletter"
        >
          Assinar newsletter
        </button>
      </form>
    </section>
  )
}

export default InspireNewsletterSignup
