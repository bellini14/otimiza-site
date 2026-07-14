import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Contato from './Contato'

vi.mock('../components/ContactMap', () => ({
  default: () => <div role="region" aria-label="Mapa da Otimiza em Caxias do Sul" />,
}))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Contato page', () => {
  it('renders the map inside the hero and a simplified full-width form', () => {
    render(<Contato />)

    expect(screen.getByRole('heading', { level: 1, name: 'Contato' })).toBeInTheDocument()
    expect(screen.getByText('Rua Frei Pacífico, 260 — São José, Caxias do Sul — RS, 95032-380.')).toBeInTheDocument()
    expect(screen.queryByText('Fale com a Otimiza')).not.toBeInTheDocument()
    expect(screen.queryByText(/Frei Pacífico 260/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toBeRequired()
    expect(screen.getByLabelText('Sobrenome')).toBeRequired()
    expect(screen.getByLabelText('E-mail')).toBeRequired()
    expect(screen.getByLabelText('Comentário ou mensagem')).toBeRequired()
    expect(screen.getByTestId('contact-form-panel')).toHaveClass('contact-form-panel')
    expect(screen.getByTestId('contact-hero-map')).toContainElement(
      screen.getByRole('region', { name: 'Mapa da Otimiza em Caxias do Sul' }),
    )
    expect(screen.getByRole('region', { name: 'Informações de contato' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'otm@otm.com.br' })).toHaveAttribute('href', 'mailto:otm@otm.com.br')
    expect(screen.getByRole('link', { name: '+55 54 3211.6045' })).toHaveAttribute('href', 'tel:+555432116045')
    expect(screen.getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'href',
      'https://www.facebook.com/Otimizaconsultoria',
    )
    expect(screen.getByRole('link', { name: 'YouTube' })).toHaveAttribute(
      'href',
      'https://www.youtube.com/channel/UC8blc6s_gWY5tvWDhW6Y7IA',
    )
    expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
      'href',
      'https://www.instagram.com/otm_consultoria/',
    )
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/company/otimiza-consultoria',
    )
    expect(screen.queryByRole('region', { name: 'Localização da Otimiza' })).not.toBeInTheDocument()
  })

  it('submits the form and clears it after success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ message: 'Mensagem recebida.' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<Contato />)

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'João' } })
    fireEvent.change(screen.getByLabelText('Sobrenome'), { target: { value: 'Silva' } })
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'joao@example.com' } })
    fireEvent.change(screen.getByLabelText('Comentário ou mensagem'), { target: { value: 'Olá, Otimiza.' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Enviar' }).closest('form'))

    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled()
    await screen.findByText('Mensagem recebida.')

    expect(fetchMock).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST' }))
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(expect.objectContaining({
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao@example.com',
      message: 'Olá, Otimiza.',
    }))
    expect(screen.getByLabelText('Nome')).toHaveValue('')
  })

  it('preserves form values when submission fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: 'Serviço de e-mail ainda não configurado.' }),
    }))
    render(<Contato />)

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'João' } })
    fireEvent.change(screen.getByLabelText('Sobrenome'), { target: { value: 'Silva' } })
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'joao@example.com' } })
    fireEvent.change(screen.getByLabelText('Comentário ou mensagem'), { target: { value: 'Minha mensagem.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Serviço de e-mail ainda não configurado.'))
    expect(screen.getByLabelText('Nome')).toHaveValue('João')
    expect(screen.getByLabelText('Comentário ou mensagem')).toHaveValue('Minha mensagem.')
  })
})
