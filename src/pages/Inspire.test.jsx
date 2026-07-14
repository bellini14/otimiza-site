import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, MemoryRouter, Route, RouterProvider, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../lib/sanity', () => ({
  client: {
    fetch: vi.fn(),
  },
}))

import { client } from '../lib/sanity'
import InspireLayout from '../components/InspireLayout'
import { staticBlogPosts } from '../data/blogPosts'
import { clearCachedInspirePosts, setCachedInspirePosts } from '../lib/inspirePostCache'
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

function deferred() {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, reject, resolve }
}

function renderInspirePage(path = '/inspire') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<InspireLayout />}>
          <Route path="/inspire" element={<Inspire />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  clearCachedInspirePosts()
  client.fetch.mockReset()
  observerInstances = []
  globalThis.IntersectionObserver = ControlledIntersectionObserver
  fetchMock = vi.fn(async (input) => {
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
  clearCachedInspirePosts()
  cleanup()
  vi.clearAllMocks()
  globalThis.IntersectionObserver = originalIntersectionObserver
  vi.unstubAllGlobals()
})

describe('Inspire', () => {
  it('renders exactly one descriptive H1 for the editorial page', async () => {
    client.fetch.mockResolvedValue([])

    renderInspirePage()

    const headings = await screen.findAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent('Inspire: conteúdos sobre gestão e processos')
  })

  it('renders cached Sanity stories immediately while the refresh request is still pending', () => {
    setCachedInspirePosts([
      makePost(101, {
        title: 'Cached Sanity Post',
        eyebrow: 'Sanity Cache',
      }),
    ])
    client.fetch.mockReturnValue(new Promise(() => {}))

    renderInspirePage()

    expect(screen.getAllByRole('heading', { name: 'Cached Sanity Post' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText(staticBlogPosts[0].title)).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Pesquisar no Inspire' })).toBeInTheDocument()
    expect(document.querySelector('.inspire-page__loading')).toBeNull()
  })

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
    expect(screen.getByRole('button', { name: /voltar para a p.+gina anterior/i })).toBeInTheDocument()
    expect(await screen.findAllByRole('heading', { name: 'Should You Still Learn to Code in 2026?' })).toHaveLength(2)
    expect(screen.getByRole('textbox', { name: 'Pesquisar no Inspire' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Assinar newsletter' })).toBeInTheDocument()
    const filters = screen.getByRole('group', { name: 'Filtrar artigos por categoria' })
    expect(within(filters).getByRole('button', { name: 'Tudo' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(filters).getByRole('button', { name: 'Artigos' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('Seleções da redação')).toBeInTheDocument()
    expect(screen.getByText('Tópicos recomendados')).toBeInTheDocument()
    expect(screen.getByText('Quem seguir')).toBeInTheDocument()
  })

  it('filters the Inspire feed by the requested categories', async () => {
    client.fetch
      .mockResolvedValueOnce([
        makePost(1, { title: 'Artigo inicial', eyebrow: 'Artigos' }),
        makePost(2, { title: 'Vídeo inicial', eyebrow: 'Dica para assistir' }),
      ])
      .mockResolvedValueOnce([
        makePost(3, { title: 'Novo artigo filtrado', eyebrow: 'Artigos' }),
      ])

    renderInspirePage()

    expect(await screen.findAllByRole('heading', { name: 'Artigo inicial' })).not.toHaveLength(0)

    const filters = screen.getByRole('group', { name: 'Filtrar artigos por categoria' })
    expect(within(filters).getAllByRole('button').map((button) => button.textContent)).toEqual([
      'Tudo',
      'Artigos',
      'Editorial',
      'Dica de leitura',
      'Dica para assistir',
      'Lente analítica',
    ])
    expect(within(filters).getByRole('button', { name: 'Tudo' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.queryByRole('tab', { name: 'Para você' })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Em destaque' })).not.toBeInTheDocument()

    fireEvent.click(within(filters).getByRole('button', { name: 'Artigos' }))

    expect(await screen.findByRole('heading', { name: 'Novo artigo filtrado' })).toBeInTheDocument()
    const stories = document.querySelector('.inspire-page__stories')
    expect(within(stories).queryByRole('heading', { name: 'Vídeo inicial' })).not.toBeInTheDocument()
    expect(within(filters).getByRole('button', { name: 'Tudo' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(within(filters).getByRole('button', { name: 'Artigos' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(client.fetch).toHaveBeenLastCalledWith(expect.stringContaining('eyebrow == $category'), {
      category: 'Artigos',
      start: 0,
      end: 15,
    })
  })

  it('filters Editorial posts with the canonical Sanity category', async () => {
    client.fetch
      .mockResolvedValueOnce([
        makePost(1, { title: 'Artigo inicial', eyebrow: 'Artigos' }),
      ])
      .mockResolvedValueOnce([
        makePost(2, { title: 'Conteúdo editorial', eyebrow: 'Editorial' }),
      ])

    renderInspirePage()
    await screen.findAllByRole('heading', { name: 'Artigo inicial' })

    fireEvent.click(screen.getByRole('button', { name: 'Editorial' }))

    expect(await screen.findByRole('heading', { name: 'Conteúdo editorial' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editorial' })).toHaveAttribute('aria-pressed', 'true')
    expect(client.fetch).toHaveBeenLastCalledWith(expect.stringContaining('eyebrow == $category'), {
      category: 'Editorial',
      start: 0,
      end: 15,
    })
  })

  it('keeps infinite loading restricted to the selected category', async () => {
    client.fetch
      .mockResolvedValueOnce(Array.from({ length: 15 }, (_, index) => makePost(index + 1)))
      .mockResolvedValueOnce(
        Array.from({ length: 15 }, (_, index) =>
          makePost(index + 101, { eyebrow: 'Dica de Leitura' }),
        ),
      )
      .mockResolvedValueOnce(
        Array.from({ length: 5 }, (_, index) =>
          makePost(index + 116, { eyebrow: 'Dica de Leitura' }),
        ),
      )

    renderInspirePage()

    await screen.findAllByRole('heading', { name: 'Post 15' })
    fireEvent.click(screen.getByRole('button', { name: 'Dica de leitura' }))
    await screen.findByRole('heading', { name: 'Post 115' })

    const sentinel = document.querySelector('.inspire-page__sentinel')
    triggerIntersection(sentinel)

    expect(await screen.findByRole('heading', { name: 'Post 120' })).toBeInTheDocument()
    expect(client.fetch).toHaveBeenLastCalledWith(expect.stringContaining('eyebrow == $category'), {
      category: 'Dica de Leitura',
      start: 15,
      end: 20,
    })
  })

  it('ignores a stale category response after a newer filter is selected', async () => {
    const readingRequest = deferred()
    const watchRequest = deferred()
    client.fetch
      .mockResolvedValueOnce([makePost(1, { eyebrow: 'Artigos' })])
      .mockImplementationOnce(() => readingRequest.promise)
      .mockImplementationOnce(() => watchRequest.promise)

    renderInspirePage()
    await screen.findAllByRole('heading', { name: 'Post 1' })

    fireEvent.click(screen.getByRole('button', { name: 'Dica de leitura' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dica para assistir' }))

    await act(async () => {
      watchRequest.resolve([makePost(20, { title: 'Resposta mais recente', eyebrow: 'Dica para assistir' })])
    })
    expect(await screen.findByRole('heading', { name: 'Resposta mais recente' })).toBeInTheDocument()

    await act(async () => {
      readingRequest.resolve([makePost(21, { title: 'Resposta antiga', eyebrow: 'Dica de leitura' })])
    })

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Resposta antiga' })).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Resposta mais recente' })).toBeInTheDocument()
    })
  })

  it('ignores a stale pagination failure after another category is selected', async () => {
    const stalePagination = deferred()
    client.fetch
      .mockResolvedValueOnce(Array.from({ length: 15 }, (_, index) => makePost(index + 1)))
      .mockResolvedValueOnce(
        Array.from({ length: 15 }, (_, index) =>
          makePost(index + 101, { eyebrow: 'Dica de leitura' }),
        ),
      )
      .mockImplementationOnce(() => stalePagination.promise)
      .mockResolvedValueOnce([
        makePost(200, { title: 'Categoria atual', eyebrow: 'Dica para assistir' }),
      ])

    renderInspirePage()
    await screen.findAllByRole('heading', { name: 'Post 15' })
    fireEvent.click(screen.getByRole('button', { name: 'Dica de leitura' }))
    await screen.findByRole('heading', { name: 'Post 115' })

    triggerIntersection(document.querySelector('.inspire-page__sentinel'))
    fireEvent.click(screen.getByRole('button', { name: 'Dica para assistir' }))
    expect(await screen.findByRole('heading', { name: 'Categoria atual' })).toBeInTheDocument()

    await act(async () => {
      stalePagination.reject(new Error('old request failed'))
    })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Categoria atual' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Tentar carregar novamente' })).not.toBeInTheDocument()
    })
  })

  it('waits for bootstrap before deciding how to load a selected category', async () => {
    const bootstrapRequest = deferred()
    client.fetch
      .mockImplementationOnce(() => bootstrapRequest.promise)
      .mockResolvedValueOnce([
        makePost(30, { title: 'Artigo vindo do Sanity', eyebrow: 'Artigos' }),
      ])

    renderInspirePage()
    fireEvent.click(screen.getByRole('button', { name: 'Artigos' }))

    expect(document.querySelector('.inspire-page__stories')).toBeNull()
    expect(client.fetch).toHaveBeenCalledTimes(1)

    await act(async () => {
      bootstrapRequest.resolve([makePost(1, { eyebrow: 'Artigos' })])
    })

    expect(await screen.findByRole('heading', { name: 'Artigo vindo do Sanity' })).toBeInTheDocument()
    expect(client.fetch).toHaveBeenLastCalledWith(expect.stringContaining('eyebrow == $category'), {
      category: 'Artigos',
      start: 0,
      end: 15,
    })
  })

  it('shows an explicit empty state for a category without posts', async () => {
    client.fetch
      .mockResolvedValueOnce([makePost(1, { eyebrow: 'Artigos' })])
      .mockResolvedValueOnce([])

    renderInspirePage()
    await screen.findAllByRole('heading', { name: 'Post 1' })
    fireEvent.click(screen.getByRole('button', { name: 'Dica para assistir' }))

    expect(await screen.findByText('Nenhum artigo encontrado nesta categoria.')).toBeInTheDocument()
  })

  it('filters the confirmed static fallback with Inspire categories', async () => {
    client.fetch.mockRejectedValueOnce(new Error('sanity unavailable'))

    renderInspirePage()
    await screen.findAllByRole('heading', { name: staticBlogPosts[0].title })

    const categories = [
      ['Editorial', 'Editorial'],
      ['Artigos', 'Artigos'],
      ['Dica de leitura', 'Dica de leitura'],
      ['Dica para assistir', 'Dica para assistir'],
      ['Lente analítica', 'Lente Analítica'],
    ]

    for (const [label, category] of categories) {
      fireEvent.click(screen.getByRole('button', { name: label }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'true')
        const renderedTitles = Array.from(document.querySelectorAll('.inspire-story__title'))
          .map((heading) => heading.textContent)
        const expectedTitles = staticBlogPosts
          .filter((post) => post.inspireCategory === category)
          .map((post) => post.title)
        expect(renderedTitles).toEqual(expectedTitles)
        expect(renderedTitles.length).toBeGreaterThan(0)
      })
    }
  })

  it('keeps search results independent and hides category filters while searching', async () => {
    client.fetch
      .mockResolvedValueOnce([makePost(1, { eyebrow: 'Artigos' })])
      .mockResolvedValueOnce([
        makePost(40, { title: 'Resultado da busca', eyebrow: 'Dica para assistir' }),
      ])

    renderInspirePage('/inspire?q=resultado')

    expect(screen.queryByRole('group', { name: 'Filtrar artigos por categoria' })).not.toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Resultado da busca' })).toBeInTheDocument()
    expect(screen.getByText('1 resultado para "resultado"')).toBeInTheDocument()
  })

  it('restores the selected category after search is cleared', async () => {
    client.fetch
      .mockResolvedValueOnce([makePost(1, { eyebrow: 'Artigos' })])
      .mockResolvedValueOnce([
        makePost(50, { title: 'Leitura selecionada', eyebrow: 'Dica de leitura' }),
      ])
      .mockResolvedValueOnce([
        makePost(51, { title: 'Resultado temporário', eyebrow: 'Artigos' }),
      ])

    renderInspirePage()
    await screen.findAllByRole('heading', { name: 'Post 1' })
    fireEvent.click(screen.getByRole('button', { name: 'Dica de leitura' }))
    expect(await screen.findByRole('heading', { name: 'Leitura selecionada' })).toBeInTheDocument()

    const searchInput = screen.getByRole('textbox', { name: 'Pesquisar no Inspire' })
    fireEvent.change(searchInput, { target: { value: 'temporário' } })
    expect(await screen.findByRole('heading', { name: 'Resultado temporário' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Filtrar artigos por categoria' })).not.toBeInTheDocument()

    fireEvent.change(searchInput, { target: { value: '' } })
    const filters = await screen.findByRole('group', { name: 'Filtrar artigos por categoria' })
    expect(within(filters).getByRole('button', { name: 'Dica de leitura' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('heading', { name: 'Leitura selecionada' })).toBeInTheDocument()
  })

  it('returns to the previous page instead of forcing the home route', async () => {
    const router = createMemoryRouter(
      [
        {
          element: <InspireLayout />,
          children: [
            { path: '/', element: <div>Home</div> },
            { path: '/inspire', element: <div>Inspire</div> },
          ],
        },
      ],
      {
        initialEntries: ['/inspire'],
        initialIndex: 0,
      },
    )

    render(<RouterProvider router={router} />)

    fireEvent.click(screen.getByRole('button', { name: /voltar para a p.+gina anterior/i }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/')
    })

    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('returns to the previous page on non-landing Inspire routes', async () => {
    const router = createMemoryRouter(
      [
        {
          element: <InspireLayout />,
          children: [
            { path: '/contato', element: <div>Contato</div> },
            { path: '/inspire/newsletter', element: <div>Newsletter</div> },
          ],
        },
      ],
      {
        initialEntries: ['/contato', '/inspire/newsletter'],
        initialIndex: 1,
      },
    )

    render(<RouterProvider router={router} />)

    fireEvent.click(screen.getByRole('button', { name: /voltar para a p.+gina anterior/i }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/contato')
    })

    expect(screen.getByText('Contato')).toBeInTheDocument()
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

    expect(await screen.findAllByRole('heading', { name: 'Post 15' })).toHaveLength(2)
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
