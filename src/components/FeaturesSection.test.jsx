import { cleanup, fireEvent, render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import FeaturesSection from './FeaturesSection'

let observerInstances = []
const originalIntersectionObserver = globalThis.IntersectionObserver

class ControlledIntersectionObserver {
  constructor(callback) {
    this.callback = callback
    this.targets = new Set()
    observerInstances.push(this)
  }

  observe(target) {
    this.targets.add(target)
  }

  unobserve(target) {
    this.targets.delete(target)
  }

  disconnect() {
    this.targets.clear()
  }
}

function renderFeaturesSection() {
  return render(
    <MemoryRouter>
      <FeaturesSection />
    </MemoryRouter>,
  )
}

function triggerSectionIntersection(isIntersecting) {
  const section = document.querySelector('#nossas-solucoes')
  const instance = observerInstances.find((candidate) => candidate.targets.has(section))

  act(() => {
    instance.callback([{ isIntersecting, target: section }])
  })
}

function getDetailCardTitle() {
  return document.querySelector('#nossas-solucoes h3.font-display')?.textContent
}

beforeEach(() => {
  observerInstances = []
  globalThis.IntersectionObserver = ControlledIntersectionObserver
  vi.useFakeTimers()
})

describe('FeaturesSection mobile navigation', () => {
  it('uses the full mobile navigation width with arrows only', () => {
    renderFeaturesSection()

    const mobileNavigation = screen.getByTestId('features-mobile-card-navigation')
    const previousButton = screen.getByRole('button', { name: 'Solucao anterior' })
    const nextButton = screen.getByRole('button', { name: 'Proxima solucao' })

    expect(mobileNavigation).toHaveClass('w-full', 'justify-between')
    expect(mobileNavigation).not.toHaveClass('w-fit')
    expect(mobileNavigation).not.toHaveClass('self-center')
    expect(mobileNavigation).not.toHaveClass('justify-center')
    expect([...mobileNavigation.children]).toEqual([previousButton, nextButton])
    expect(mobileNavigation).not.toHaveTextContent(/\d\s*\/\s*\d/)
    ;[previousButton, nextButton].forEach((button) => {
      expect(button).toHaveClass('border-neutral-200', 'bg-white', 'text-neutral-500')
      expect(button).not.toHaveClass('bg-red-50', 'text-brand-red')
    })
  })

  it('uses footer mobile controls to navigate between solution cards', () => {
    renderFeaturesSection()

    const detailPanel = document.querySelector('#nossas-solucoes .feature-detail-panel-transition')
    const detailHeader = document.querySelector('#nossas-solucoes .feature-detail-transition__header')
    const mobileNavigation = screen.getByTestId('features-mobile-card-navigation')

    expect(mobileNavigation).toHaveClass('lg:hidden')
    expect(mobileNavigation).toHaveClass('feature-detail-mobile-footer-nav')
    expect(detailPanel).toContainElement(mobileNavigation)
    expect(mobileNavigation.compareDocumentPosition(detailHeader) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
    expect(mobileNavigation).not.toHaveTextContent(/\d\s*\/\s*\d/)
    expect(mobileNavigation.compareDocumentPosition(document.querySelector('#nossas-solucoes a.btn-primary')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    const nextButton = screen.getByRole('button', { name: 'Proxima solucao' })
    nextButton.focus()
    fireEvent.click(nextButton)

    expect(getDetailCardTitle()).toMatch(/^Gest/)
    expect(screen.getByTestId('features-mobile-card-navigation')).toBe(mobileNavigation)
    expect(screen.getByRole('button', { name: 'Proxima solucao' })).toBe(nextButton)
    expect(document.activeElement).toBe(nextButton)
    expect(mobileNavigation).not.toHaveTextContent(/\d\s*\/\s*\d/)

    fireEvent.click(screen.getByRole('button', { name: 'Solucao anterior' }))

    expect(getDetailCardTitle()).toMatch(/^Diagn/)
  })

  it('centers the mobile CTA and sends every card to contact', () => {
    renderFeaturesSection()

    const cta = document.querySelector('#nossas-solucoes a.btn-primary')
    const nextButton = screen.getByRole('button', { name: 'Proxima solucao' })

    expect(cta).toHaveClass('justify-center', 'lg:justify-start')
    expect(cta).toHaveAttribute('href', '/contato')

    fireEvent.click(nextButton)
    fireEvent.click(nextButton)
    fireEvent.click(nextButton)

    expect(cta).toHaveAttribute('href', '/contato')
  })

  it('places the detail icon beside enlarged title and subtitle on mobile', () => {
    renderFeaturesSection()

    const detailHeader = document.querySelector('#nossas-solucoes .feature-detail-transition__header')
    const title = detailHeader.querySelector('h3')
    const subtitle = detailHeader.querySelector('p')
    const icon = detailHeader.querySelector('.feature-detail-mobile-icon')

    expect(detailHeader).toHaveClass('flex', 'items-center', 'gap-4')
    expect(icon).toHaveClass('mb-0')
    expect(title).toHaveClass('text-2xl', 'md:text-3xl')
    expect(subtitle).toHaveClass('text-base')
  })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  globalThis.IntersectionObserver = originalIntersectionObserver
})

describe('FeaturesSection', () => {
  it('keeps cards static until the user selects another card', () => {
    renderFeaturesSection()

    act(() => {
      vi.advanceTimersByTime(12000)
    })

    expect(getDetailCardTitle()).toBe('Diagnóstico')

    triggerSectionIntersection(true)

    act(() => {
      vi.advanceTimersByTime(12000)
    })

    expect(getDetailCardTitle()).toBe('Diagnóstico')

    fireEvent.click(screen.getByRole('button', { name: 'Gestão estratégica' }))

    expect(getDetailCardTitle()).toBe('Gestão estratégica')
  })

  it('does not render an internal scroll container inside the detail card', () => {
    renderFeaturesSection()

    expect(document.querySelector('#nossas-solucoes .overflow-y-auto')).toBeNull()
  })

  it('uses the requested section background color', () => {
    renderFeaturesSection()

    const section = document.querySelector('#nossas-solucoes')

    expect(section).toHaveClass('bg-[#EFEFF4]')
    expect(section).toHaveClass('w-screen', 'left-1/2', '-ml-[50vw]', '-mr-[50vw]')
    expect(section.querySelector('.home-menu-shell')).toBeInTheDocument()
  })

  it('shows only titles in the side selector cards', () => {
    renderFeaturesSection()

    const firstSelector = screen.getByRole('button', {
      name: 'Diagnóstico',
    })

    expect(firstSelector).not.toHaveTextContent('Identifica quais processos')
    expect(firstSelector.style.backgroundImage).toBe('')
    expect(firstSelector).toHaveClass('px-5', 'py-5', 'md:py-6')
    expect(firstSelector.querySelector('h3')).toHaveClass('text-[15px]', 'md:text-base')
    expect(firstSelector.querySelector('h3')).toHaveClass('leading-snug')
    expect(firstSelector.querySelector('.stroke-\\[2\\.4\\]')).toBeInTheDocument()
    expect(firstSelector.querySelector('.text-brand-red')).toBeInTheDocument()
    expect(firstSelector).not.toHaveClass('feature-selector-card--selected')
    expect(firstSelector.querySelector('.feature-selector-card__icon')).not.toBeInTheDocument()
    expect(firstSelector.querySelector('.feature-selector-card__title')).not.toBeInTheDocument()
  })

  it('animates only the detail panel content when a card is selected', () => {
    renderFeaturesSection()

    const detailPanel = document.querySelector('#nossas-solucoes .feature-detail-transition')
    const detailPanelShell = document.querySelector('#nossas-solucoes .feature-detail-panel-transition')
    const detailHeader = document.querySelector('#nossas-solucoes .feature-detail-transition__header')
    const animatedItems = document.querySelectorAll('#nossas-solucoes .feature-detail-transition__item')
    const selectorAnimation = document.querySelector('#nossas-solucoes .feature-selector-card--selected')

    expect(detailPanelShell).toBeInTheDocument()
    expect(detailPanel).toBeInTheDocument()
    expect(detailHeader).toBeInTheDocument()
    expect(animatedItems).toHaveLength(2)
    expect(animatedItems[0]).toHaveTextContent('Processo')
    expect(animatedItems[1]).toHaveTextContent('Resultados')
    expect(selectorAnimation).not.toBeInTheDocument()
  })

  it('keeps active selector and detail content heights stable between cards', () => {
    renderFeaturesSection()

    const activeSelector = screen.getByRole('button', {
      name: 'Diagnóstico',
    })
    const detailPanelShell = document.querySelector('#nossas-solucoes .feature-detail-panel-transition')

    expect(activeSelector).not.toHaveClass('scale-[1.01]')
    expect(activeSelector).toHaveClass('bg-white')
    expect(activeSelector).toHaveClass('border-[#5a6572]/28')
    expect(activeSelector).not.toHaveClass('lg:rounded-r-none', 'lg:border-r-0')
    expect(activeSelector.querySelector('svg.absolute')).not.toBeInTheDocument()
    expect(detailPanelShell).toBeInTheDocument()
    expect(detailPanelShell).toHaveClass('lg:min-h-[540px]', 'lg:max-h-[540px]')
    expect(document.querySelector('#nossas-solucoes .lg\\:rounded-l-none')).not.toBeInTheDocument()
    expect(document.querySelector('#nossas-solucoes .lg\\:border-l-0')).not.toBeInTheDocument()
  })

  it('keeps inactive selector cards white without hover animation', () => {
    renderFeaturesSection()

    const inactiveSelector = screen.getByRole('button', {
      name: 'Gestão estratégica',
    })

    expect(inactiveSelector).toHaveClass('bg-white')
    expect(inactiveSelector).not.toHaveClass('lg:w-[calc(100%-1.5rem)]')
    expect(inactiveSelector.className).not.toContain('hover:')
    expect(inactiveSelector.querySelector('.pillar-hover-fill')).not.toBeInTheDocument()
    expect(inactiveSelector.querySelector('.pillar-hover-exit-fill')).not.toBeInTheDocument()
  })
})
