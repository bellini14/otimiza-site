import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'
import { resetPostLikeCountCache } from '../lib/postLikes'

class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }

  observe(target) {
    this.callback([{ isIntersecting: true, target }])
  }

  unobserve() {}

  disconnect() {}
}

globalThis.IntersectionObserver = MockIntersectionObserver

class MockResizeObserver {
  observe() {}

  unobserve() {}

  disconnect() {}
}

globalThis.ResizeObserver = MockResizeObserver

beforeEach(() => {
  resetPostLikeCountCache()
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false
    },
  }),
})
