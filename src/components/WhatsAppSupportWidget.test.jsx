import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import WhatsAppSupportWidget from './WhatsAppSupportWidget'

vi.mock('lucide-react', () => ({
  X: (props) => <svg {...props} />,
}))

afterEach(cleanup)

describe('WhatsAppSupportWidget', () => {
  it('opens the support card with the official secure WhatsApp link', () => {
    render(<WhatsAppSupportWidget />)

    const trigger = screen.getByRole('button', { name: 'Abrir atendimento no WhatsApp' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Equipe Otimiza')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Falar no WhatsApp' })).toHaveAttribute(
      'href',
      'https://wa.me/555432116045?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20a%20equipe%20da%20Otimiza.',
    )
  })

  it('closes the support card with Escape', () => {
    render(<WhatsAppSupportWidget />)

    fireEvent.click(screen.getByRole('button', { name: 'Abrir atendimento no WhatsApp' }))
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByText('Olá, como posso te ajudar hoje?')).not.toBeInTheDocument()
  })
})
