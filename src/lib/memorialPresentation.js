const COLORS = ['#fbf1dd', '#f6d98c', '#f2b27e', '#e7e1cb']

function hash(value) {
  return [...String(value)].reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 7)
}

export function getNotePresentation(id, compact = false) {
  const value = hash(id)
  const limit = compact ? 2 : 4
  return {
    rotation: ((value % ((limit * 2) + 1)) - limit),
    color: COLORS[value % COLORS.length],
  }
}

export function getScrollProgress(offset, distance) {
  if (distance <= 0) return 1
  return Math.max(0, Math.min(1, offset / distance))
}

export function getVideoScrollPhases(progress) {
  const clamped = Math.max(0, Math.min(1, progress))
  const expansionEnd = 0.42
  const contractionStart = 0.64
  const expansionProgress = Math.min(1, clamped / expansionEnd)
  const contractionProgress = Math.max(
    0,
    (clamped - contractionStart) / (1 - contractionStart),
  )
  const smoothstep = (value) => value ** 2 * (3 - (2 * value))

  return {
    expansion: smoothstep(expansionProgress),
    contraction: smoothstep(contractionProgress),
  }
}
