import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Cases from './Cases'
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

describe('Cases', () => {
  it('renders Sanity client logos grouped by sector order', async () => {
    client.fetch.mockResolvedValue([
      {
        _id: 'distribuidora-alfa',
        name: 'Distribuidora Alfa',
        sector: 'Comércio e Distribuidoras',
        logoUrl: 'https://cdn.sanity.io/images/prod/distribuidora-alfa.svg',
      },
      {
        _id: 'banco-azul',
        name: 'Banco Azul',
        sector: 'Bancos',
        logoUrl: 'https://cdn.sanity.io/images/prod/banco-azul.svg',
        logoAlt: 'Marca Banco Azul',
      },
    ])

    render(<Cases />)

    expect(await screen.findByRole('heading', { name: 'Nossos clientes' })).toBeInTheDocument()
    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('_type == "clientLogo"'))

    const sectorGroups = screen.getAllByTestId('client-sector')
    expect(sectorGroups).toHaveLength(2)
    expect(within(sectorGroups[0]).getByRole('heading', { name: 'Bancos' })).toBeInTheDocument()
    expect(within(sectorGroups[1]).getByRole('heading', { name: 'Comércio e Distribuidoras' })).toBeInTheDocument()

    expect(screen.getByRole('img', { name: 'Marca Banco Azul' })).toHaveAttribute(
      'src',
      'https://cdn.sanity.io/images/prod/banco-azul.svg',
    )
    expect(screen.getByRole('img', { name: 'Distribuidora Alfa' })).toHaveAttribute(
      'src',
      'https://cdn.sanity.io/images/prod/distribuidora-alfa.svg',
    )
  })
})
