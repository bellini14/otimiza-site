import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StaggerTestimonials } from './stagger-testimonials'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function renderCarousel(props = {}) {
  return render(
    <MemoryRouter>
      <StaggerTestimonials {...props} />
    </MemoryRouter>,
  )
}

describe('StaggerTestimonials', () => {
  it('uses dragging as the only carousel navigation', () => {
    renderCarousel()

    expect(screen.queryByRole('button', { name: 'Depoimento anterior' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Próximo depoimento' })).not.toBeInTheDocument()
    expect(screen.getByTestId('home-cases-carousel')).toHaveClass('cursor-grab', 'touch-pan-y')
    expect(screen.getByTestId('home-cases-track')).toBeInTheDocument()
  })

  it('shows a cursor-following drag hint with directional feedback', () => {
    renderCarousel()
    const carousel = screen.getByTestId('home-cases-carousel')
    const hint = screen.getByTestId('home-cases-drag-hint')
    const arrow = screen.getByTestId('home-cases-drag-arrow')

    expect(hint).toHaveTextContent('Arrastar')
    expect(hint).toHaveClass('fixed', 'z-[9999]', 'inline-flex')
    expect(hint).not.toHaveClass('hidden')

    fireEvent.pointerMove(carousel, { pointerId: 3, pointerType: 'mouse', clientX: 100, clientY: 50 })
    expect(hint).toHaveStyle({ transform: 'translateX(114px) translateY(62px) scale(0.92)' })
    expect(hint).toHaveClass('opacity-100')

    act(() => {
      fireEvent.pointerDown(carousel, { pointerId: 3, clientX: 300, clientY: 100 })
      fireEvent.pointerMove(carousel, { pointerId: 3, clientX: 220, clientY: 100 })
    })

    expect(arrow).toHaveStyle({ transform: 'rotate(180deg) scale(1.12)' })
    expect(screen.getAllByTestId('home-case-card').find((card) => card.dataset.carouselActive === 'true')).toHaveAttribute('data-dragging', 'true')
  })

  it('renders three copies so the drag loop can recenter without a visible gap', () => {
    renderCarousel()

    const cards = screen.getAllByTestId('home-case-card')

    expect(cards).toHaveLength(30)
    expect(cards.filter((card) => card.dataset.carouselActive === 'true')).toHaveLength(1)
  })

  it('centers the mobile cards from the carousel width instead of viewport units', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function getClientWidth() {
      return this.dataset?.testid === 'home-cases-carousel' ? 390 : 0
    })

    renderCarousel()

    await waitFor(() => {
      expect(screen.getByTestId('home-cases-track')).toHaveStyle({ paddingInline: '57px' })
    })
  })

  it('clamps summaries at every viewport size so they cannot collide with company details', () => {
    renderCarousel()

    const activeCard = screen.getAllByTestId('home-case-card').find((card) => card.dataset.carouselActive === 'true')
    const summary = activeCard.querySelector('[data-testid="home-case-summary"]')
    const details = activeCard.querySelector('[data-testid="home-case-details"]')
    const logo = activeCard.querySelector('img')

    expect(activeCard).toHaveClass('p-7', 'sm:p-8')
    expect(summary).toHaveClass('text-[0.92rem]', 'sm:text-lg', 'line-clamp-4', 'sm:line-clamp-5')
    expect(details).toHaveClass('bottom-7', 'left-7', 'right-7', 'sm:bottom-8', 'sm:left-8', 'sm:right-8')
    expect(logo).toHaveClass('max-h-10', 'max-w-[8.5rem]', 'sm:max-h-12', 'sm:max-w-[10rem]')
  })

  it('reveals a stronger preview of the neighboring cards on mobile', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function getClientWidth() {
      return this.dataset?.testid === 'home-cases-carousel' ? 390 : 0
    })

    renderCarousel()

    await waitFor(() => {
      const track = screen.getByTestId('home-cases-track')
      const sidePadding = Number.parseFloat(track.style.paddingInline)
      const cardGap = Number.parseFloat(track.style.gap)

      expect(sidePadding - cardGap).toBeGreaterThanOrEqual(40)
    })
  })

  it('moves farther than the finger on touch drags so mobile swipes feel responsive', () => {
    renderCarousel()
    const carousel = screen.getByTestId('home-cases-carousel')
    const initialScrollLeft = carousel.scrollLeft

    act(() => {
      fireEvent.pointerDown(carousel, { pointerId: 7, pointerType: 'touch', clientX: 300, clientY: 200 })
      fireEvent.pointerMove(carousel, { pointerId: 7, pointerType: 'touch', clientX: 220, clientY: 200 })
    })

    expect(carousel.scrollLeft - initialScrollLeft).toBeGreaterThan(80)
  })

  it('does not hijack vertical touch scrolling inside the mobile carousel', () => {
    renderCarousel()
    const carousel = screen.getByTestId('home-cases-carousel')
    const initialScrollLeft = carousel.scrollLeft

    act(() => {
      fireEvent.pointerDown(carousel, { pointerId: 9, pointerType: 'touch', clientX: 250, clientY: 220 })
      fireEvent.pointerMove(carousel, { pointerId: 9, pointerType: 'touch', clientX: 258, clientY: 340 })
    })

    expect(carousel.scrollLeft).toBe(initialScrollLeft)
    expect(carousel).toHaveClass('cursor-grab')
    expect(screen.getAllByTestId('home-case-card').find((card) => card.dataset.carouselActive === 'true')).toHaveAttribute('data-dragging', 'false')
  })

  it('settles a short touch swipe into a single-card snap', () => {
    vi.useFakeTimers()
    renderCarousel()
    const carousel = screen.getByTestId('home-cases-carousel')
    const initialScrollLeft = carousel.scrollLeft
    const cardInterval = Number(carousel.dataset.cardInterval)

    act(() => {
      fireEvent.pointerDown(carousel, { pointerId: 10, pointerType: 'touch', clientX: 300, clientY: 200 })
      fireEvent.pointerMove(carousel, { pointerId: 10, pointerType: 'touch', clientX: 220, clientY: 200 })
      fireEvent.pointerUp(carousel, { pointerId: 10, pointerType: 'touch', clientX: 220, clientY: 200 })
      vi.advanceTimersByTime(1200)
    })

    expect(carousel.scrollLeft).toBeCloseTo(initialScrollLeft + cardInterval, 4)
  })

  it('keeps the edge fades out of the mobile touch area', () => {
    renderCarousel()

    const fades = screen.getByTestId('home-cases-carousel').querySelectorAll('span[aria-hidden="true"]')

    expect(fades).toHaveLength(2)
    for (const fade of fades) {
      expect(fade).toHaveClass('hidden', 'sm:block')
    }
  })

  it('follows the pointer and snaps to a card after release', () => {
    vi.useFakeTimers()
    renderCarousel()
    const carousel = screen.getByTestId('home-cases-carousel')
    const initialScrollLeft = carousel.scrollLeft

    act(() => {
      fireEvent.pointerDown(carousel, { pointerId: 1, clientX: 500, clientY: 200 })
      fireEvent.pointerMove(carousel, { pointerId: 1, clientX: 320, clientY: 200 })
    })

    expect(carousel).toHaveClass('cursor-grabbing')
    expect(carousel.scrollLeft).toBeGreaterThan(initialScrollLeft)

    fireEvent.pointerUp(carousel, { pointerId: 1, clientX: 320, clientY: 200 })

    act(() => {
      vi.advanceTimersByTime(1200)
    })

    const cardInterval = Number(carousel.dataset.cardInterval)
    expect(carousel.scrollLeft % cardInterval).toBeCloseTo(0, 4)
    expect(screen.getAllByTestId('home-case-card').filter((card) => card.dataset.carouselActive === 'true')).toHaveLength(1)
  })

  it('moves between cases with the keyboard without adding visual controls', () => {
    vi.useFakeTimers()
    renderCarousel()
    const carousel = screen.getByTestId('home-cases-carousel')
    const initialScrollLeft = carousel.scrollLeft
    const cardInterval = Number(carousel.dataset.cardInterval)

    expect(carousel).toHaveAttribute('tabindex', '0')
    expect(carousel).toHaveAttribute('aria-label', 'Carrossel de cases de sucesso')

    fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    act(() => vi.advanceTimersByTime(600))
    expect(carousel.scrollLeft).toBeCloseTo(initialScrollLeft + cardInterval, 4)

    fireEvent.keyDown(carousel, { key: 'ArrowLeft' })
    act(() => vi.advanceTimersByTime(600))
    expect(carousel.scrollLeft).toBeCloseTo(initialScrollLeft, 4)
  })

  it('keeps strong drags inside the seamless middle loop', () => {
    vi.useFakeTimers()
    renderCarousel()
    const carousel = screen.getByTestId('home-cases-carousel')

    act(() => {
      fireEvent.pointerDown(carousel, { pointerId: 2, clientX: 800, clientY: 200 })
      fireEvent.pointerMove(carousel, { pointerId: 2, clientX: -5200, clientY: 200 })
      fireEvent.pointerUp(carousel, { pointerId: 2, clientX: -5200, clientY: 200 })
      vi.advanceTimersByTime(1400)
    })

    const loopWidth = Number(carousel.dataset.loopWidth)
    expect(carousel.scrollLeft).toBeGreaterThanOrEqual(loopWidth * 0.5)
    expect(carousel.scrollLeft).toBeLessThan(loopWidth * 2.5)
  })

  it('uses white in the section background and gray on case cards', () => {
    const { container } = renderCarousel()

    expect(container.firstElementChild).toHaveClass('bg-white')
    for (const card of screen.getAllByTestId('home-case-card')) {
      expect(card).toHaveClass('bg-[#EFEFF4]')
      expect(card).not.toHaveClass('bg-white')
    }

    for (const fade of screen.getByTestId('home-cases-carousel').querySelectorAll('span[aria-hidden="true"]')) {
      expect(fade).toHaveClass('from-white')
    }
  })

  it('shows the active case logo in color and keeps the other logos grayscale', () => {
    renderCarousel()

    const cards = screen.getAllByTestId('home-case-card')
    const activeCard = cards.find((card) => card.dataset.carouselActive === 'true')
    const inactiveCards = cards.filter((card) => card.dataset.carouselActive === 'false')

    expect(activeCard.querySelector('img')).toHaveClass('grayscale-0')
    expect(activeCard.querySelector('img')).not.toHaveClass('grayscale')
    inactiveCards.forEach((card) => {
      expect(card.querySelector('img')).toHaveClass('grayscale')
      expect(card.querySelector('img')).not.toHaveClass('grayscale-0')
    })
  })

  it('renders case logos, summaries, companies and sectors without testimonial language', () => {
    renderCarousel({
      cases: [
        {
          _id: 'cms-sulmaq',
          name: 'Sulmaq',
          sector: 'Indústria',
          logoAlt: 'Logo da Sulmaq',
          logoUrl: 'https://cdn.sanity.io/images/demo/sulmaq.jpg',
          caseSlug: 'sulmaq',
        },
      ],
    })

    expect(screen.getByText(/Mais de mil clientes confiam na Otimiza/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Centralizamos os orçamentos no ERP/i)).toHaveLength(3)
    expect(screen.getAllByText('Sulmaq')).toHaveLength(3)
    expect(screen.getAllByRole('img', { name: 'Logo da Sulmaq' })).toHaveLength(1)

    const accessibleCard = screen.getAllByRole('article', { name: 'Case Sulmaq' })[0]
    expect(accessibleCard).toBeInTheDocument()
    expect(within(accessibleCard).getByText('Indústria')).toBeInTheDocument()
    expect(accessibleCard).not.toHaveTextContent(/[“”]/)
    expect(accessibleCard).not.toHaveTextContent(/^-/)
  })
})
