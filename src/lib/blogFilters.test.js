import { describe, expect, it } from 'vitest'
import { matchesInspireCategory } from './blogFilters'

describe('matchesInspireCategory', () => {
  it('matches local Inspire categories without case, accent, or outer-space sensitivity', () => {
    expect(
      matchesInspireCategory(
        { inspireCategory: '  Lente Analitica ' },
        'Lente Analítica',
      ),
    ).toBe(true)
  })

  it('uses the Sanity eyebrow when no local Inspire category is present', () => {
    expect(
      matchesInspireCategory(
        { eyebrow: 'DICA DE LEITURA' },
        'Dica de leitura',
      ),
    ).toBe(true)
  })

  it('accepts every post when no category is selected', () => {
    expect(matchesInspireCategory({ eyebrow: 'Artigos' }, null)).toBe(true)
  })
})
