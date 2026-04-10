import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BlogHighlights } from './blog-highlights'
import { ProjectCard } from './project-card'
import { staticBlogPosts } from '../../data/blogPosts'

const STAGE_GAP_PX = 24

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

    expect(screen.getAllByTestId('blog-slide')).toHaveLength(staticBlogPosts.length)
    expect(screen.getByTestId('blog-slider-stage')).toHaveAttribute('data-phase', 'idle')
    expect(screen.getByTestId('blog-slider-stage')).toHaveAttribute('data-current-index', '0')
    expect(track).toHaveAttribute('data-animating', 'false')
    expect(previousButton).toBeDisabled()
    expect(nextButton).not.toBeDisabled()

    expect(getVisibleSlideTitles()).toEqual(staticBlogPosts.slice(0, 3).map((post) => post.title))
    expect(getVisibleSlideTitles()).not.toContain(staticBlogPosts.at(-1).title)

    fireEvent.click(nextButton)

    expect(track.style.transform).toBe(`translate3d(calc(-${(1 / 3) * 100}% - ${STAGE_GAP_PX / 3}px), 0, 0)`)
    expect(screen.getByTestId('blog-slider-stage')).toHaveAttribute('data-phase', 'animating')
    expect(screen.getByTestId('blog-slider-stage')).toHaveAttribute('data-current-index', '1')
    expect(track).toHaveAttribute('data-animating', 'true')
    expect(previousButton).toBeDisabled()
    expect(nextButton).toBeDisabled()
    expect(getVisibleSlideTitles()).toEqual(staticBlogPosts.slice(1, 4).map((post) => post.title))

    fireEvent.click(nextButton)
    expect(screen.getByTestId('blog-slider-stage')).toHaveAttribute('data-current-index', '1')

    fireEvent.transitionEnd(track, { propertyName: 'transform' })

    expect(screen.getByTestId('blog-slider-stage')).toHaveAttribute('data-phase', 'idle')
    expect(track).toHaveAttribute('data-animating', 'false')
    expect(previousButton).not.toBeDisabled()
    expect(nextButton).not.toBeDisabled()

    const maxDesktopIndex = staticBlogPosts.length - 3

    for (let step = 0; step < maxDesktopIndex - 1; step += 1) {
      fireEvent.click(nextButton)
      fireEvent.transitionEnd(track, { propertyName: 'transform' })
    }

    expect(getVisibleSlideTitles()).toContain(staticBlogPosts.at(-1).title)
    expect(nextButton).toBeDisabled()

    fireEvent.click(previousButton)

    expect(screen.getByTestId('blog-slider-stage')).toHaveAttribute('data-phase', 'animating')
    expect(previousButton).toBeDisabled()
    expect(nextButton).toBeDisabled()

    fireEvent.transitionEnd(track, { propertyName: 'transform' })
    expect(getVisibleSlideTitles()).toContain(staticBlogPosts.at(-2).title)
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
