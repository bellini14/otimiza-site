import { describe, expect, it } from 'vitest'
import { resolveLegacyImageUrl } from './legacyImageUrl'

describe('resolveLegacyImageUrl', () => {
  it('resolves a mapped production Sanity image to its legacy OTM URL', () => {
    expect(resolveLegacyImageUrl('https://cdn.sanity.io/images/igy822g7/production/0122eed8d7195fe28022797c883bcb730ac02641-856x314.png?w=1200&auto=format'))
      .toBe('https://www.otm.com.br/wp-content/uploads/2020/10/Screenshot_11.png')
  })

  it('leaves an unmapped production Sanity image unchanged', () => {
    const url = 'https://cdn.sanity.io/images/igy822g7/production/new-hash-300x200.jpg'

    expect(resolveLegacyImageUrl(url)).toBe(url)
  })

  it('leaves a production image from another Sanity project unchanged', () => {
    const url = 'https://cdn.sanity.io/images/other-project/production/hash-300x200.jpg'

    expect(resolveLegacyImageUrl(url)).toBe(url)
  })

  it('leaves a draft image from this Sanity project unchanged', () => {
    const url = 'https://cdn.sanity.io/images/igy822g7/draft/hash-300x200.jpg'

    expect(resolveLegacyImageUrl(url)).toBe(url)
  })

  it('leaves unrelated URLs unchanged', () => {
    const url = 'https://example.com/image.jpg'

    expect(resolveLegacyImageUrl(url)).toBe(url)
  })
})
