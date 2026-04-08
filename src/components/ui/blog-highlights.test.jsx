import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BlogHighlights } from './blog-highlights'
import { ProjectCard } from './project-card'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.runOnlyPendingTimers()
  vi.useRealTimers()
  cleanup()
})

function getVisibleSlideTitles() {
  return Array.from(document.querySelectorAll('[data-testid="blog-slide"][data-visible="true"] h3')).map(
    (heading) => heading.textContent,
  )
}

describe('BlogHighlights', () => {
  it('renders the blog section heading and article links', () => {
    window.innerWidth = 1440

    render(
      <MemoryRouter>
        <BlogHighlights />
      </MemoryRouter>,
    )

    const heading = screen.getByRole('heading', { name: /insights para quem opera no longo prazo/i })
    const section = heading.closest('section')

    expect(heading).toBeInTheDocument()
    expect(section?.className).toMatch(/bg-\[#EFEFF4\]/)
    expect(screen.getByRole('button', { name: /post anterior/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /proximo post/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /ler artigo|ver todos os artigos/i }).length).toBeGreaterThanOrEqual(4)
    expect(screen.getByRole('link', { name: /ver todos os artigos/i })).toHaveAttribute('href', '/insights-e-blog')
    expect(screen.getByTestId('blog-slider-stage').className).toMatch(/overflow-y-visible/)
  })

  it('navigates through a larger list of posts with arrow controls', () => {
    window.innerWidth = 1440

    render(
      <MemoryRouter>
        <BlogHighlights />
      </MemoryRouter>,
    )

    const previousButton = screen.getByRole('button', { name: /post anterior/i })
    const nextButton = screen.getByRole('button', { name: /proximo post/i })
    const track = screen.getByTestId('blog-slider-track')

    expect(screen.getAllByTestId('blog-slide')).toHaveLength(10)
    expect(screen.getByTestId('blog-slider-stage')).toHaveAttribute('data-phase', 'idle')
    expect(screen.getByTestId('blog-slider-stage')).toHaveAttribute('data-current-index', '0')
    expect(track).toHaveAttribute('data-animating', 'false')
    expect(previousButton).toBeDisabled()
    expect(nextButton).not.toBeDisabled()

    expect(getVisibleSlideTitles()).toContain('Como transformar gargalos operacionais em vantagem competitiva')
    expect(getVisibleSlideTitles()).not.toContain('Playbooks enxutos para times comerciais mais previsiveis')

    fireEvent.click(nextButton)

    expect(screen.getByTestId('blog-slider-stage')).toHaveAttribute('data-phase', 'animating')
    expect(screen.getByTestId('blog-slider-stage')).toHaveAttribute('data-current-index', '1')
    expect(track).toHaveAttribute('data-animating', 'true')
    expect(previousButton).toBeDisabled()
    expect(nextButton).toBeDisabled()
    expect(getVisibleSlideTitles()).toEqual([
      'Governanca orientada por dados para times que precisam escalar',
      'Automacao com impacto real: onde investir primeiro',
      'Rituais de gestao que reduzem ruido e aceleram resposta',
    ])

    fireEvent.click(nextButton)
    expect(screen.getByTestId('blog-slider-stage')).toHaveAttribute('data-current-index', '1')

    fireEvent.transitionEnd(track, { propertyName: 'transform' })

    expect(screen.getByTestId('blog-slider-stage')).toHaveAttribute('data-phase', 'idle')
    expect(track).toHaveAttribute('data-animating', 'false')
    expect(previousButton).not.toBeDisabled()
    expect(nextButton).not.toBeDisabled()

    for (let step = 0; step < 6; step += 1) {
      fireEvent.click(nextButton)
      fireEvent.transitionEnd(track, { propertyName: 'transform' })
    }

    expect(getVisibleSlideTitles()).toContain('Playbooks enxutos para times comerciais mais previsiveis')
    expect(nextButton).toBeDisabled()

    fireEvent.click(previousButton)

    expect(screen.getByTestId('blog-slider-stage')).toHaveAttribute('data-phase', 'animating')
    expect(previousButton).toBeDisabled()
    expect(nextButton).toBeDisabled()

    fireEvent.transitionEnd(track, { propertyName: 'transform' })
    expect(getVisibleSlideTitles()).toContain('Onde a automacao falha quando o processo ainda esta errado')
    expect(nextButton).not.toBeDisabled()
  })

  it('releases the animation lock via fallback timer when transitionend does not fire', () => {
    window.innerWidth = 1440

    render(
      <MemoryRouter>
        <BlogHighlights />
      </MemoryRouter>,
    )

    const nextButton = screen.getByRole('button', { name: /proximo post/i })

    fireEvent.click(nextButton)
    expect(nextButton).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(screen.getByTestId('blog-slider-stage')).toHaveAttribute('data-phase', 'idle')
    expect(nextButton).not.toBeDisabled()
  })

  it('keeps the blog cards minimal and without shadow utilities', () => {
    const { container } = render(
      <MemoryRouter>
        <ProjectCard
          title="Teste"
          description="Descricao"
          imgSrc="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"
          link="/insights-e-blog"
          linkText="Ler artigo"
        />
      </MemoryRouter>,
    )

    const article = container.querySelector('article')
    const cta = screen.getByRole('link', { name: /ler artigo/i })

    expect(article?.className).not.toMatch(/shadow/)
    expect(article?.className).toMatch(/hover:-translate-y-2/)
    expect(cta.className).not.toMatch(/text-brand-red/)
  })
})
