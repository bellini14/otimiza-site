import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BlogHighlights } from './blog-highlights'
import { ProjectCard } from './project-card'
import { staticBlogPosts } from '../../data/blogPosts'
import { client } from '@/lib/sanity'
import { clearCachedInspirePosts, getCachedInspirePosts } from '../../lib/inspirePostCache'

vi.mock('@/lib/sanity', () => ({
  client: {
    fetch: vi.fn(),
  },
}))

beforeEach(() => {
  clearCachedInspirePosts()
  client.fetch.mockResolvedValue([])
  vi.useFakeTimers()
})

afterEach(() => {
  clearCachedInspirePosts()
  vi.runOnlyPendingTimers()
  vi.useRealTimers()
  cleanup()
})

describe('BlogHighlights', () => {
  it('renders the blog section heading and article links', () => {
    window.innerWidth = 1440

    render(
      <MemoryRouter>
        <BlogHighlights />
      </MemoryRouter>,
    )

    const heading = screen.getByRole('heading', { name: /inspire\. conteúdo de vanguarda/i })
    const section = heading.closest('section')
    const headerContainer = heading.parentElement?.parentElement?.parentElement

    expect(heading).toBeInTheDocument()
    expect(headerContainer).toHaveClass('home-menu-shell')
    expect(section?.className).toMatch(/bg-\[#EFEFF4\]/)
    expect(section).toHaveClass('pt-16', 'pb-12', 'sm:pt-24', 'sm:pb-16')
    expect(section).not.toHaveClass('py-16', 'sm:py-24')
    expect(screen.getByTestId('blog-drag-hint')).toHaveTextContent('Arrastar')
    expect(screen.getAllByRole('link', { name: /ler artigo|explorar inspire/i }).length).toBeGreaterThanOrEqual(4)
    expect(screen.getByTestId('blog-header-cta')).toHaveAttribute('href', '/inspire')
    expect(screen.queryByText('Inspire', { exact: true })).not.toBeInTheDocument()
    expect(screen.queryByText(/10 posts selecionados/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/\d{2}-\d{2}\s*\/\s*\d{2}/)).not.toBeInTheDocument()
    expect(screen.getByTestId('blog-slider-stage')).toHaveClass('overflow-hidden')
  })

  it('lets visitors drag the existing Inspire cards with the Cases carousel behavior', () => {
    window.innerWidth = 1440

    render(
      <MemoryRouter>
        <BlogHighlights />
      </MemoryRouter>,
    )

    const shell = screen.getByTestId('blog-slider-stage')
    const track = screen.getByTestId('blog-slider-track')
    const firstArticleLink = screen.getAllByRole('link', { name: /ler artigo/i })[0]

    Object.defineProperties(shell, {
      clientWidth: { configurable: true, value: 900 },
    })
    Object.defineProperties(track, {
      scrollWidth: { configurable: true, value: 1800 },
    })

    expect(screen.getAllByTestId('blog-slide')).toHaveLength(staticBlogPosts.length)
    expect(shell).toHaveClass(
      'left-1/2',
      'right-1/2',
      '-ml-[50vw]',
      '-mr-[50vw]',
      'w-screen',
      'overflow-hidden',
    )
    expect(screen.getAllByTestId('blog-carousel-fade')).toHaveLength(2)
    expect(screen.getAllByTestId('blog-carousel-edge-spacer')).toHaveLength(2)
    expect(track).toHaveClass('cursor-grab')
    expect(screen.getByTestId('blog-drag-hint')).toHaveTextContent('Arrastar')
    expect(firstArticleLink.closest('article')).not.toHaveClass('hover:-translate-y-2')
    expect(firstArticleLink.closest('article')?.querySelector('img')).not.toHaveClass('group-hover:scale-110')

    fireEvent.pointerDown(track, { pointerId: 1, clientX: 600, clientY: 180 })
    fireEvent.pointerMove(track, { pointerId: 1, clientX: 460, clientY: 180 })

    expect(track).toHaveClass('cursor-grabbing')
    expect(track).toHaveStyle({ transform: 'translateX(-134.4px)' })
    expect(track).toHaveStyle({ touchAction: 'pan-y', userSelect: 'none' })
    expect(screen.getByTestId('blog-drag-arrow')).toHaveStyle({
      transform: 'rotate(180deg) scale(1.12)',
    })

    fireEvent.pointerUp(track, { pointerId: 1 })
    expect(track).toHaveClass('cursor-grab')

    fireEvent.pointerDown(firstArticleLink, { pointerId: 2, clientX: 500, clientY: 180 })
    expect(track).toHaveClass('cursor-grab')
  })

  it('starts the Inspire carousel centered on mobile without side fades', () => {
    window.innerWidth = 390

    render(
      <MemoryRouter>
        <BlogHighlights />
      </MemoryRouter>,
    )

    const fades = screen.getAllByTestId('blog-carousel-fade')
    const edgeSpacers = screen.getAllByTestId('blog-carousel-edge-spacer')
    const firstSlide = screen.getAllByTestId('blog-slide')[0]
    const track = screen.getByTestId('blog-slider-track')

    fades.forEach((fade) => {
      expect(fade).toHaveClass('blog-carousel-fade')
    })
    edgeSpacers.forEach((spacer) => {
      expect(spacer).toHaveClass('blog-carousel-edge-spacer')
    })
    expect(firstSlide).toHaveClass('blog-slide')
    expect(track).toHaveAttribute('data-mobile-snap', 'true')
    expect(track).toHaveStyle({ transform: 'translateX(0px)', touchAction: 'pan-y' })
  })

  it('uses stronger touch movement and snap metadata for mobile dragging', () => {
    window.innerWidth = 390

    render(
      <MemoryRouter>
        <BlogHighlights />
      </MemoryRouter>,
    )

    const shell = screen.getByTestId('blog-slider-stage')
    const track = screen.getByTestId('blog-slider-track')

    Object.defineProperties(shell, {
      clientWidth: { configurable: true, value: 390 },
    })
    Object.defineProperties(track, {
      scrollWidth: { configurable: true, value: 1600 },
    })

    fireEvent.pointerDown(track, { pointerId: 1, pointerType: 'touch', clientX: 390, clientY: 220 })
    fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 195, clientY: 220 })

    expect(track).toHaveAttribute('data-mobile-snap', 'true')
    expect(track).toHaveStyle({ transform: 'translateX(-151.25px)' })
  })

  it('maps a full-width mobile drag to the full carousel distance', () => {
    window.innerWidth = 390

    render(
      <MemoryRouter>
        <BlogHighlights />
      </MemoryRouter>,
    )

    const shell = screen.getByTestId('blog-slider-stage')
    const track = screen.getByTestId('blog-slider-track')

    Object.defineProperties(shell, {
      clientWidth: { configurable: true, value: 390 },
    })
    Object.defineProperties(track, {
      scrollWidth: { configurable: true, value: 1600 },
    })

    fireEvent.pointerDown(track, { pointerId: 1, pointerType: 'touch', clientX: 390, clientY: 220 })
    fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 0, clientY: 220 })

    expect(track).toHaveStyle({ transform: 'translateX(-302.5px)' })
  })

  it('lets visitors scroll vertically through the mobile carousel area', () => {
    window.innerWidth = 390

    render(
      <MemoryRouter>
        <BlogHighlights />
      </MemoryRouter>,
    )

    const shell = screen.getByTestId('blog-slider-stage')
    const track = screen.getByTestId('blog-slider-track')

    Object.defineProperties(shell, {
      clientWidth: { configurable: true, value: 390 },
    })
    Object.defineProperties(track, {
      scrollWidth: { configurable: true, value: 1600 },
    })

    fireEvent.pointerDown(track, { pointerId: 1, pointerType: 'touch', clientX: 220, clientY: 220 })
    fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 214, clientY: 320 })
    fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 210, clientY: 410 })
    fireEvent.pointerUp(track, { pointerId: 1, pointerType: 'touch' })

    expect(track).toHaveStyle({ transform: 'translateX(0px)' })
    expect(track).toHaveClass('cursor-grab')
  })

  it('does not hijack a diagonal mobile gesture intended for page scroll', () => {
    window.innerWidth = 390

    render(
      <MemoryRouter>
        <BlogHighlights />
      </MemoryRouter>,
    )

    const shell = screen.getByTestId('blog-slider-stage')
    const track = screen.getByTestId('blog-slider-track')

    Object.defineProperties(shell, {
      clientWidth: { configurable: true, value: 390 },
    })
    Object.defineProperties(track, {
      scrollWidth: { configurable: true, value: 1600 },
    })

    fireEvent.pointerDown(track, { pointerId: 1, pointerType: 'touch', clientX: 260, clientY: 220 })
    fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 225, clientY: 250 })
    fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 212, clientY: 292 })
    fireEvent.pointerUp(track, { pointerId: 1, pointerType: 'touch' })

    expect(track).toHaveStyle({ transform: 'translateX(0px)' })
  })

  it('lets a stronger mobile swipe settle on the nearest card after inertia', () => {
    window.innerWidth = 390

    render(
      <MemoryRouter>
        <BlogHighlights />
      </MemoryRouter>,
    )

    const shell = screen.getByTestId('blog-slider-stage')
    const track = screen.getByTestId('blog-slider-track')

    Object.defineProperties(shell, {
      clientWidth: { configurable: true, value: 390 },
    })
    Object.defineProperties(track, {
      scrollWidth: { configurable: true, value: 1600 },
    })

    fireEvent.pointerDown(track, { pointerId: 1, pointerType: 'touch', clientX: 310, clientY: 220 })
    fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 190, clientY: 220 })
    fireEvent.pointerUp(track, { pointerId: 1, pointerType: 'touch' })

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(track).toHaveStyle({ transform: 'translateX(-748px)' })
  })

  it('centers the actual post card geometry when snapping on mobile', () => {
    window.innerWidth = 390

    render(
      <MemoryRouter>
        <BlogHighlights />
      </MemoryRouter>,
    )

    const shell = screen.getByTestId('blog-slider-stage')
    const track = screen.getByTestId('blog-slider-track')
    const slides = screen.getAllByTestId('blog-slide')

    Object.defineProperties(shell, {
      clientWidth: { configurable: true, value: 390 },
    })
    Object.defineProperties(track, {
      scrollWidth: { configurable: true, value: 1600 },
    })
    Object.defineProperties(slides[0], {
      offsetLeft: { configurable: true, value: 30 },
      offsetWidth: { configurable: true, value: 330 },
    })
    Object.defineProperties(slides[1], {
      offsetLeft: { configurable: true, value: 392 },
      offsetWidth: { configurable: true, value: 330 },
    })

    fireEvent.pointerDown(track, { pointerId: 1, pointerType: 'touch', clientX: 310, clientY: 220 })
    fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 190, clientY: 220 })
    fireEvent.pointerUp(track, { pointerId: 1, pointerType: 'touch' })

    expect(track).not.toHaveStyle({ transform: 'translateX(-362px)' })

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(track).toHaveStyle({ transform: 'translateX(-362px)' })
  })

  it('snaps a short slow mobile drag back to the nearest centered card', () => {
    window.innerWidth = 390

    render(
      <MemoryRouter>
        <BlogHighlights />
      </MemoryRouter>,
    )

    const shell = screen.getByTestId('blog-slider-stage')
    const track = screen.getByTestId('blog-slider-track')
    const slides = screen.getAllByTestId('blog-slide')

    Object.defineProperties(shell, {
      clientWidth: { configurable: true, value: 390 },
    })
    Object.defineProperties(track, {
      scrollWidth: { configurable: true, value: 1600 },
    })
    Object.defineProperties(slides[0], {
      offsetLeft: { configurable: true, value: 30 },
      offsetWidth: { configurable: true, value: 330 },
    })
    Object.defineProperties(slides[1], {
      offsetLeft: { configurable: true, value: 392 },
      offsetWidth: { configurable: true, value: 330 },
    })

    fireEvent.pointerDown(track, { pointerId: 1, pointerType: 'touch', clientX: 310, clientY: 220 })
    fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 270, clientY: 220 })
    fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 268, clientY: 220 })
    fireEvent.pointerUp(track, { pointerId: 1, pointerType: 'touch' })

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(track).toHaveStyle({ transform: 'translateX(0px)' })
  })

  it('keeps a fast mobile flick responsive before the final snap', () => {
    window.innerWidth = 390

    render(
      <MemoryRouter>
        <BlogHighlights />
      </MemoryRouter>,
    )

    const shell = screen.getByTestId('blog-slider-stage')
    const track = screen.getByTestId('blog-slider-track')

    Object.defineProperties(shell, {
      clientWidth: { configurable: true, value: 390 },
    })
    Object.defineProperties(track, {
      scrollWidth: { configurable: true, value: 1600 },
    })

    fireEvent.pointerDown(track, { pointerId: 1, pointerType: 'touch', clientX: 330, clientY: 220 })
    fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 290, clientY: 220 })
    fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 170, clientY: 220 })
    fireEvent.pointerUp(track, { pointerId: 1, pointerType: 'touch' })

    act(() => {
      vi.advanceTimersByTime(160)
    })

    const translate = Number(track.style.transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/)?.[1])

    expect(translate).toBeLessThan(-360)
  })

  it('lets a stronger flick travel across more mobile cards', () => {
    window.innerWidth = 390

    render(
      <MemoryRouter>
        <BlogHighlights />
      </MemoryRouter>,
    )

    const shell = screen.getByTestId('blog-slider-stage')
    const track = screen.getByTestId('blog-slider-track')

    Object.defineProperties(shell, {
      clientWidth: { configurable: true, value: 390 },
    })
    Object.defineProperties(track, {
      scrollWidth: { configurable: true, value: 2000 },
    })

    fireEvent.pointerDown(track, { pointerId: 1, pointerType: 'touch', clientX: 360, clientY: 220 })
    fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 300, clientY: 220 })
    fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 80, clientY: 220 })
    fireEvent.pointerUp(track, { pointerId: 1, pointerType: 'touch' })

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(track).toHaveStyle({ transform: 'translateX(-1122px)' })
  })

  it('stores fetched Sanity posts in the shared Inspire cache', async () => {
    window.innerWidth = 1440
    client.fetch.mockResolvedValue([
      {
        title: 'Cached from Home',
        description: 'Descricao dinamica',
        imgSrc: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
        link: '/inspire/cached-from-home',
        slug: 'cached-from-home',
        eyebrow: 'Sanity',
        publishedAt: '2026-04-15T12:00:00Z',
        linkText: 'Ler artigo',
      },
    ])

    render(
      <MemoryRouter>
        <BlogHighlights />
      </MemoryRouter>,
    )

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(getCachedInspirePosts()[0]?.title).toBe('Cached from Home')
  })

  it('keeps the blog cards minimal and without shadow utilities', () => {
    const { container } = render(
      <MemoryRouter>
        <ProjectCard
          title="Teste"
          description="Descricao"
          imgSrc="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"
          link="/inspire"
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

  it('renders compact Inspire card sizing only on mobile', () => {
    const { container } = render(
      <MemoryRouter>
        <ProjectCard
          compact
          title="Titulo com tamanho controlado"
          description="Resumo longo para confirmar que o card compacto limita o texto e evita que a descricao empurre a altura do card para criar espacos em branco grandes no carrossel."
          imgSrc="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"
          link="/inspire"
          linkText="Ler artigo"
        />
      </MemoryRouter>,
    )

    const article = container.querySelector('article')
    const imageWrap = container.querySelector('[data-testid="project-card-image-wrap"]')
    const description = container.querySelector('[data-testid="project-card-description"]')

    expect(article).toHaveClass('h-full')
    expect(imageWrap).toHaveClass('aspect-video')
    expect(description).toHaveClass('line-clamp-4', 'sm:line-clamp-none', 'sm:flex-1')
    expect(description.className.split(' ')).not.toContain('flex-1')
  })
})
