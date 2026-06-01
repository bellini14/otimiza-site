import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CaseDetail from './CaseDetail'
import { client } from '../lib/sanity'

vi.mock('../lib/sanity', () => ({
  client: {
    fetch: vi.fn(),
  },
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderCase(slug) {
  window.scrollTo = vi.fn()

  return render(
    <MemoryRouter initialEntries={[`/cases/${slug}`]}>
      <Routes>
        <Route path="/cases/:slug" element={<CaseDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CaseDetail', () => {
  it('renders the static portfolio fallback for Banco Moneo by slug', async () => {
    client.fetch.mockResolvedValue(null)

    renderCase('banco-moneo')

    expect(await screen.findByRole('heading', { name: 'Case - Banco Moneo' })).toBeInTheDocument()
    expect(screen.getByText('Transformação que dá certo')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Problemas' })).toBeInTheDocument()
    expect(screen.getByText(/Contratos emitidos em Word/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Resultados' })).toBeInTheDocument()
    expect(screen.getByText('Autonomia.')).toBeInTheDocument()
    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('caseSlug.current == $slug'), { slug: 'banco-moneo' })
  })

  it('prefers Sanity case content when it exists for the slug', async () => {
    client.fetch.mockResolvedValue({
      name: 'Cliente CMS',
      sector: 'Tecnologia',
      caseTitle: 'Case vindo do Sanity',
      caseDescription: 'Resumo editado no CMS.',
      caseContent: [
        {
          _type: 'block',
          _key: 'cms-block',
          style: 'normal',
          children: [{ _type: 'span', _key: 'span', text: 'Conteudo customizado do Sanity.', marks: [] }],
          markDefs: [],
        },
      ],
    })

    renderCase('cliente-cms')

    expect(await screen.findByRole('heading', { name: 'Case vindo do Sanity' })).toBeInTheDocument()
    expect(screen.getByText('Resumo editado no CMS.')).toBeInTheDocument()
    expect(screen.getByText('Conteudo customizado do Sanity.')).toBeInTheDocument()
  })
})
