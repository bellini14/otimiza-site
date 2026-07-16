import { useId, useState } from 'react'
import { MessageCircle } from 'lucide-react'

function PostArticleContactPanel({ postTitle, postPath }) {
  const panelId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const isSubmitting = status.type === 'loading'

  function handleFieldChange() {
    if (status.type === 'success' || status.type === 'error') {
      setStatus({ type: 'idle', message: '' })
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const readerMessage = String(formData.get('message') || '').trim()
    const payload = {
      firstName: 'Leitor',
      lastName: 'Inspire',
      email: String(formData.get('email') || '').trim(),
      message: `Mensagem enviada pelo Inspire\nArtigo: "${postTitle}"\nLink: ${postPath}\n\nMensagem do leitor:\n${readerMessage}`,
      company: String(formData.get('company') || ''),
    }

    setStatus({ type: 'loading', message: 'Enviando sua mensagem...' })

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
      setStatus({
        type: 'success',
        message: 'Mensagem enviada. A equipe da Otimiza responderá pelo seu e-mail.',
      })
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Não foi possível enviar agora. Tente novamente mais tarde.'

      setStatus({
        type: 'error',
        message: `${errorMessage} Sua mensagem continua no formulário para você tentar novamente.`,
      })
    }
  }

  return (
    <>
      <div className="post-detail__sidebar-action-item">
        <button
          type="button"
          className="post-detail__sidebar-action-control post-detail__sidebar-contact-button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          data-inspire-tooltip="Enviar mensagem"
          onClick={() => setIsOpen((current) => !current)}
        >
          <MessageCircle size={16} strokeWidth={1.8} />
          Contato
        </button>
      </div>

      <div
        className={`post-detail__contact-panel-shell post-detail__contact-panel-shell--${isOpen ? 'open' : 'closed'}`}
        aria-hidden={!isOpen}
        inert={isOpen ? undefined : ''}
      >
        <div
          id={panelId}
          className="post-detail__contact-panel"
          role="region"
          aria-label="Enviar mensagem sobre o artigo"
        >
          <div className="post-detail__contact-panel-content">
            <h3 className="post-detail__contact-heading">Converse sobre este artigo</h3>

            <div className="post-detail__contact-context">
              <span className="post-detail__contact-context-label">Sobre o artigo</span>
              <p className="post-detail__contact-article-title">{postTitle}</p>
            </div>

            <p className="post-detail__contact-prompt">
              Envie uma dúvida, percepção ou aplicação prática. A equipe da Otimiza responderá
              pelo seu e-mail.
            </p>

            <form className="post-detail__contact-form" onSubmit={handleSubmit}>
              <label>
                <span className="sr-only">Email</span>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  maxLength="254"
                  disabled={isSubmitting}
                  onChange={handleFieldChange}
                  required
                />
              </label>
              <label>
                <span className="sr-only">Mensagem</span>
                <textarea
                  name="message"
                  placeholder="O que este artigo fez você pensar?"
                  rows="3"
                  maxLength="4200"
                  disabled={isSubmitting}
                  onChange={handleFieldChange}
                  required
                />
              </label>
              <label className="post-detail__contact-honeypot" aria-hidden="true">
                <span>Empresa</span>
                <input name="company" tabIndex="-1" autoComplete="off" />
              </label>

              <div className="post-detail__contact-footer">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-inspire-tooltip="Enviar mensagem"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar mensagem'}
                </button>
                {status.message && (
                  <p
                    className={`post-detail__contact-status post-detail__contact-status--${status.type}`}
                    role={status.type === 'error' ? 'alert' : 'status'}
                    aria-live="polite"
                  >
                    {status.message}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default PostArticleContactPanel
