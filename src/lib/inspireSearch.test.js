import { describe, expect, it } from 'vitest'

import {
  buildInspireBroadPattern,
  buildInspireSearchPattern,
  matchesInspireSearch,
  normalizeInspireSearchText,
  rankInspireSearchResults,
} from './inspireSearch'

describe('Inspire accent-insensitive search', () => {
  it('normalizes accents, case and repeated spacing', () => {
    expect(normalizeInspireSearchText('  GESTÃO   Analítica  ')).toBe('gestao analitica')
  })

  it('matches an accented article when the query has no accents', () => {
    expect(
      matchesInspireSearch(
        {
          title: 'Gestão sem ruído',
          description: 'Uma visão prática.',
          eyebrow: 'Lente Analítica',
        },
        'gestao',
      ),
    ).toBe(true)
  })

  it('does not keep broad-query false positives', () => {
    expect(matchesInspireSearch({ title: 'Tecnologia industrial' }, 'gestao')).toBe(false)
  })

  it('builds a wildcard candidate pattern from the accent-free query', () => {
    expect(buildInspireSearchPattern('Gestão')).toBe('g*st*')
    expect(buildInspireBroadPattern('Gestam')).toBe('g*s*t*')
  })

  it.each([
    ['estratega', 'Estratégia aplicada'],
    ['gestam', 'Gestão de processos'],
    ['artigos', 'Artigo sobre liderança'],
  ])('matches the close spelling %s with %s', (query, title) => {
    expect(matchesInspireSearch({ title }, query)).toBe(true)
  })

  it('rejects words that are not sufficiently close', () => {
    expect(matchesInspireSearch({ title: 'Estágio profissional' }, 'gestao')).toBe(false)
  })

  it('ranks exact matches before approximate matches', () => {
    const approximate = { title: 'Estratégia aplicada', slug: 'aproximado' }
    const exact = { title: 'Estratega de negócios', slug: 'exato' }

    expect(rankInspireSearchResults([approximate, exact], 'estratega')).toEqual([
      exact,
      approximate,
    ])
  })
})
