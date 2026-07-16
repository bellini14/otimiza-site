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

function createDeferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
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

    expect(button).toBeEnabled()
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('keeps the last known count visible while refetching the same slug after navigation', async () => {
    const pendingReload = createDeferred()

    fetchMock.mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))

    const firstRender = render(<PostLikeButton slug="post-com-imagem-inline" />)

    await screen.findByRole('button', { name: /7 curtidas/i })

    firstRender.unmount()

    fetchMock.mockReturnValueOnce(pendingReload.promise)

    render(<PostLikeButton slug="post-com-imagem-inline" />)

    const cachedButton = screen.getByRole('button', { name: /7 curtidas/i })

    expect(cachedButton).toBeInTheDocument()
    expect(screen.getByText('7')).toHaveClass('post-like-button__count')

    pendingReload.resolve(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })
  })

  it('increments the count and persists local state after a successful like', async () => {
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 8, liked: true }))

    render(<PostLikeButton slug="post-com-imagem-inline" />)

    const button = await screen.findByRole('button', { name: /7 curtidas/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /8 curtidas, curtido/i })).toHaveAttribute('aria-pressed', 'true')
    })

    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/posts/post-com-imagem-inline/likes', { method: 'POST' })
    expect(window.localStorage.getItem('post-like:post-com-imagem-inline')).toBe('true')
  })

  it('updates the visual liked state immediately while the like request is in flight', async () => {
    const pendingLikeRequest = createDeferred()

    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))
      .mockReturnValueOnce(pendingLikeRequest.promise)

    render(<PostLikeButton slug="post-com-imagem-inline" />)

    const button = await screen.findByRole('button', { name: /7 curtidas/i })
    fireEvent.click(button)

    const optimisticButton = screen.getByRole('button', { name: /8 curtidas, curtido/i })

    expect(optimisticButton).toHaveAttribute('aria-pressed', 'true')
    expect(optimisticButton).toBeEnabled()
    expect(optimisticButton).toHaveAttribute('aria-disabled', 'true')
    expect(window.localStorage.getItem('post-like:post-com-imagem-inline')).toBeNull()

    pendingLikeRequest.resolve(
      createJsonResponse({ slug: 'post-com-imagem-inline', count: 8, liked: true })
    )

    await waitFor(() => {
      expect(window.localStorage.getItem('post-like:post-com-imagem-inline')).toBe('true')
    })
    expect(screen.getByRole('button', { name: /8 curtidas, curtido/i })).toHaveAttribute(
      'aria-disabled',
      'false'
    )
  })

  it('confirms a like immediately with a filled heart, pulse and updated label', async () => {
    const pendingLikeRequest = createDeferred()

    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))
      .mockReturnValueOnce(pendingLikeRequest.promise)

    const { container } = render(
      <PostLikeButton slug="post-com-imagem-inline" showLabel />
    )

    const button = await screen.findByRole('button', { name: /7 curtidas/i })
    fireEvent.click(button)

    expect(screen.getByText('Curtido')).toHaveClass('post-like-button__label')
    expect(screen.getByRole('status')).toHaveTextContent('Artigo curtido')
    expect(button).toHaveClass('post-like-button--feedback')
    expect(container.querySelector('.post-like-button__icon--popping')).not.toBeNull()
    expect(container.querySelector('.post-like-button__icon svg')).toHaveAttribute(
      'fill',
      'currentColor'
    )

    pendingLikeRequest.resolve(
      createJsonResponse({ slug: 'post-com-imagem-inline', count: 8, liked: true })
    )

    await waitFor(() => {
      expect(window.localStorage.getItem('post-like:post-com-imagem-inline')).toBe('true')
    })
  })

  it('decrements the count and removes local state after a successful unlike', async () => {
    window.localStorage.setItem('post-like:post-com-imagem-inline', 'true')
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 6, liked: false }))

    render(<PostLikeButton slug="post-com-imagem-inline" />)

    const button = await screen.findByRole('button', { name: /7 curtidas, curtido/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /6 curtidas/i })).toHaveAttribute('aria-pressed', 'false')
    })

    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/posts/post-com-imagem-inline/likes', { method: 'DELETE' })
    expect(window.localStorage.getItem('post-like:post-com-imagem-inline')).toBeNull()
  })

  it('updates the visual unliked state immediately while the unlike request is in flight', async () => {
    const pendingUnlikeRequest = createDeferred()

    window.localStorage.setItem('post-like:post-com-imagem-inline', 'true')
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))
      .mockReturnValueOnce(pendingUnlikeRequest.promise)

    render(<PostLikeButton slug="post-com-imagem-inline" />)

    const button = await screen.findByRole('button', { name: /7 curtidas, curtido/i })
    fireEvent.click(button)

    const optimisticButton = screen.getByRole('button', { name: /6 curtidas/i })

    expect(optimisticButton).toHaveAttribute('aria-pressed', 'false')
    expect(optimisticButton).toBeEnabled()
    expect(optimisticButton).toHaveAttribute('aria-disabled', 'true')
    expect(window.localStorage.getItem('post-like:post-com-imagem-inline')).toBe('true')

    pendingUnlikeRequest.resolve(
      createJsonResponse({ slug: 'post-com-imagem-inline', count: 6, liked: false })
    )

    await waitFor(() => {
      expect(window.localStorage.getItem('post-like:post-com-imagem-inline')).toBeNull()
    })
    expect(screen.getByRole('button', { name: /6 curtidas/i })).toHaveAttribute(
      'aria-disabled',
      'false'
    )
  })

  it('does not create false liked state when the post request fails', async () => {
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))
      .mockResolvedValueOnce(createJsonResponse({ error: 'boom' }, false, 500))

    render(<PostLikeButton slug="post-com-imagem-inline" showLabel />)

    const button = await screen.findByRole('button', { name: /7 curtidas/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    expect(screen.getByRole('button', { name: /7 curtidas/i })).toBeEnabled()
    expect(screen.getByText('Curtir')).toHaveClass('post-like-button__label')
    expect(screen.getByRole('status')).toHaveTextContent('Não foi possível curtir. Tente novamente.')
    expect(window.localStorage.getItem('post-like:post-com-imagem-inline')).toBeNull()
  })

  it('keeps the liked state when the unlike request fails', async () => {
    window.localStorage.setItem('post-like:post-com-imagem-inline', 'true')
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))
      .mockResolvedValueOnce(createJsonResponse({ error: 'boom' }, false, 500))

    render(<PostLikeButton slug="post-com-imagem-inline" />)

    const button = await screen.findByRole('button', { name: /7 curtidas, curtido/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    expect(screen.getByRole('button', { name: /7 curtidas, curtido/i })).toHaveAttribute('aria-pressed', 'true')
    expect(window.localStorage.getItem('post-like:post-com-imagem-inline')).toBe('true')
  })
})
