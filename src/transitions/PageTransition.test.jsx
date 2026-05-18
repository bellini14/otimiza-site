import { beforeEach, describe, expect, it, vi } from 'vitest'
import { scrollToLocationTarget } from './PageTransition'

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

    expect(target.scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' })
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('scrolls to the top when there is no hash target', () => {
    scrollToLocationTarget({ hash: '' })

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' })
  })
})
