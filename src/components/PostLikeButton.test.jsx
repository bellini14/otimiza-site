import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PostLikeButton from './PostLikeButton'

function createJsonResponse(payload, ok = true, status = ok ? 200 : 500) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(payload),
  }
}

describe('PostLikeButton', () => {
  let fetchMock
  let consoleErrorSpy

  beforeEach(() => {
    fetchMock = vi.fn()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', fetchMock)
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    consoleErrorSpy.mockRestore()
  })

  it('renders the fetched count as the visible button label', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))

    const { container } = render(<PostLikeButton slug="post-com-imagem-inline" />)

    const button = await screen.findByRole('button', { name: /7 curtidas/i })
    const count = container.querySelector('.post-like-button__count')

    expect(button).toBeInTheDocument()
    expect(button).not.toHaveTextContent('7')
    expect(container.querySelector('.post-like-button__icon-shell')).not.toBeNull()
    expect(count).not.toBeNull()
    expect(count?.textContent).toBe('7')
    expect(button.contains(count)).toBe(false)
    expect(fetchMock).toHaveBeenCalledWith('/api/posts/post-com-imagem-inline/likes', { method: 'GET' })
  })

  it('renders active immediately when the browser already liked the post', async () => {
    window.localStorage.setItem('post-like:post-com-imagem-inline', 'true')
    fetchMock.mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))

    render(<PostLikeButton slug="post-com-imagem-inline" />)

    const button = await screen.findByRole('button', { name: /7 curtidas, curtido/i })

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('increments the count and persists local state after a successful like', async () => {
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 8, liked: true }))

    render(<PostLikeButton slug="post-com-imagem-inline" />)

    const button = await screen.findByRole('button', { name: /7 curtidas/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /8 curtidas, curtido/i })).toBeDisabled()
    })

    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/posts/post-com-imagem-inline/likes', { method: 'POST' })
    expect(window.localStorage.getItem('post-like:post-com-imagem-inline')).toBe('true')
  })

  it('does not create false liked state when the post request fails', async () => {
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))
      .mockResolvedValueOnce(createJsonResponse({ error: 'boom' }, false, 500))

    render(<PostLikeButton slug="post-com-imagem-inline" />)

    const button = await screen.findByRole('button', { name: /7 curtidas/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    expect(screen.getByRole('button', { name: /7 curtidas/i })).toBeEnabled()
    expect(window.localStorage.getItem('post-like:post-com-imagem-inline')).toBeNull()
  })
})
