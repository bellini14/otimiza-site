import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import InsightsBlog from './InsightsBlog'

// ── Helpers ──

/**
 * Create N posts with sequential dates (newest first when sorted).
 * Index 0 = newest, index N-1 = oldest.
 */
function makePosts(count, overrides = {}) {
  return Array.from({ length: count }, (_, i) => {
    const day = String(count - i).padStart(2, '0')
    return {
      title: overrides.title?.(i) ?? `Post ${i + 1}`,
      description: `Description ${i + 1}`,
      imgSrc: `https://example.com/img${i}.jpg`,
      slug: overrides.slug?.(i) ?? `post-${i + 1}`,
      link: `/insights-e-blog/post-${i + 1}`,
      eyebrow: overrides.eyebrow?.(i) ?? `Cat${(i % 3) + 1}`,
      publishedAt: overrides.publishedAt?.(i) ?? `2026-04-${day}T12:00:00Z`,
      linkText: 'Ler artigo',
    }
  })
}

// Mock Sanity client
vi.mock('../lib/sanity', () => ({
  client: {
    fetch: vi.fn(),
  },
}))

import { client } from '../lib/sanity'

function renderPage() {
  return render(
    <MemoryRouter>
      <InsightsBlog />
    </MemoryRouter>,
  )
}

function openMonthDropdown() {
  const monthContainer = document.querySelector('.filter-bar__month')
  const btn = within(monthContainer).getByRole('button')
  fireEvent.click(btn)
}

function clickChip(label) {
  const chipsContainer = document.querySelector('.filter-bar__chips')
  const chip = within(chipsContainer).getByText(label)
  fireEvent.click(chip)
}

// ── Tests ──

