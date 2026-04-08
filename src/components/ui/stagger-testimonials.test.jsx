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

describe('StaggerTestimonials', () => {
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
})
