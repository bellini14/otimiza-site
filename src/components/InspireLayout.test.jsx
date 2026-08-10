import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import InspireLayout from './InspireLayout'
import { client } from '../lib/sanity'

vi.mock('../lib/sanity', () => ({
  client: { fetch: vi.fn() },
}))

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>
}

function renderLayout(initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<InspireLayout />}>
          <Route path="/inspire" element={<LocationProbe />} />
          <Route path="/inspire/:slug" element={<LocationProbe />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  client.fetch.mockResolvedValue([])
})

describe('InspireLayout search', () => {
  it('sends a search started inside a post to the Inspire feed', async () => {
    renderLayout('/inspire/artigo-exemplo')

    fireEvent.change(screen.getByRole('textbox', { name: 'Pesquisar no Inspire' }), {
      target: { value: 'gestão' },
    })

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/inspire?q=gest%C3%A3o')
    })
    expect(screen.getByRole('textbox', { name: 'Pesquisar no Inspire' })).toHaveValue('gestão')
  })

  it('shows up to five Sanity suggestions with title and category', async () => {
    client.fetch.mockResolvedValueOnce([
      { title: 'Gestão sem ruído', slug: 'gestao-sem-ruido', eyebrow: 'Editorial' },
      { title: 'Gestão aplicada', slug: 'gestao-aplicada', eyebrow: 'Artigos' },
    ])
    renderLayout('/inspire')

    const searchInput = screen.getByRole('textbox', { name: 'Pesquisar no Inspire' })
    fireEvent.change(searchInput, { target: { value: 'gestão' } })

    const suggestions = await screen.findByRole('listbox', { name: 'Sugestões de artigos' })
    expect(suggestions).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /gestão sem ruído editorial/i })).toHaveAttribute('href', '/inspire/gestao-sem-ruido')
    expect(screen.getByRole('option', { name: /gestão aplicada artigos/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todos os resultados' })).toHaveAttribute('href', '/inspire?q=gest%C3%A3o')
    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('match $broadTerm'), {
      broadTerm: 'g*s*t*',
      foldedTerm: 'g*st*',
      term: 'gestão*',
    })
  })

  it('supports keyboard selection and closes the suggestions with Escape', async () => {
    client.fetch.mockResolvedValue([
      { title: 'Gestão sem ruído', slug: 'gestao-sem-ruido', eyebrow: 'Editorial' },
    ])
    renderLayout('/inspire')

    const searchInput = screen.getByRole('textbox', { name: 'Pesquisar no Inspire' })
    fireEvent.change(searchInput, { target: { value: 'gestão' } })
    await screen.findByRole('option', { name: /gestão sem ruído editorial/i })

    fireEvent.keyDown(searchInput, { key: 'ArrowDown' })
    expect(searchInput).toHaveAttribute('aria-activedescendant', 'inspire-search-suggestion-0')
    fireEvent.keyDown(searchInput, { key: 'Enter' })

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/inspire/gestao-sem-ruido')
    })

    fireEvent.change(searchInput, { target: { value: 'gestão' } })
    await screen.findByRole('listbox', { name: 'Sugestões de artigos' })
    fireEvent.keyDown(searchInput, { key: 'Escape' })
    expect(screen.queryByRole('listbox', { name: 'Sugestões de artigos' })).not.toBeInTheDocument()
    expect(searchInput).toHaveValue('gestão')
  })
})
