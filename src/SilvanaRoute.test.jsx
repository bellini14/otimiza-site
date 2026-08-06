import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  text: async () => JSON.stringify({ notes: [], count: 0 }),
}))

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
  vi.restoreAllMocks()
})

describe('Silvana memorial route', () => {
  it('renders outside the institutional shell', async () => {
    window.history.replaceState({}, '', '/silvana-bettiol')
    render(<App />)
    expect(await screen.findByRole('heading', {
      name: 'Silvana Tiburi Bettiol. Hoje é dia dela',
    })).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    )
    expect(document.querySelector('.memorial-scroll-cue')).toHaveAttribute('aria-hidden', 'true')
  })
})
