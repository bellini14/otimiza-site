import Threads from '../components/Threads'

function handleSubmit(event) {
  event.preventDefault()
}

function InspireNewsletter() {
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
            />
          </label>

          <button type="submit" className="inspire-newsletter__submit">
            Assinar newsletter
          </button>
        </form>
      </div>
    </section>
  )
}

export default InspireNewsletter
