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

    expect(section).toHaveClass('bg-white')
    expect(section).toHaveClass('w-screen', 'left-1/2', '-ml-[50vw]', '-mr-[50vw]')
    expect(section.querySelector('.max-w-\\[1320px\\]')).toBeInTheDocument()
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
    expect(animatedItems.length).toBeGreaterThan(2)
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
