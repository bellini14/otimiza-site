import { describe, expect, it } from 'vitest'
import { resolveLegacyImageUrl } from './legacyImageUrl'

describe('resolveLegacyImageUrl', () => {
  it('resolves a mapped production Sanity image to its legacy OTM URL', () => {
    expect(resolveLegacyImageUrl('https://cdn.sanity.io/images/igy822g7/production/hash-300x200.jpg?w=1200&auto=format'))
      .toBe('https://www.otm.com.br/wp-content/uploads/2020/09/example.jpg')
  })

  it('leaves an unmapped production Sanity image unchanged', () => {
    const url = 'https://cdn.sanity.io/images/igy822g7/production/new-hash-300x200.jpg'

    expect(resolveLegacyImageUrl(url)).toBe(url)
  })

  it('leaves unrelated URLs unchanged', () => {
    const url = 'https://example.com/image.jpg'

    expect(resolveLegacyImageUrl(url)).toBe(url)
  })
})
