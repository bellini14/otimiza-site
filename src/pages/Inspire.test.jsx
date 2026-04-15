import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../lib/sanity', () => ({
  client: {
    fetch: vi.fn(),
  },
}))

import { client } from '../lib/sanity'
import InspireLayout from '../components/InspireLayout'
import Inspire from './Inspire'

let observerInstances = []
const originalIntersectionObserver = globalThis.IntersectionObserver
let fetchMock

class ControlledIntersectionObserver {
  constructor(callback) {
    this.callback = callback
    this.targets = new Set()
    observerInstances.push(this)
  }

  observe(target) {
    this.targets.add(target)
  }

  unobserve(target) {
    this.targets.delete(target)
  }

  disconnect() {
    this.targets.clear()
  }
}

function triggerIntersection(target, isIntersecting = true) {
  const instance = observerInstances.find((candidate) => candidate.targets.has(target))

  if (instance) {
    instance.callback([{ isIntersecting, target }])
  }
}

function makePost(index, overrides = {}) {
  return {
    title: overrides.title ?? `Post ${index}`,
    description: overrides.description ?? `Summary ${index}`,
    imgSrc:
      overrides.imgSrc ??
      `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80&sig=${index}`,
    slug: overrides.slug ?? `post-${index}`,
    link: overrides.link ?? `/inspire/post-${index}`,
    eyebrow: overrides.eyebrow ?? `Author ${index}`,
    publishedAt: overrides.publishedAt ?? `2026-04-${String(index).padStart(2, '0')}T12:00:00Z`,
    linkText: overrides.linkText ?? 'Ler artigo',
  }
}

function renderInspirePage() {
  return render(
    <MemoryRouter initialEntries={['/inspire']}>
      <Routes>
        <Route element={<InspireLayout />}>
          <Route path="/inspire" element={<Inspire />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  observerInstances = []
  globalThis.IntersectionObserver = ControlledIntersectionObserver
  fetchMock = vi.fn(async (input, init) => {
    const path = typeof input === 'string' ? input : input.toString()
    const slug = path.match(/\/api\/posts\/([^/]+)\/likes/)?.[1] ?? 'post'
    const numericMatch = slug.match(/(\d+)/)
    const count = Number(numericMatch?.[1] ?? 7)

    return {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ slug, count }),
    }
  })
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  globalThis.IntersectionObserver = originalIntersectionObserver
  vi.unstubAllGlobals()
})

