import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ notes: [], count: 0 }),
}))

afterEach(() => {
  window.history.replaceState({}, '', '/')
})

describe('Silvana memorial route', () => {
  it('renders outside the institutional shell', async () => {
    window.history.replaceState({}, '', '/silvana-bettiol')
    render(<App />)
    expect(await screen.findByRole('heading', {
      name: 'Silvana, hoje é o seu dia.',
    })).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    )
  })
})
