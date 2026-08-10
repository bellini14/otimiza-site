import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { scrollToLocationTarget, shouldAnimatePageTransition } from './transitionViewport'
import {
  finishPageTransition,
  isPageTransitionActive,
  startPageTransition,
} from './transitionState'
import { getInternalNavigationTarget } from './navigationInterception'
import { PAGE_TRANSITION_TIMING } from './transitionTiming'

describe('page transition timing', () => {
  it('keeps page transition animation desktop-only', () => {
    expect(shouldAnimatePageTransition({ innerWidth: 769 })).toBe(false)
    expect(shouldAnimatePageTransition({ innerWidth: 770 })).toBe(true)
  })

  it('skips the global curtain between Inspire routes only', () => {
    const viewport = { innerWidth: 1440 }

    expect(shouldAnimatePageTransition(viewport, '/inspire', '/inspire/artigo')).toBe(false)
    expect(shouldAnimatePageTransition(viewport, '/inspire/artigo', '/inspire')).toBe(false)
    expect(shouldAnimatePageTransition(viewport, '/', '/inspire')).toBe(true)
    expect(shouldAnimatePageTransition(viewport, '/inspire', '/')).toBe(true)
  })

  it('keeps the complete transition light and avoids a perceptible frozen hold', () => {
    const totalDuration =
      PAGE_TRANSITION_TIMING.cover +
      PAGE_TRANSITION_TIMING.hold +
      PAGE_TRANSITION_TIMING.reveal

    expect(totalDuration).toBeLessThanOrEqual(1.3)
    expect(PAGE_TRANSITION_TIMING.hold).toBeLessThanOrEqual(0.05)
    expect(PAGE_TRANSITION_TIMING.reveal).toBeGreaterThan(0)
    expect(PAGE_TRANSITION_TIMING.swapPhase).toBe('after-cover')
  })

  it('softens the new route only after it is mounted', () => {
    const css = readFileSync('src/index.css', 'utf8')

    expect(css).toMatch(/\.page-transition-route\s*\{[^}]*animation:\s*page-transition-route-enter 240ms/s)
  })

  it('removes route enter animation below the desktop breakpoint', () => {
    const css = readFileSync('src/index.css', 'utf8')

    expect(css).toMatch(/@media\s*\(max-width:\s*769px\)\s*\{[^}]*\.page-transition-route\s*\{[^}]*animation:\s*none/s)
  })

  it('keeps the Inspire shell mounted and outside the global route animation', () => {
    const appSource = readFileSync('src/App.jsx', 'utf8')

    expect(appSource).toMatch(/const isInspireRoute = displayedLocation\.pathname(?:\s|\S)*?startsWith\('\/inspire\/'\)/)
    expect(appSource).toMatch(/className=\{isInspireRoute \? 'inspire-transition-route' : 'page-transition-route'\}/)
    expect(appSource).toMatch(/key=\{isInspireRoute \? 'inspire' : displayedLocation\.pathname\}/)
  })
})

describe('page transition hierarchy', () => {
  it('marks the global transition as active until its animation finishes', () => {
    startPageTransition()

    expect(isPageTransitionActive()).toBe(true)
    expect(document.documentElement).toHaveClass('page-transition-active')

    finishPageTransition()

    expect(isPageTransitionActive()).toBe(false)
    expect(document.documentElement).not.toHaveClass('page-transition-active')
  })

})

describe('internal navigation interception', () => {
  it('keeps internal navigation pending until the transition commits it', () => {
    const anchor = document.createElement('a')
    anchor.href = 'https://otimiza.test/quem-somos'

    const target = getInternalNavigationTarget(anchor, 'https://otimiza.test/')

    expect(target.href).toBe('/quem-somos')
    expect(target.location.pathname).toBe('/quem-somos')
  })
})

describe('scrollToLocationTarget', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.scrollTo = vi.fn()
  })

  it('scrolls to the hash target when the target exists', () => {
    const target = document.createElement('section')
    target.id = 'nossa-abordagem'
    target.scrollIntoView = vi.fn()
    document.body.append(target)

    scrollToLocationTarget({ hash: '#nossa-abordagem' })

    expect(target.scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' })
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('scrolls to the top when there is no hash target', () => {
    scrollToLocationTarget({ hash: '' })

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' })
  })
})
