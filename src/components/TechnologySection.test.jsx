import { cleanup, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import TechnologySection from './TechnologySection'

afterEach(() => {
  cleanup()
})

describe('TechnologySection', () => {
  it('uses a white section background', () => {
    const { container } = render(
      <MemoryRouter>
        <TechnologySection />
      </MemoryRouter>,
    )

    expect(container.firstElementChild).toHaveClass('bg-white')
  })
})
