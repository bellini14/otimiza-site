import { OTIMIZA_ICON_ASPECT_RATIO } from './navigationOrigin'

const ICON_BASE_WIDTH = 112
const ICON_BASE_HEIGHT = ICON_BASE_WIDTH / OTIMIZA_ICON_ASPECT_RATIO

export function getSweepFrame(phase, reducedMotion, origin, viewport) {
  const width = Math.hypot(viewport.width, viewport.height) * 1.12
  const height = width * 0.58

  const presets = reducedMotion
    ? {
        idle: { x: 0.76, y: 0.68, scale: 0.98 },
        cover: { x: 0.58, y: 0.52, scale: 1.01 },
        reveal: { x: 0.52, y: 0.46, scale: 1.04 },
      }
    : {
        idle: { x: 0.8, y: 0.72, scale: 0.98 },
        cover: { x: 0.6, y: 0.5, scale: 1.01 },
        reveal: { x: 0.53, y: 0.43, scale: 1.05 },
      }

  const preset = presets[phase] ?? presets.idle

  return {
    width,
    height,
    x: origin.x - width * preset.x,
    y: origin.y - height * preset.y,
    scale: preset.scale,
  }
}

export function getIconFrame(phase, reducedMotion, origin, viewport) {
  const presets = reducedMotion
    ? {
        idle: { dx: 0, dy: 0, scale: 0.24 },
        cover: { dx: viewport.width * 0.02, dy: viewport.height * 0.02, scale: 0.32 },
        reveal: { dx: viewport.width * 0.03, dy: viewport.height * 0.03, scale: 0.42 },
      }
    : {
        idle: { dx: 0, dy: 0, scale: 0.24 },
        cover: { dx: viewport.width * 0.025, dy: viewport.height * 0.02, scale: 0.34 },
        reveal: { dx: viewport.width * 0.04, dy: viewport.height * 0.03, scale: 0.46 },
      }

  const preset = presets[phase] ?? presets.idle

  return {
    x: origin.x - ICON_BASE_WIDTH / 2 + preset.dx,
    y: origin.y - ICON_BASE_HEIGHT / 2 + preset.dy,
    scale: preset.scale,
  }
}

export function getRevealMaskFrame(phase, origin, viewport) {
  const height = phase === 'reveal' ? Math.hypot(viewport.width, viewport.height) * 1.22 : 2
  const width = height * OTIMIZA_ICON_ASPECT_RATIO

  return {
    width,
    height,
    x: origin.x - width / 2,
    y: origin.y - height / 2,
    opacity: phase === 'reveal' ? 1 : 0,
  }
}
