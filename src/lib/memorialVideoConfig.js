export const MEMORIAL_VIDEO_PLAYBACK_RATE = 0.65

const BUNDLED_VIDEO_SRC = '/media/silvana-homenagem.mp4'

export function resolveVideoDefaults(env = {}) {
  const externalSrc = String(env.VITE_SILVANA_VIDEO_URL || '').trim()
  if (!externalSrc) {
    return {
      src: BUNDLED_VIDEO_SRC,
      hasAudio: true,
    }
  }
  return {
    src: externalSrc,
    hasAudio: env.VITE_SILVANA_VIDEO_HAS_AUDIO === 'true',
  }
}
