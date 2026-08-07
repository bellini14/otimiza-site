import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import InspireNewsletterSignup from './InspireNewsletterSignup'

let fetchMock

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue({ message: 'Mensagem recebida.' }),
  })
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

describe('InspireNewsletterSignup', () => {
  it('submits the compact newsletter form with required consent', async () => {
    render(<MemoryRouter><InspireNewsletterSignup /></MemoryRouter>)
    const consent = screen.getByRole('checkbox', { name: /newsletter Inspire e comunicações da Otimiza/i })
    expect(consent).toBeRequired()
    expect(consent).not.toBeChecked()
    expect(consent).toHaveAccessibleName('Aceito receber a newsletter Inspire e comunicações da Otimiza. Saiba mais em Política de Privacidade.')
    expect(screen.getAllByRole('link', { name: 'Política de Privacidade' })).toHaveLength(2)
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'reader@example.com' } })
    fireEvent.click(consent)
    fireEvent.click(screen.getByRole('button', { name: 'Assinar newsletter' }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/newsletter', expect.objectContaining({ method: 'POST' })))
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ consent: true, source: 'otimiza-inspire-sidebar' })
  })

  it('opens the shared contact dialog without article context and sends a message to the newsroom', async () => {
    render(
      <MemoryRouter>
        <InspireNewsletterSignup />
      </MemoryRouter>,
    )

    const trigger = screen.getByRole('button', { name: 'Escreva para a redação' })
    expect(trigger).toHaveClass('inspire-sidebar__editorial-contact')
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)

    const dialog = screen.getByRole('dialog', { name: 'Escreva para a redação' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(within(dialog).queryByText('Sobre o artigo')).not.toBeInTheDocument()
    expect(within(dialog).getByText('A redação do Inspire responderá para o seu e-mail.'))
      .toBeInTheDocument()

    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Nome' }), {
      target: { value: 'Maria Oliveira' },
    })
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Email' }), {
      target: { value: 'leitor@example.com' },
    })
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Mensagem' }), {
      target: { value: 'Tenho uma sugestão para a próxima edição.' },
    })
    const updatesConsent = within(dialog).getByRole('checkbox', {
      name: /newsletter Inspire e comunicações da Otimiza/i,
    })
    expect(updatesConsent).not.toBeRequired()
    expect(updatesConsent).toHaveAccessibleName('Aceito receber a newsletter Inspire e comunicações da Otimiza. Saiba mais em Política de Privacidade.')
    fireEvent.click(updatesConsent)
    fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar mensagem' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST',
      }))
    })

    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(requestBody.firstName).toBe('Maria')
    expect(requestBody.lastName).toBe('Oliveira')
    expect(requestBody.message).toContain('Mensagem enviada para a redação do Inspire')
    expect(requestBody.message).toContain('Tenho uma sugestão para a próxima edição.')
    expect(requestBody.message).toContain('Atualizações mensais do Inspire: Sim')
    expect(requestBody.newsletterConsent).toBe(true)
    expect(requestBody.newsletterSource).toBe('otimiza-inspire-newsroom-contact-newsletter')
    expect(requestBody.message).not.toContain('Artigo:')
  })
})
