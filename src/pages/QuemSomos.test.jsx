import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import QuemSomos from './QuemSomos'

const originalIntersectionObserver = globalThis.IntersectionObserver
let intersectionObservers = []

class ControlledIntersectionObserver {
  constructor(callback) {
    this.callback = callback
    intersectionObservers.push(this)
  }

  observe(element) {
    this.element = element
  }

  disconnect() {}
}

afterEach(() => {
  cleanup()
  globalThis.IntersectionObserver = originalIntersectionObserver
  intersectionObservers = []
})

describe('QuemSomos', () => {
  it('reveals the three-pillars block on scroll with staggered animation classes', () => {
    globalThis.IntersectionObserver = ControlledIntersectionObserver

    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    const pillarsSection = screen.getByTestId('quem-somos-pillars')
    expect(pillarsSection.querySelector('[data-reveal="pillars-heading"]')).toHaveClass('opacity-0')
    expect(pillarsSection.querySelector('[data-reveal="pillars-card-0"]')).toHaveClass('opacity-0')
    expect(pillarsSection.querySelector('[data-reveal="pillars-panel"]')).toHaveClass('opacity-0')

    act(() => {
      intersectionObservers[0].callback([{ isIntersecting: true }])
    })

    expect(pillarsSection.querySelector('[data-reveal="pillars-heading"]')).toHaveClass('animate-enter')
    expect(pillarsSection.querySelector('[data-reveal="pillars-card-0"]')).toHaveClass('animate-enter')
    expect(pillarsSection.querySelector('[data-reveal="pillars-card-1"]')).toHaveClass('[animation-delay:240ms]')
    expect(pillarsSection.querySelector('[data-reveal="pillars-panel"]')).toHaveClass('[animation-delay:420ms]')
  })

  it('preserves the legacy about-page content in the refreshed layout', () => {
    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Quem somos' })).toBeInTheDocument()
    expect(screen.queryByText('Desde 1990')).not.toBeInTheDocument()
    expect(screen.queryByAltText('Otimiza')).not.toBeInTheDocument()
    expect(screen.getByText(/A Otimiza Consultoria nasceu em Caxias do Sul, em 1990/i)).toBeInTheDocument()
    expect(screen.getByTestId('quem-somos-client-logo-carousel')).toBeInTheDocument()
    expect(screen.getAllByAltText('Moneo').length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/Uma equipe multidisciplinar de consultores seniores/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/conduzimos transformações práticas no negócio/i)).toBeInTheDocument()
    expect(screen.queryByText('História')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Uma consultoria formada pela prática.' })).not.toBeInTheDocument()
    expect(screen.getByText(/Somos sustentados por três vértices de atuação/i)).toBeInTheDocument()

    expect(screen.getAllByRole('heading', { name: 'Consultoria' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Tecnologia' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Academia' })).toBeInTheDocument()
    expect(screen.getByText(/Leva as melhores/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Tecnologia/i }))
    expect(screen.getByText(/Amplia produtividade/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Academia/i }))
    expect(screen.getByText(/Transforma consultores/i)).toBeInTheDocument()

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
