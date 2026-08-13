import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import WhatsAppSupportWidget from './WhatsAppSupportWidget'

vi.mock('lucide-react', () => ({
  MessageCircle: (props) => <svg {...props} />,
  X: (props) => <svg {...props} />,
}))

afterEach(cleanup)

describe('WhatsAppSupportWidget', () => {
  it('opens the support card with an encoded, secure WhatsApp link', () => {
    render(<WhatsAppSupportWidget />)

    const trigger = screen.getByRole('button', { name: 'Abrir atendimento no WhatsApp' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(trigger)

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('Equipe Otimiza')).not.toBeNull()
    const link = screen.getByRole('link', { name: 'Falar no WhatsApp' })
    expect(link.getAttribute('href')).toBe(
      'https://wa.me/555432116045?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20a%20equipe%20da%20Otimiza.',
    )
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('closes from the trigger, close button, and Escape key', () => {
    render(<WhatsAppSupportWidget />)

    const trigger = screen.getByRole('button', { name: 'Abrir atendimento no WhatsApp' })
    fireEvent.click(trigger)
    fireEvent.click(trigger)
    expect(screen.queryByText('Olá, como posso te ajudar hoje?')).toBeNull()

    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('button', { name: 'Fechar atendimento no WhatsApp' }))
    expect(screen.queryByText('Olá, como posso te ajudar hoje?')).toBeNull()

    fireEvent.click(trigger)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByText('Olá, como posso te ajudar hoje?')).toBeNull()
  })
})
