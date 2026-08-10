import { Check, Copy, Mail, Share2, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function WhatsAppIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      data-brand-icon="whatsapp"
    >
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      data-brand-icon="linkedin"
    >
      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
    </svg>
  )
}

function getAbsoluteUrl(url) {
  if (!url) return window.location.href
  return new URL(url, window.location.origin).href
}

async function copyShareUrl(url) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = url
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  const copied = document.execCommand?.('copy')
  textarea.remove()

  if (!copied) throw new Error('Clipboard unavailable')
}

function InspireShareButton({ className = '', title, url }) {
  const [isOpen, setIsOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState('idle')
  const dialogTitleId = useId()
  const triggerRef = useRef(null)
  const closeButtonRef = useRef(null)
  const shareUrl = getAbsoluteUrl(url)
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title || 'Inspire')
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title || 'Inspire'} — ${shareUrl}`)}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  const emailUrl = `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(shareUrl)}`

  const closeDialog = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeDialog()
    }

    document.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const openDialog = () => {
    setCopyStatus('idle')
    setIsOpen(true)
  }

  const handleCopy = async () => {
    try {
      await copyShareUrl(shareUrl)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={className}
        data-inspire-tooltip="Compartilhar artigo"
        aria-label="Compartilhar"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={openDialog}
      >
        <Share2 size={16} strokeWidth={1.8} />
        <span>Compartilhar</span>
      </button>

      {isOpen && createPortal(
        <div
          className="inspire-share-screen"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog()
          }}
        >
          <section
            className="inspire-share-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
          >
            <header className="inspire-share-dialog__header">
              <div>
                <h2 id={dialogTitleId} className="inspire-share-dialog__title">
                  Compartilhar artigo
                </h2>
                {title && <p className="inspire-share-dialog__article">{title}</p>}
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                className="inspire-share-dialog__close"
                aria-label="Fechar compartilhamento"
                onClick={closeDialog}
              >
                <X size={18} strokeWidth={1.8} />
              </button>
            </header>

            <div className="inspire-share-dialog__options">
              <a
                className="inspire-share-dialog__option"
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon />
                <span>WhatsApp</span>
              </a>
              <a
                className="inspire-share-dialog__option"
                href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
              >
                <LinkedInIcon />
                <span>LinkedIn</span>
              </a>
              <a className="inspire-share-dialog__option" href={emailUrl}>
                <Mail size={18} strokeWidth={1.7} />
                <span>E-mail</span>
              </a>
              <button
                type="button"
                className="inspire-share-dialog__option"
                aria-label={copyStatus === 'copied' ? 'Link copiado' : 'Copiar link'}
                onClick={handleCopy}
              >
                {copyStatus === 'copied' ? (
                  <Check size={18} strokeWidth={1.8} />
                ) : (
                  <Copy size={18} strokeWidth={1.7} />
                )}
                <span aria-live="polite">
                  {copyStatus === 'copied'
                    ? 'Link copiado'
                    : copyStatus === 'error'
                      ? 'Não foi possível copiar'
                      : 'Copiar link'}
                </span>
              </button>
            </div>
          </section>
        </div>,
        document.body,
      )}
    </>
  )
}

export default InspireShareButton
