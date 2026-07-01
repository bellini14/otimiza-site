import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StaggerTestimonials } from './stagger-testimonials'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
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

  it('uses the section gray on both the background and testimonial cards', () => {
    const { container } = renderCarousel()

    expect(container.firstElementChild).toHaveClass('bg-[#EFEFF4]')
    for (const card of screen.getAllByTestId('home-case-card')) {
      expect(card).toHaveClass('bg-[#EFEFF4]')
      expect(card).not.toHaveClass('bg-white')
    }
  })

  it('renders testimonial cards supplied by the CMS before using fallback copy', () => {
    renderCarousel({
      testimonials: [
        {
          _id: 'cms-testimonial',
          shortQuote: 'A Otimiza conectou operacao e indicadores em uma unica rotina.',
          clientName: 'Marina Duarte',
          role: 'Diretora de Operacoes',
          company: 'Alpha Foods',
          avatarUrl: 'https://cdn.sanity.io/images/demo/marina.jpg',
        },
      ],
    })

    expect(screen.getAllByText(/A Otimiza conectou operacao/)).toHaveLength(3)
    expect(screen.getAllByText(/Marina Duarte, Diretora de Operacoes na Alpha Foods/)).toHaveLength(3)
  })
})
