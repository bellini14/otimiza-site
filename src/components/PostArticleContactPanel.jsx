import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MessageCircle, X } from 'lucide-react'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const initialFormValues = {
  email: '',
  message: '',
  company: '',
}

function PostArticleContactPanel({ postTitle, postPath }) {
  const dialogId = useId()
  const dialogTitleId = useId()
  const triggerRef = useRef(null)
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [formValues, setFormValues] = useState(initialFormValues)
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const isSubmitting = status.type === 'loading'

  function closeDialog() {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeDialog()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll(focusableSelector) || [],
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements.at(-1)

      if (!firstElement || !lastElement) {
        event.preventDefault()
        return
      }

      if (!dialogRef.current?.contains(document.activeElement)) {
        event.preventDefault()
        const fallbackElement = event.shiftKey ? lastElement : firstElement
        fallbackElement.focus()
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.documentElement.style.overflow = previousOverflow
    }
  }, [isOpen])

  function handleFieldChange(event) {
    const { name, value } = event.currentTarget
    setFormValues((current) => ({ ...current, [name]: value }))

    if (status.type === 'success' || status.type === 'error') {
      setStatus({ type: 'idle', message: '' })
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const readerMessage = formValues.message.trim()
    const payload = {
      firstName: 'Leitor',
      lastName: 'Inspire',
      email: formValues.email.trim(),
      message: `Mensagem enviada pelo Inspire\nArtigo: "${postTitle}"\nLink: ${postPath}\n\nMensagem do leitor:\n${readerMessage}`,
      company: formValues.company,
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

      setFormValues(initialFormValues)
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
      <div className="post-detail__hero-action-item">
        <button
          ref={triggerRef}
          type="button"
          className="post-detail__hero-action-control post-detail__hero-contact-button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={dialogId}
          data-inspire-tooltip="Enviar mensagem"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle size={16} strokeWidth={1.8} />
          Contato
        </button>
      </div>

      {isOpen && createPortal(
        <div
          className="post-detail__contact-screen"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog()
          }}
        >
          <section
            ref={dialogRef}
            id={dialogId}
            className="post-detail__contact-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
          >
            <header className="post-detail__contact-dialog-header">
              <div className="post-detail__contact-heading-group">
                <span
                  className="post-detail__contact-heading-icon"
                  data-testid="contact-heading-icon"
                  aria-hidden="true"
                >
                  <MessageCircle size={20} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <div className="post-detail__contact-heading-text">
                  <h2 id={dialogTitleId} className="post-detail__contact-heading">
                    Converse sobre este artigo
                  </h2>
                  <p className="post-detail__contact-heading-copy">
                    Compartilhe uma dúvida, percepção ou aplicação prática.
                  </p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                className="post-detail__contact-dialog-close"
                aria-label="Fechar contato"
                onClick={closeDialog}
              >
                <X size={18} strokeWidth={1.8} />
              </button>
            </header>

            <div className="post-detail__contact-context">
              <span className="post-detail__contact-context-label">Sobre o artigo</span>
              <p className="post-detail__contact-article-title">{postTitle}</p>
            </div>

            <p className="post-detail__contact-prompt">
              A equipe da Otimiza responderá pelo seu e-mail.
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
                  value={formValues.email}
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
                  value={formValues.message}
                  disabled={isSubmitting}
                  onChange={handleFieldChange}
                  required
                />
              </label>
              <label className="post-detail__contact-honeypot" aria-hidden="true">
                <span>Empresa</span>
                <input
                  name="company"
                  tabIndex="-1"
                  autoComplete="off"
                  value={formValues.company}
                  onChange={handleFieldChange}
                />
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
          </section>
        </div>,
        document.body,
      )}
    </>
  )
}

export default PostArticleContactPanel
