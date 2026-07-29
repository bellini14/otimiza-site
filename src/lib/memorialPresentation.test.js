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

  it('gives the video a long, gradual contraction after reaching full width', () => {
    expect(getVideoScrollPhases(0)).toEqual({ expansion: 0, contraction: 0 })
    expect(getVideoScrollPhases(0.275).expansion).toBeCloseTo(0.5)
    expect(getVideoScrollPhases(0.55)).toEqual({ expansion: 1, contraction: 0 })
    expect(getVideoScrollPhases(0.7).contraction).toBeCloseTo(1 / 3)
    expect(getVideoScrollPhases(0.85).contraction).toBeCloseTo(2 / 3)
    expect(getVideoScrollPhases(1)).toEqual({ expansion: 1, contraction: 1 })
  })
})