describe('InsightsBlog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders editorial layout with 1 primary and 3 secondary features', async () => {
    const posts = makePosts(20)
    client.fetch.mockResolvedValue(posts)

    renderPage()

    const primary = await screen.findByText('Post 1')
    expect(primary).toBeInTheDocument()
    expect(primary.closest('.featured-primary')).toBeTruthy()

    expect(screen.getByText('Post 2')).toBeInTheDocument()
    expect(screen.getByText('Post 3')).toBeInTheDocument()
    expect(screen.getByText('Post 4')).toBeInTheDocument()
    expect(screen.getByText('Post 2').closest('.featured-secondary')).toBeTruthy()
  })

  it('shows only 10 grid posts initially', async () => {
    const posts = makePosts(20)
    client.fetch.mockResolvedValue(posts)

    renderPage()
    await screen.findByText('Post 1')

    expect(screen.getByText('Post 5')).toBeInTheDocument()
    expect(screen.getByText('Post 14')).toBeInTheDocument()
    expect(screen.queryByText('Post 15')).not.toBeInTheDocument()
  })

  it('reveals 10 more posts per "Carregar mais"', async () => {
    const posts = makePosts(30)
    client.fetch.mockResolvedValue(posts)

    renderPage()
    await screen.findByText('Post 1')

    expect(screen.queryByText('Post 15')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Carregar mais'))

    expect(screen.getByText('Post 15')).toBeInTheDocument()
    expect(screen.getByText('Post 24')).toBeInTheDocument()
    expect(screen.queryByText('Post 25')).not.toBeInTheDocument()
  })

  it('derives month options and filters by selected month', async () => {
    const posts = [
      { ...makePosts(1)[0], title: 'Jan Post', publishedAt: '2026-01-10T12:00:00Z', slug: 'jan' },
      { ...makePosts(1)[0], title: 'Feb Post', publishedAt: '2026-02-10T12:00:00Z', slug: 'feb' },
      { ...makePosts(1)[0], title: 'Mar Post', publishedAt: '2026-03-10T12:00:00Z', slug: 'mar' },
      { ...makePosts(1)[0], title: 'Mar Post 2', publishedAt: '2026-03-20T12:00:00Z', slug: 'mar2' },
      { ...makePosts(1)[0], title: 'Apr Post', publishedAt: '2026-04-10T12:00:00Z', slug: 'apr' },
    ]
    client.fetch.mockResolvedValue(posts)

    renderPage()
    await screen.findByText('Apr Post')

    openMonthDropdown()
    const marOption = screen.getByRole('option', { name: /mar/i })
    fireEvent.click(marOption)

    expect(screen.getByText('Mar Post')).toBeInTheDocument()
    expect(screen.getByText('Mar Post 2')).toBeInTheDocument()
    expect(screen.queryByText('Jan Post')).not.toBeInTheDocument()
    expect(screen.queryByText('Feb Post')).not.toBeInTheDocument()
    expect(screen.queryByText('Apr Post')).not.toBeInTheDocument()
  })

  it('supports multiple active category chips with OR matching', async () => {
    const posts = [
      { ...makePosts(1)[0], title: 'Tech Article', eyebrow: 'Tecnologia', slug: 'tech', publishedAt: '2026-04-01T00:00:00Z' },
      { ...makePosts(1)[0], title: 'Mgmt Article', eyebrow: 'Gestão', slug: 'mgmt', publishedAt: '2026-03-01T00:00:00Z' },
      { ...makePosts(1)[0], title: 'Data Article', eyebrow: 'Dados', slug: 'data', publishedAt: '2026-02-01T00:00:00Z' },
    ]
    client.fetch.mockResolvedValue(posts)

    renderPage()
    await screen.findByText('Tech Article')

    clickChip('Tecnologia')

    expect(screen.getByText('Tech Article')).toBeInTheDocument()
    expect(screen.queryByText('Data Article')).not.toBeInTheDocument()
    expect(screen.queryByText('Mgmt Article')).not.toBeInTheDocument()

    clickChip('Dados')

    expect(screen.getByText('Tech Article')).toBeInTheDocument()
    expect(screen.getByText('Data Article')).toBeInTheDocument()
    expect(screen.queryByText('Mgmt Article')).not.toBeInTheDocument()
  })

  it('combines month and category filters using AND', async () => {
    const posts = [
      { ...makePosts(1)[0], title: 'Apr Tech', eyebrow: 'Tecnologia', publishedAt: '2026-04-05T00:00:00Z', slug: 'apr-tech' },
      { ...makePosts(1)[0], title: 'Apr Data', eyebrow: 'Dados', publishedAt: '2026-04-15T00:00:00Z', slug: 'apr-data' },
      { ...makePosts(1)[0], title: 'Mar Tech', eyebrow: 'Tecnologia', publishedAt: '2026-03-10T00:00:00Z', slug: 'mar-tech' },
    ]
    client.fetch.mockResolvedValue(posts)

    renderPage()
    await screen.findByText('Apr Data')

    openMonthDropdown()
    fireEvent.click(screen.getByRole('option', { name: /abr/i }))

    clickChip('Tecnologia')

    expect(screen.getByText('Apr Tech')).toBeInTheDocument()
    expect(screen.queryByText('Apr Data')).not.toBeInTheDocument()
    expect(screen.queryByText('Mar Tech')).not.toBeInTheDocument()
  })

  it('resets visible grid count when filters change', async () => {
    const posts = makePosts(20, {
      eyebrow: () => 'CatA',
    })
    client.fetch.mockResolvedValue(posts)

    renderPage()
    await screen.findByText('Post 1')

    fireEvent.click(screen.getByText('Carregar mais'))
    expect(screen.getByText('Post 20')).toBeInTheDocument()

    // Toggle chip on then off → both resets trigger grid count = 10
    clickChip('CatA')
    clickChip('CatA')

    expect(screen.getByText('Post 14')).toBeInTheDocument()
    expect(screen.queryByText('Post 15')).not.toBeInTheDocument()
    expect(screen.getByText('Carregar mais')).toBeInTheDocument()
  })

  it('recomputes featured area from filtered result set', async () => {
    const posts = [
      { ...makePosts(1)[0], title: 'Alpha', eyebrow: 'CatA', publishedAt: '2026-04-01T00:00:00Z', slug: 'alpha' },
      { ...makePosts(1)[0], title: 'Beta', eyebrow: 'CatB', publishedAt: '2026-03-01T00:00:00Z', slug: 'beta' },
      { ...makePosts(1)[0], title: 'Gamma', eyebrow: 'CatA', publishedAt: '2026-02-01T00:00:00Z', slug: 'gamma' },
    ]
    client.fetch.mockResolvedValue(posts)

    renderPage()
    await screen.findByText('Alpha')

    expect(screen.getByText('Alpha').closest('.featured-primary')).toBeTruthy()

    clickChip('CatB')

    expect(screen.getByText('Beta').closest('.featured-primary')).toBeTruthy()
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
  })

  it('renders empty state and restores content through "Limpar filtros"', async () => {
    const posts = [
      { ...makePosts(1)[0], title: 'Apr CatA', eyebrow: 'CatA', publishedAt: '2026-04-01T00:00:00Z', slug: 'apr-a' },
      { ...makePosts(1)[0], title: 'Mar CatB', eyebrow: 'CatB', publishedAt: '2026-03-01T00:00:00Z', slug: 'mar-b' },
    ]
    client.fetch.mockResolvedValue(posts)

    renderPage()
    await screen.findByText('Apr CatA')

    openMonthDropdown()
    fireEvent.click(screen.getByRole('option', { name: /abr/i }))

    clickChip('CatB')

    expect(screen.getByText('Nenhum resultado encontrado')).toBeInTheDocument()

    const emptySection = document.querySelector('.insights-page__empty')
    const clearBtn = within(emptySection).getByText('Limpar filtros')
    fireEvent.click(clearBtn)

    expect(screen.getByText('Apr CatA')).toBeInTheDocument()
    expect(screen.getByText('Mar CatB')).toBeInTheDocument()
  })
})
