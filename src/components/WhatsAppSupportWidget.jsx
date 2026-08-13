import { MessageCircle, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import logoOtimiza from '../assets/logo-otimiza.svg'

const WHATSAPP_NUMBER = '555432116045'
const WHATSAPP_MESSAGE = 'Olá, gostaria de falar com a equipe da Otimiza.'

function getCurrentTime() {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
}

function WhatsAppSupportWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(getCurrentTime)
  const cardId = useId()
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  const toggleWidget = () => {
    if (!isOpen) setCurrentTime(getCurrentTime())
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <aside className="whatsapp-support" aria-label="Atendimento pelo WhatsApp">
      {isOpen && (
        <section id={cardId} className="whatsapp-support__card" aria-label="Conversa com a equipe Otimiza">
          <header className="whatsapp-support__header">
            <div className="whatsapp-support__company">
              <span className="whatsapp-support__logo" aria-hidden="true">
                <img src={logoOtimiza} alt="" />
              </span>
              <span>
                <strong>Otimiza</strong>
                <small><i aria-hidden="true" />Online agora</small>
              </span>
            </div>
            <button
              type="button"
              className="whatsapp-support__close"
              aria-label="Fechar atendimento no WhatsApp"
              onClick={() => setIsOpen(false)}
            >
              <X size={19} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </header>

          <div className="whatsapp-support__body">
            <div className="whatsapp-support__message">
              <strong>Equipe Otimiza</strong>
              <p>Olá, como posso te ajudar hoje?</p>
              <time>{currentTime}</time>
            </div>
          </div>

          <footer className="whatsapp-support__footer">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp">
              <MessageCircle size={20} strokeWidth={2.2} aria-hidden="true" />
              <span>Falar no WhatsApp</span>
            </a>
          </footer>
        </section>
      )}

      <button
        type="button"
        className="whatsapp-support__trigger"
        aria-label="Abrir atendimento no WhatsApp"
        aria-controls={cardId}
        aria-expanded={isOpen}
        onClick={toggleWidget}
      >
        <MessageCircle size={30} strokeWidth={2.1} aria-hidden="true" />
      </button>
    </aside>
  )
}

export default WhatsAppSupportWidget
