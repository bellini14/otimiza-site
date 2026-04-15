import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PostDetail from './PostDetail'
import { client } from '../lib/sanity'

vi.mock('../lib/sanity', () => ({
  client: {
    fetch: vi.fn(),
  },
  urlFor: vi.fn((source) => ({
    width: vi.fn(() => ({
      url: () => source?.assetUrl ?? source?.asset?._ref ?? 'https://cdn.sanity.io/images/fallback.jpg',
    })),
  })),
}))

function createJsonResponse(payload, ok = true, status = ok ? 200 : 500) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(payload),
  }
}

function buildPostResponse() {
  return {
    post: {
      title: 'Post com imagem inline',
      description: 'Resumo do post',
      publishedAt: '2026-04-13T12:00:00Z',
      eyebrow: 'Insights',
      mainImage: null,
      content: [
        {
          _type: 'block',
          _key: 'intro',
          style: 'normal',
          markDefs: [],
          children: [
            {
              _type: 'span',
              _key: 'intro-span',
              marks: [],
              text: 'Paragrafo de abertura.',
            },
          ],
        },
        {
          _type: 'image',
          _key: 'body-image',
          alt: 'Equipe em workshop',
          caption: 'Workshop com o time do cliente.',
          assetUrl: 'https://cdn.sanity.io/images/demo/workshop.jpg',
          asset: {
            _ref: 'image-demo-workshop-1200x800-jpg',
          },
        },
      ],
    },
    more: [],
  }
}

function renderPostDetail() {
  return render(
    <MemoryRouter initialEntries={['/inspire/post-com-imagem-inline']}>
      <Routes>
        <Route path="/inspire/:slug" element={<PostDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

let fetchMock
let consoleErrorSpy

beforeEach(() => {
  client.fetch.mockResolvedValue(buildPostResponse())
  fetchMock = vi.fn()
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.stubGlobal('fetch', fetchMock)
  window.scrollTo = vi.fn()
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
  consoleErrorSpy.mockRestore()
})

describe('PostDetail', () => {
  it('renders inline body images, captions, and the fetched global like count', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))

    renderPostDetail()

    expect(await screen.findByRole('heading', { name: 'Post com imagem inline' })).toBeInTheDocument()
    expect(screen.getByText('Paragrafo de abertura.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Equipe em workshop' })).toHaveAttribute(
      'src',
      'https://cdn.sanity.io/images/demo/workshop.jpg',
    )
    expect(screen.getByText('Workshop com o time do cliente.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /voltar para inspire/i })).toHaveAttribute('href', '/inspire')
    expect(screen.getByText('Obrigado por ler na Inspire.')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /7 curtidas/i })).toHaveTextContent('7')
    expect(fetchMock).toHaveBeenCalledWith('/api/posts/post-com-imagem-inline/likes', { method: 'GET' })
  })

  it('shows the liked state immediately when the browser already stored the like', async () => {
    window.localStorage.setItem('post-like:post-com-imagem-inline', 'true')
    fetchMock.mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))

    renderPostDetail()

    expect(await screen.findByRole('button', { name: /7 curtidas, curtido/i })).toBeDisabled()
  })

  it('marks the post as liked after a successful click and persists it locally', async () => {
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 8, liked: true }))

    renderPostDetail()

    const likeButton = await screen.findByRole('button', { name: /7 curtidas/i })
    fireEvent.click(likeButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /8 curtidas, curtido/i })).toBeDisabled()
    })

    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/posts/post-com-imagem-inline/likes', { method: 'POST' })
    expect(window.localStorage.getItem('post-like:post-com-imagem-inline')).toBe('true')
  })

  it('does not mark the post as liked locally if the like request fails', async () => {
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))
      .mockResolvedValueOnce(createJsonResponse({ error: 'boom' }, false, 500))

    renderPostDetail()

    const likeButton = await screen.findByRole('button', { name: /7 curtidas/i })
    fireEvent.click(likeButton)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    expect(screen.getByRole('button', { name: /7 curtidas/i })).toBeEnabled()
    expect(window.localStorage.getItem('post-like:post-com-imagem-inline')).toBeNull()
  })

  it('keeps the page usable when the initial like count request fails', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({ error: 'boom' }, false, 500))

    renderPostDetail()

    expect(await screen.findByRole('heading', { name: 'Post com imagem inline' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /curtir este post/i })).toBeEnabled()
    expect(screen.queryByText(/curtidas/i)).not.toBeInTheDocument()
  })
})
