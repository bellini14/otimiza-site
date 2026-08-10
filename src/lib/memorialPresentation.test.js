import { describe, expect, it } from 'vitest'
import {
  getNotePresentation,
  getScrollProgress,
  getVideoScrollPhases,
} from './memorialPresentation.js'

describe('memorial presentation', () => {
  it('creates stable bounded organic styling', () => {
    expect(getNotePresentation('one')).toEqual(getNotePresentation('one'))
    expect(Math.abs(getNotePresentation('one').rotation)).toBeLessThanOrEqual(4)
  })
  it('clamps scroll progress', () => {
    expect(getScrollProgress(-10, 100)).toBe(0)
    expect(getScrollProgress(50, 100)).toBe(0.5)
    expect(getScrollProgress(200, 100)).toBe(1)
  })

  it('uses compact eased phases with a full-width hold between them', () => {
    expect(getVideoScrollPhases(0)).toEqual({ expansion: 0, contraction: 0 })
    expect(getVideoScrollPhases(0.21).expansion).toBeCloseTo(0.5)
    expect(getVideoScrollPhases(0.42)).toEqual({ expansion: 1, contraction: 0 })
    expect(getVideoScrollPhases(0.64)).toEqual({ expansion: 1, contraction: 0 })
    expect(getVideoScrollPhases(0.73).contraction).toBeCloseTo(0.15625)
    expect(getVideoScrollPhases(0.82).contraction).toBeCloseTo(0.5)
    expect(getVideoScrollPhases(0.91).contraction).toBeCloseTo(0.84375)
    expect(getVideoScrollPhases(1)).toEqual({ expansion: 1, contraction: 1 })
    expect(getVideoScrollPhases(-1)).toEqual({ expansion: 0, contraction: 0 })
    expect(getVideoScrollPhases(2)).toEqual({ expansion: 1, contraction: 1 })
  })
})
