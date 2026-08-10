import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./pages/Inspire', () => ({
  default: () => <div>Inspire feed</div>,
}))

vi.mock('./pages/PostDetail', () => ({
  default: () => <div>Post legado</div>,
}))

import App from './App'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('App', () => {
  it('opens a WordPress dated post permalink', async () => {
    const originalUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`

    try {
      window.history.pushState({}, '', '/2026/05/05/o-desgaste-da-visao')
      render(<App />)

      expect(await screen.findByText('Post legado')).toBeInTheDocument()
    } finally {
      window.history.replaceState({}, '', originalUrl)
    }
  })

  it('restores a superseded search entry when navigating back after a rapid clear', async () => {
    const originalUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`

    try {
      window.history.pushState({}, '', '/inspire')
      render(<App />)
      const searchInput = await screen.findByRole('textbox', { name: 'Pesquisar no Inspire' })
      searchInput.focus()
      fireEvent.change(searchInput, { target: { value: 'a' } })
      fireEvent.click(screen.getByRole('button', { name: 'Limpar pesquisa' }))

      await act(async () => {
        await new Promise((resolve) => {
          window.requestAnimationFrame(() => window.requestAnimationFrame(resolve))
        })
      })
      expect(new URLSearchParams(window.location.search).get('q')).toBeNull()
      expect(searchInput).toHaveValue('')

      await act(async () => {
        const navigated = new Promise((resolve) => {
          window.addEventListener('popstate', resolve, { once: true })
        })
        window.history.back()
        await navigated
      })

      await waitFor(() => {
        expect(new URLSearchParams(window.location.search).get('q')).toBe('a')
        expect(searchInput).toHaveValue('a')
      })
      expect(searchInput).toHaveFocus()
      expect(searchInput.selectionStart).toBe(1)
      expect(searchInput.selectionEnd).toBe(1)
    } finally {
      window.history.replaceState({}, '', originalUrl)
    }
  })

  it('applies an external query that matches a pending internal search value', async () => {
    const originalUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`

    try {
      window.history.pushState({}, '', '/inspire')
      render(<App />)
      const searchInput = await screen.findByRole('textbox', { name: 'Pesquisar no Inspire' })
      searchInput.focus()
      fireEvent.change(searchInput, { target: { value: 'a' } })
      fireEvent.change(searchInput, { target: { value: 'ab' } })

      await act(async () => {
        window.history.pushState({}, '', '/inspire?q=a')
        window.dispatchEvent(new PopStateEvent('popstate'))
      })

      await waitFor(() => {
        expect(searchInput).toHaveValue('a')
      })
      expect(searchInput).toHaveFocus()
    } finally {
      window.history.replaceState({}, '', originalUrl)
    }
  })

  it('synchronizes an external query navigation while the search is focused', async () => {
    const originalUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`

    try {
      window.history.pushState({}, '', '/inspire?q=original')
      const user = userEvent.setup()
      render(<App />)
      const searchInput = await screen.findByRole('textbox', { name: 'Pesquisar no Inspire' })
      await user.click(searchInput)

      await act(async () => {
        window.history.pushState({}, '', '/inspire?q=external')
        window.dispatchEvent(new PopStateEvent('popstate'))
      })

      await waitFor(() => {
        expect(searchInput).toHaveValue('external')
      })
      expect(searchInput).toHaveFocus()
    } finally {
      window.history.replaceState({}, '', originalUrl)
    }
  })

  it('hydrates the Inspire search from the initial URL query', async () => {
    const originalUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`

    try {
      window.history.pushState({}, '', '/inspire?q=planejamento')
      render(<App />)

      expect(await screen.findByRole('textbox', { name: 'Pesquisar no Inspire' })).toHaveValue(
        'planejamento',
      )
    } finally {
      window.history.replaceState({}, '', originalUrl)
    }
  })

  it('keeps the search focused while typing and synchronizing the URL', async () => {
    const originalUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`

    try {
      window.history.pushState({}, '', '/inspire')
      const user = userEvent.setup()
      render(<App />)
      const searchInput = await screen.findByRole('textbox', { name: 'Pesquisar no Inspire' })
      await user.click(searchInput)
      await user.type(searchInput, 'g')
      await act(async () => {
        await new Promise((resolve) => {
          window.requestAnimationFrame(() => window.requestAnimationFrame(resolve))
        })
      })
      expect(screen.getByRole('textbox', { name: 'Pesquisar no Inspire' })).toBe(searchInput)
      expect(searchInput).toHaveFocus()
      await user.type(searchInput, 'estao')
      expect(searchInput).toHaveValue('gestao')
      expect(searchInput).toHaveFocus()
      expect(new URLSearchParams(window.location.search).get('q')).toBe('gestao')

      await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}x')
      await act(async () => {
        await new Promise((resolve) => {
          window.requestAnimationFrame(() => window.requestAnimationFrame(resolve))
        })
      })
      expect(searchInput).toHaveValue('gesxtao')
      expect(searchInput.selectionStart).toBe(4)
      expect(searchInput.selectionEnd).toBe(4)
      expect(searchInput).toHaveFocus()
      expect(new URLSearchParams(window.location.search).get('q')).toBe('gesxtao')
    } finally {
      window.history.replaceState({}, '', originalUrl)
    }
  })
})
