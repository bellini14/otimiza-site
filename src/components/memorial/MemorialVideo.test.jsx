import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MEMORIAL_VIDEO_POSTER,
  resolveVideoDefaults,
} from '../../lib/memorialVideoConfig'
import MemorialVideo from './MemorialVideo'

let intersectionCallback
let resizeCallback
let intersectionDisconnect
let resizeDisconnect
let reducedMotion = false

beforeEach(() => {
  intersectionDisconnect = vi.fn()
  resizeDisconnect = vi.fn()
  reducedMotion = false
  globalThis.IntersectionObserver = class {
    constructor(callback) { intersectionCallback = callback }
    observe() {}
    disconnect() { intersectionDisconnect() }
  }
  globalThis.ResizeObserver = class {
    constructor(callback) { resizeCallback = callback }
    observe() {}
    disconnect() { resizeDisconnect() }
  }
  window.matchMedia = vi.fn(() => ({
    matches: reducedMotion,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: 'visible',
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('MemorialVideo', () => {
  it('uses the bundled slow-motion video, poster and permanent mute', () => {
    const { container } = render(<MemorialVideo />)
    const video = container.querySelector('video')

    expect(video).not.toBeNull()
    expect(video).toHaveAttribute('src', '/media/silvana-homenagem.mp4')
    expect(video).toHaveAttribute('poster', MEMORIAL_VIDEO_POSTER)
    expect(video.autoplay).toBe(true)
    expect(video.loop).toBe(true)
    expect(video.muted).toBe(true)
    expect(video.playsInline).toBe(true)
    expect(video.playbackRate).toBe(0.5)
    expect(video.defaultPlaybackRate).toBe(0.5)
    expect(screen.queryByRole('button', { name: 'Ativar som do vídeo' })).not.toBeInTheDocument()

    video.playbackRate = 1
    video.defaultPlaybackRate = 1
    fireEvent.loadedMetadata(video)

    expect(video.playbackRate).toBe(0.5)
    expect(video.defaultPlaybackRate).toBe(0.5)
  })

  it('keeps bundled and external video sources without sound', () => {
    expect(resolveVideoDefaults({
      VITE_SILVANA_VIDEO_URL: 'https://cdn.example.com/silvana.mp4',
      VITE_SILVANA_VIDEO_HAS_AUDIO: 'true',
    })).toEqual({
      src: 'https://cdn.example.com/silvana.mp4',
      hasAudio: false,
    })
    expect(resolveVideoDefaults({})).toEqual({
      src: '/media/silvana-homenagem.mp4',
      hasAudio: false,
    })
  })

  it('uses one animation frame for repeated scroll and resize signals', () => {
    let scheduled
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      scheduled = callback
      return 17
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    const { container } = render(<MemorialVideo />)
    const section = container.querySelector('.memorial-video-section')
    vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({
      top: -500,
      height: 2000,
    })
    requestFrame.mockClear()

    fireEvent.scroll(window)
    fireEvent.scroll(window)
    act(() => scheduled())

    expect(requestFrame).toHaveBeenCalledTimes(1)
    expect(section.style.getPropertyValue('--memorial-video-progress')).not.toBe('')

    act(() => resizeCallback())
    expect(requestFrame).toHaveBeenCalledTimes(2)
  })

  it('tracks scrolling when the body is the page scroll container', () => {
    let scheduled
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      scheduled = callback
      return 23
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    const { container } = render(<MemorialVideo />)
    const section = container.querySelector('.memorial-video-section')
    vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({
      top: -700,
      height: 2000,
    })
    requestFrame.mockClear()

    fireEvent.scroll(document.body)

    expect(requestFrame).toHaveBeenCalledTimes(1)
    act(() => scheduled())
    expect(Number(section.style.getPropertyValue('--memorial-video-progress'))).toBeGreaterThan(0)
  })

  it('pauses offscreen and resumes only while visible', async () => {
    const { container } = render(<MemorialVideo />)
    const video = container.querySelector('video')

    act(() => intersectionCallback([{ isIntersecting: false }]))
    await waitFor(() => expect(video.pause).toHaveBeenCalled())
    act(() => intersectionCallback([{ isIntersecting: true }]))
    await waitFor(() => expect(video.play).toHaveBeenCalled())

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    })
    fireEvent(document, new Event('visibilitychange'))
    await waitFor(() => expect(video.pause).toHaveBeenCalledTimes(2))
  })

  it('shows the poster when playback is blocked or the video errors', async () => {
    HTMLMediaElement.prototype.play.mockRejectedValueOnce(new Error('blocked'))
    const { container } = render(<MemorialVideo />)
    act(() => intersectionCallback([{ isIntersecting: true }]))

    expect(await screen.findByRole('img', { name: 'Imagem do vídeo em homenagem à Silvana' }))
      .toHaveAttribute('src', MEMORIAL_VIDEO_POSTER)
    expect(container.querySelector('video')).toBeNull()
  })

  it('uses a static poster when reduced motion is requested', () => {
    reducedMotion = true
    const { container } = render(<MemorialVideo />)

    expect(screen.getByRole('img', { name: 'Imagem do vídeo em homenagem à Silvana' }))
      .toHaveAttribute('src', MEMORIAL_VIDEO_POSTER)
    expect(container.querySelector('video')).toBeNull()
  })

  it('falls back on a media error and cleans observers on unmount', () => {
    const { container, unmount } = render(<MemorialVideo />)
    fireEvent.error(container.querySelector('video'))

    expect(screen.getByRole('img', { name: 'Imagem do vídeo em homenagem à Silvana' }))
      .toBeVisible()
    unmount()
    expect(intersectionDisconnect).toHaveBeenCalled()
    expect(resizeDisconnect).toHaveBeenCalled()
  })
})
