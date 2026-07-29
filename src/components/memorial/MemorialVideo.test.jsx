import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { resolveVideoDefaults } from '../../lib/memorialVideoConfig'
import MemorialVideo from './MemorialVideo'

describe('MemorialVideo', () => {
  it('uses the bundled slow-motion video permanently muted', () => {
    const { container } = render(<MemorialVideo />)
    const video = container.querySelector('video')

    expect(video).not.toBeNull()
    expect(video).toHaveAttribute('src', '/media/silvana-homenagem.mp4')
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

    expect(resolveVideoDefaults({
      VITE_SILVANA_VIDEO_URL: 'https://cdn.example.com/silvana.mp4',
      VITE_SILVANA_VIDEO_HAS_AUDIO: 'false',
    })).toEqual({
      src: 'https://cdn.example.com/silvana.mp4',
      hasAudio: false,
    })

    expect(resolveVideoDefaults({})).toEqual({
      src: '/media/silvana-homenagem.mp4',
      hasAudio: false,
    })
  })
})