describe('Inspire', () => {
  it('renders inside the editorial shell instead of the institutional header', async () => {
    client.fetch.mockResolvedValue([
      {
        title: 'Should You Still Learn to Code in 2026?',
        description: 'The answer is not as obvious as it used to be.',
        imgSrc: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        slug: 'should-you-still-learn-to-code',
        link: '/inspire/should-you-still-learn-to-code',
        eyebrow: 'Data Science Collective',
        publishedAt: '2026-04-10T12:00:00Z',
        linkText: 'Ler artigo',
      },
      {
        title: 'Claude Code is Great',
        description: 'You just need to learn how to use it.',
        imgSrc: 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80',
        slug: 'claude-code-is-great',
        link: '/inspire/claude-code-is-great',
        eyebrow: 'Leo Godin',
        publishedAt: '2026-04-08T12:00:00Z',
        linkText: 'Ler artigo',
      },
      {
        title: 'The End of Dashboards and Design Systems',
        description: 'Design is becoming quietly human again.',
        imgSrc: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        slug: 'the-end-of-dashboards',
        link: '/inspire/the-end-of-dashboards',
        eyebrow: 'Michal Malewicz',
        publishedAt: '2026-04-04T12:00:00Z',
        linkText: 'Ler artigo',
      },
    ])

    renderInspirePage()

    const nav = screen.getByRole('navigation', { name: 'Navegação do Inspire' })
    const main = document.querySelector('.inspire-shell__main')

    expect(nav).toBeInTheDocument()
    expect(nav).toHaveClass('w-full', 'max-w-full', 'mx-auto')
    expect(nav).toHaveClass('px-6', 'sm:px-8', 'lg:px-12')
    expect(main).toHaveClass('px-4', 'sm:px-6', 'lg:px-8')
    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para o site Otimiza' })).toHaveAttribute('href', '/')
    expect(await screen.findAllByRole('heading', { name: 'Should You Still Learn to Code in 2026?' })).toHaveLength(2)
    expect(screen.getByText('Buscar')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Assinar newsletter' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Para você' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Em destaque' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByText('Seleções da redação')).toBeInTheDocument()
    expect(screen.getByText('Tópicos recomendados')).toBeInTheDocument()
    expect(screen.getByText('Quem seguir')).toBeInTheDocument()
  })

  it('renders the article card actions in Portuguese with like and share controls', async () => {
    client.fetch.mockResolvedValue([
      makePost(1, {
        title: 'Post 1',
        description: 'Resumo do post 1',
        eyebrow: 'Redacao Otimiza',
        publishedAt: '2026-04-09T12:00:00Z',
      }),
    ])

    renderInspirePage()

    await screen.findAllByRole('heading', { name: 'Post 1' })

    const firstStory = document.querySelector('.inspire-story')
    expect(firstStory).not.toBeNull()

    expect(within(firstStory).getByText(/min de leitura/i)).toBeInTheDocument()
    const likeButton = await within(firstStory).findByRole('button', { name: /1 curtida/i })
    const count = firstStory.querySelector('.post-like-button__count')
    expect(likeButton).not.toHaveTextContent('1')
    expect(count?.textContent).toBe('1')
    expect(likeButton.contains(count)).toBe(false)
    expect(within(firstStory).queryByText(/^Curtir$/i)).not.toBeInTheDocument()
    expect(within(firstStory).getByRole('button', { name: 'Compartilhar' })).toBeInTheDocument()
    expect(within(firstStory).queryByText(/notes/i)).not.toBeInTheDocument()
    expect(within(firstStory).queryByText(/min read/i)).not.toBeInTheDocument()
    expect(firstStory.querySelector('.inspire-story__date svg')).toBeNull()
    expect(within(firstStory).getByRole('link', { name: 'Ler Post 1' })).toBeInTheDocument()
  })

  it('loads 15 posts first and appends 5 more when the scroll sentinel intersects', async () => {
    client.fetch
      .mockResolvedValueOnce(Array.from({ length: 15 }, (_, index) => makePost(index + 1)))
      .mockResolvedValueOnce(Array.from({ length: 5 }, (_, index) => makePost(index + 16)))

    renderInspirePage()

    expect(await screen.findByRole('heading', { name: 'Post 1' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Post 15' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByRole('heading', { name: 'Post 16' })).not.toBeInTheDocument()

    expect(client.fetch).toHaveBeenNthCalledWith(1, expect.stringContaining('[$start...$end]'), {
      start: 0,
      end: 15,
    })

    const sentinel = document.querySelector('.inspire-page__sentinel')
    triggerIntersection(sentinel)

    expect(await screen.findByRole('heading', { name: 'Post 20' })).toBeInTheDocument()
    expect(client.fetch).toHaveBeenNthCalledWith(2, expect.stringContaining('[$start...$end]'), {
      start: 15,
      end: 20,
    })
  })

  it('keeps the sidebar fixed from the initial load when later batches arrive', async () => {
    client.fetch
      .mockResolvedValueOnce([
        makePost(1, {
          title: 'Initial Lead',
          eyebrow: 'Initial Author',
          publishedAt: '2026-04-30T12:00:00Z',
        }),
        ...Array.from({ length: 14 }, (_, index) => makePost(index + 2)),
      ])
      .mockResolvedValueOnce([
        makePost(16, { title: 'Late Arrival', eyebrow: 'Late Topic' }),
        makePost(17, { title: 'Late Arrival 2', eyebrow: 'Late Topic 2' }),
        makePost(18, { title: 'Late Arrival 3', eyebrow: 'Late Topic 3' }),
        makePost(19, { title: 'Late Arrival 4', eyebrow: 'Late Topic 4' }),
        makePost(20, { title: 'Late Arrival 5', eyebrow: 'Late Topic 5' }),
      ])

    renderInspirePage()

    const sidebar = document.querySelector('.inspire-sidebar')
    expect(await screen.findAllByRole('heading', { name: 'Initial Lead' })).toHaveLength(2)
    expect(within(sidebar).getAllByText('Initial Author').length).toBeGreaterThanOrEqual(1)

    const sentinel = document.querySelector('.inspire-page__sentinel')
    triggerIntersection(sentinel)

    expect(await screen.findByRole('heading', { name: 'Late Arrival' })).toBeInTheDocument()

    await waitFor(() => {
      expect(within(sidebar).queryByText('Late Topic')).not.toBeInTheDocument()
      expect(within(sidebar).getAllByText('Initial Author').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('keeps article links usable when Sanity falls back to static blog posts', async () => {
    client.fetch.mockRejectedValueOnce(new Error('sanity unavailable'))

    renderInspirePage()

    const articleLinks = await screen.findAllByRole('link', { name: /^Ler /i })

    expect(articleLinks.length).toBeGreaterThan(0)
    articleLinks.forEach((link) => {
      expect(link.getAttribute('href')).toMatch(/^\/inspire\/.+/)
      expect(link.getAttribute('href')).not.toBe('/inspire')
    })
  })
})
