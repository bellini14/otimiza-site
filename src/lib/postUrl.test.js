import { describe, expect, it } from 'vitest'
import { buildWordPressPostPath } from './postUrl'
describe('buildWordPressPostPath', () => {
  it('uses the WordPress year/month/day permalink format', () => {
    expect(buildWordPressPostPath({ publishedAt: '2026-05-05T17:01:22Z', slug: 'o-desgaste-da-visao' })).toBe('/2026/05/05/o-desgaste-da-visao')
  })
})
