import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CaseDetail from './CaseDetail'
import { client } from '../lib/sanity'

vi.mock('../lib/sanity', () => ({
  client: {
    fetch: vi.fn(),
  },
  urlFor: (source) => ({
    ignoreImageParams: () => ({
      width: () => {
        const imageBuilder = {
          height: () => ({
            fit: () => ({
              url: () => source?.assetUrl ?? 'https://cdn.sanity.io/images/project/dataset/cms-logo.png',
            }),
          }),
          fit: () => ({
            url: () => source?.assetUrl ?? 'https://cdn.sanity.io/images/project/dataset/cms-logo.png',
          }),
        }
        return imageBuilder
      },
    }),
  }),
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
    client.fetch.mockResolvedValue({
      name: 'Banco Moneo',
      caseTitle: 'Titulo do cadastro de logo',
      caseDescription: 'Descricao do cadastro de logo que nao deve substituir o case estatico.',
    })

    renderCase('banco-moneo')

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Case - Banco Moneo')
    expect(screen.getByTestId('case-detail-hero')).toBeInTheDocument()
    expect(screen.getByTestId('case-detail-hero')).toHaveClass('h-[48svh]')
    expect(within(screen.getByTestId('case-detail-hero')).queryByText('Case - Banco Moneo')).not.toBeInTheDocument()
    expect(screen.queryByText('Case')).not.toBeInTheDocument()
    expect(screen.getByTestId('case-detail-hero-image')).toHaveAccessibleName('Banco Moneo')
    expect(screen.getByTestId('case-detail-hero-image')).toHaveAttribute('src', expect.stringContaining('images.unsplash.com'))
    expect(screen.queryByTestId('case-detail-client-mark')).not.toBeInTheDocument()
    expect(screen.queryByTestId('case-detail-client-logo')).not.toBeInTheDocument()
    expect(screen.getByTestId('case-detail-side-nav')).toHaveClass('hidden', 'lg:block', 'w-64', 'shrink-0')
    expect(screen.getByTestId('case-detail-side-nav')).toHaveAttribute('data-pin-state', 'normal')
    expect(screen.getByTestId('case-detail-side-nav-sticky')).toBeInTheDocument()
    expect(screen.getByTestId('case-detail-content-column')).toHaveClass('flex-1', 'min-w-0')
    expect(screen.getByTestId('case-detail-content-layout')).toHaveClass('max-w-[1380px]')
    expect(screen.getAllByTestId('case-detail-content-section')[0]).not.toHaveClass('border-t')
    expect(screen.queryByText('01')).not.toBeInTheDocument()
    expect(screen.getAllByTestId('case-detail-side-nav-item')).toHaveLength(3)
    expect(screen.getAllByTestId('case-detail-side-nav-item').some((item) => item.className.includes('text-brand-red'))).toBe(true)
    expect(screen.getAllByTestId('case-detail-content-section')).toHaveLength(3)
    expect(screen.queryByText('Titulo do cadastro de logo')).not.toBeInTheDocument()
    expect(screen.queryByText('Descricao do cadastro de logo que nao deve substituir o case estatico.')).not.toBeInTheDocument()
    expect(screen.getByText('Transformação que dá certo')).toBeInTheDocument()
    expect(screen.queryByText('Banco Moneo - Marcopolo (setor financeiro)')).not.toBeInTheDocument()
    expect(screen.queryByText(/Projeto: reduzir complexidade/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Processo: Gestão de Contratos/)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Problemas' })).toBeInTheDocument()
    expect(screen.getByText(/Contratos emitidos em Word/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Resultados' })).toBeInTheDocument()
    expect(screen.getByText('Autonomia.')).toBeInTheDocument()
    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('caseSlug.current == $slug'), {
      slug: 'banco-moneo',
    })
  })

  it('prefers Sanity case content when it exists for the slug', async () => {
    client.fetch.mockResolvedValue({
      name: 'Cliente CMS',
      sector: 'Tecnologia',
      caseTitle: 'Case vindo do Sanity',
      caseDescription: 'Resumo editado no CMS.',
      logo: {
        asset: { _ref: 'image-cms-logo-400x240-png' },
        assetUrl: 'https://cdn.sanity.io/images/igy822g7/production/0122eed8d7195fe28022797c883bcb730ac02641-856x314.png?w=1800',
      },
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

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Case vindo do Sanity')
    expect(screen.getByText('Resumo editado no CMS.')).toBeInTheDocument()
    expect(screen.getByText('Conteudo customizado do Sanity.')).toBeInTheDocument()
    expect(screen.getByTestId('case-detail-hero-image')).toHaveAccessibleName('Cliente CMS')
    expect(screen.getByTestId('case-detail-hero-image')).toHaveAttribute(
      'src',
      'https://www.otm.com.br/wp-content/uploads/2020/10/Screenshot_11.png',
    )
    expect(document.head.querySelector('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://www.otm.com.br/wp-content/uploads/2020/10/Screenshot_11.png',
    )
    expect(screen.queryByTestId('case-detail-client-mark')).not.toBeInTheDocument()
    expect(screen.queryByTestId('case-detail-client-logo')).not.toBeInTheDocument()
    expect(screen.getByTestId('case-detail-side-nav')).toBeInTheDocument()
    expect(screen.getAllByTestId('case-detail-side-nav-item')).toHaveLength(1)
  })

  it('keeps an unmapped CMS case hero on the Sanity CDN', async () => {
    const unmappedSanityUrl = 'https://cdn.sanity.io/images/igy822g7/production/new-case-logo-1800x1100.png'
    client.fetch.mockResolvedValue({
      name: 'Cliente novo',
      caseTitle: 'Case novo',
      caseDescription: 'Resumo do novo case.',
      logo: { assetUrl: unmappedSanityUrl },
      caseContent: [
        {
          _type: 'block',
          _key: 'new-case-block',
          style: 'normal',
          children: [{ _type: 'span', _key: 'new-case-span', text: 'Conteudo novo.', marks: [] }],
          markDefs: [],
        },
      ],
    })

    renderCase('cliente-novo')

    expect(await screen.findByRole('heading', { level: 1, name: 'Case novo' })).toBeInTheDocument()
    expect(screen.getByTestId('case-detail-hero-image')).toHaveAttribute('src', unmappedSanityUrl)
    expect(document.head.querySelector('meta[property="og:image"]')).toHaveAttribute('content', unmappedSanityUrl)
  })
})
