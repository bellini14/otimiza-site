import { describe, expect, it } from 'vitest'
import { buildSlugMutations, wordpressSlugUpdates } from './align-wordpress-post-slugs.mjs'

describe('WordPress post slug alignment', () => {
  it('preserves each of the 25 unique WordPress slugs in a Sanity mutation', () => {
    expect(wordpressSlugUpdates).toHaveLength(25)
    expect(new Set(wordpressSlugUpdates.map(({ documentId }) => documentId)).size).toBe(25)
    expect(new Set(wordpressSlugUpdates.map(({ slug }) => slug)).size).toBe(25)
    expect(buildSlugMutations()).toEqual(
      wordpressSlugUpdates.map(({ documentId, slug }) => ({
        patch: { id: documentId, set: { slug: { _type: 'slug', current: slug } } },
      })),
    )
  })
})
