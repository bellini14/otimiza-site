import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import QuemSomos from './QuemSomos'

afterEach(() => {
  cleanup()
})

describe('QuemSomos', () => {
  it('preserves the legacy about-page content in the refreshed layout', () => {
    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Quem somos' })).toBeInTheDocument()
    expect(screen.getByText(/A Otimiza Consultoria nasceu em Caxias do Sul, em 1990/i)).toBeInTheDocument()
    expect(screen.getByText(/Somos sustentados por três vértices de atuação/i)).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Consultoria' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tecnologia' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Academia' })).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Estratégia' })).toBeInTheDocument()
    expect(screen.getByText(/Transformação dos modelos de negócio/i)).toBeInTheDocument()
    expect(screen.getByText(/Realização de eventos que entreguem eficácia/i)).toBeInTheDocument()

    expect(screen.getByText(/Contribuir para o crescimento e a solidez dos clientes/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Consultores' })).toBeInTheDocument()
    expect(screen.getByText(/Certificações - CBPP/i)).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Entre em contato' })).toHaveAttribute('href', '/contato')
    expect(screen.getByRole('link', { name: 'Acesse nosso LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/company/otimiza-consultoria',
    )
  })
})
