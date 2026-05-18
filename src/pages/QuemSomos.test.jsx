import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { statSync } from 'node:fs'
import path from 'node:path'
import { cwd } from 'node:process'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import QuemSomos from './QuemSomos'

const originalIntersectionObserver = globalThis.IntersectionObserver
let intersectionObservers = []

class ControlledIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback
    this.options = options
    intersectionObservers.push(this)
  }

  observe(element) {
    this.element = element
  }

  disconnect() {}
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  globalThis.IntersectionObserver = originalIntersectionObserver
  intersectionObservers = []
})

describe('QuemSomos', () => {
  it('uses a lightweight hero background asset', () => {
    const heroAssetPath = path.join(cwd(), 'imagens', 'hero quem somos-optimized.jpg')

    expect(statSync(heroAssetPath).size).toBeLessThan(600 * 1024)
  })

  it('reveals the three-pillars block when most of its animation target is visible', () => {
    globalThis.IntersectionObserver = ControlledIntersectionObserver

    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    const pillarsSection = screen.getByTestId('quem-somos-pillars')
    const revealTarget = screen.getByTestId('quem-somos-pillars-reveal-target')
    expect(pillarsSection.querySelector('[data-reveal="pillars-heading"]')).toHaveClass('opacity-0')
    expect(pillarsSection.querySelector('[data-reveal="pillars-card-0"]')).toHaveClass('opacity-0')
    expect(pillarsSection.querySelector('[data-reveal="pillars-panel"]')).toHaveClass('opacity-0')

    const pillarsObserver = intersectionObservers.find((observer) => observer.element === revealTarget)
    expect(pillarsObserver.options.threshold).toBe(0.58)

    act(() => {
      pillarsObserver.callback([{ isIntersecting: true, intersectionRatio: 0.42 }])
    })

    expect(pillarsSection.querySelector('[data-reveal="pillars-heading"]')).toHaveClass('opacity-0')

    act(() => {
      pillarsObserver.callback([{ isIntersecting: true, intersectionRatio: 0.58 }])
    })

    expect(pillarsSection.querySelector('[data-reveal="pillars-heading"]')).toHaveClass('animate-enter')
    expect(pillarsSection.querySelector('[data-reveal="pillars-card-0"]')).toHaveClass('animate-enter')
    expect(pillarsSection.querySelector('[data-reveal="pillars-card-1"]')).toHaveClass('[animation-delay:240ms]')
    expect(pillarsSection.querySelector('[data-reveal="pillars-panel"]')).toHaveClass('[animation-delay:420ms]')
  })

  it('adds distinct scroll reveal variants to page content without animating section shells', () => {
    globalThis.IntersectionObserver = ControlledIntersectionObserver

    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('quem-somos-hero')).not.toHaveClass('qs-reveal')
    expect(screen.getByTestId('quem-somos-client-logo-carousel')).not.toHaveClass('qs-reveal')
    expect(screen.getByTestId('quem-somos-story')).not.toHaveClass('qs-reveal')
    expect(screen.getByTestId('quem-somos-strategy')).not.toHaveClass('qs-reveal')
    expect(screen.getByTestId('quem-somos-mission')).not.toHaveClass('qs-reveal')
    expect(screen.getByTestId('quem-somos-consultants')).not.toHaveClass('qs-reveal')
    expect(screen.getByTestId('quem-somos-strategy')).toHaveClass('bg-[#FFFFFF]')
    expect(screen.getByTestId('quem-somos-consultants')).toHaveClass('bg-[#FFFFFF]')

    const missionBackgroundIcon = screen.getByTestId('quem-somos-mission').querySelector('img[aria-hidden="true"]')
    expect(missionBackgroundIcon).toHaveClass('qs-reveal--hero-photo')
    expect(missionBackgroundIcon).not.toHaveClass('opacity-45')
    expect(missionBackgroundIcon).not.toHaveClass('qs-reveal--grow-out')
    expect(missionBackgroundIcon).not.toHaveClass('qs-reveal--rotate-soft')

    const missionQuote = screen.getByText(/Contribuir para o crescimento e a solidez dos clientes/i)
    expect(missionQuote).toHaveClass('qs-reveal--fade-up')
    expect(missionQuote).not.toHaveClass('qs-reveal--clip-rise')

    const strategySection = screen.getByTestId('quem-somos-strategy')
    const strategyHeading = strategySection.querySelector('[data-reveal="strategy-heading"]')
    expect(strategyHeading).not.toHaveClass('qs-reveal--visible')

    act(() => {
      intersectionObservers.forEach((observer) => {
        if (observer.element === strategySection) {
          observer.callback([{ isIntersecting: true, intersectionRatio: 0.18 }])
        }
      })
    })

    expect(strategyHeading).toHaveClass('qs-reveal--visible')
    expect(strategySection.querySelector('[data-reveal="strategy-item-0"]')).toHaveClass('qs-reveal--fade-up')
    expect(strategySection.querySelector('[data-reveal="strategy-item-1"]')).toHaveStyle({ '--qs-reveal-delay': '120ms' })
  })

  it('waits until the mission section is meaningfully visible before revealing its quote', () => {
    globalThis.IntersectionObserver = ControlledIntersectionObserver
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true })

    const animationFrameCallbacks = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      animationFrameCallbacks.push(callback)
      return animationFrameCallbacks.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function getBoundingClientRect() {
      const testId = this.getAttribute?.('data-testid')
      const top = testId === 'quem-somos-mission' ? 760 : 1600
      const height = 600

      return {
        top,
        bottom: top + height,
        left: 0,
        right: 1200,
        width: 1200,
        height,
        x: 0,
        y: top,
        toJSON: () => {},
      }
    })

    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    act(() => {
      const callbacks = animationFrameCallbacks.splice(0)
      callbacks.forEach((callback) => callback())
    })

    expect(screen.getByText(/Contribuir para o crescimento e a solidez dos clientes/i)).not.toHaveClass('qs-reveal--visible')
  })

  it('keeps the story copy static after the first full reveal pass', () => {
    let storyTop = 100
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true })

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function getBoundingClientRect() {
      if (typeof this.className === 'string' && this.className.includes('[text-align-last:left]')) {
        return {
          top: storyTop,
          bottom: storyTop + 420,
          left: 0,
          right: 900,
          width: 900,
          height: 420,
          x: 0,
          y: storyTop,
          toJSON: () => {},
        }
      }

      return {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
      }
    })

    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    const storyParagraph = screen.getByLabelText(/Uma equipe multidisciplinar de consultores seniores/i)
    const firstWord = storyParagraph.querySelector('span')
    expect(firstWord).toHaveStyle({ opacity: '1', filter: 'blur(0px)' })

    storyTop = 900
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    expect(firstWord).toHaveStyle({ opacity: '1', filter: 'blur(0px)' })
  })

  it('renders the hero title with the SplitText animation wrapper', () => {
    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    const heading = screen.getByRole('heading', { name: 'Quem somos' })
    expect(heading.tagName).toBe('H1')
    expect(heading).toHaveClass('split-parent')
    expect(heading).not.toHaveClass('qs-reveal')
  })

  it('uses the home hero image reveal animation on the about hero background', () => {
    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('quem-somos-hero-background')).toHaveClass('quem-somos-hero__photo')
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
