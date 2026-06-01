import { cleanup, fireEvent, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { StaggerTestimonials } from './stagger-testimonials'

afterEach(() => {
  cleanup()
})

function getTestimonialCardNodes(container) {
  return new Map(
    Array.from(container.querySelectorAll('h3')).map((heading) => [
      heading.textContent,
      heading.parentElement?.parentElement,
    ]),
  )
}

function extractTranslateX(cardNode) {
  const match = cardNode.style.transform.match(/translateX\(([-\d.]+)px\)/)
  return match ? Number(match[1]) : 0
}

function getCardPositions(container) {
  return Array.from(container.querySelectorAll('h3')).map((heading) => {
    const cardNode = heading.parentElement?.parentElement

    return {
      cardNode,
      position: Number(cardNode.dataset.carouselPosition),
      x: extractTranslateX(cardNode),
    }
  })
}

describe('StaggerTestimonials', () => {
  it('renders testimonial cards supplied by the CMS before using fallback copy', () => {
    const { container } = render(
      <MemoryRouter>
        <StaggerTestimonials
          testimonials={[
            {
              _id: 'cms-testimonial',
              shortQuote: 'A Otimiza conectou operacao e indicadores em uma unica rotina.',
              clientName: 'Marina Duarte',
              role: 'Diretora de Operacoes',
              company: 'Alpha Foods',
              avatarUrl: 'https://cdn.sanity.io/images/demo/marina.jpg',
            },
          ]}
        />
      </MemoryRouter>,
    )

    expect(container).toHaveTextContent('A Otimiza conectou operacao e indicadores em uma unica rotina.')
    expect(container).toHaveTextContent('Marina Duarte, Diretora de Operacoes na Alpha Foods')
  })

  it('keeps the same testimonial card nodes when a border card recenters the carousel', () => {
    const { container } = render(
      <MemoryRouter>
        <StaggerTestimonials />
      </MemoryRouter>,
    )

    const cardsBeforeMove = getTestimonialCardNodes(container)

    fireEvent.click(container.querySelectorAll('h3')[0])

    const cardsAfterMove = getTestimonialCardNodes(container)

    expect(cardsAfterMove.size).toBe(cardsBeforeMove.size)

    for (const [quote, cardNode] of cardsBeforeMove.entries()) {
      expect(cardsAfterMove.get(quote)).toBe(cardNode)
    }
  })

  it('moves mounted cards left when a distant right card recenters the carousel', () => {
    const { container } = render(
      <MemoryRouter>
        <StaggerTestimonials />
      </MemoryRouter>,
    )

    const positionsBeforeMove = getCardPositions(container).filter(
      ({ position }) => position >= -5 && position <= 4,
    )
    const rightmostCard = positionsBeforeMove.reduce((rightmost, card) =>
      card.x > rightmost.x ? card : rightmost,
    )

    fireEvent.click(rightmostCard.cardNode)

    for (const { cardNode, x } of positionsBeforeMove) {
      expect(extractTranslateX(cardNode)).toBeLessThanOrEqual(x)
    }
  })
})
