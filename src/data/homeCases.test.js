import { describe, expect, it } from 'vitest'
import { HOME_CASE_FALLBACKS, normalizeHomeCases } from './homeCases'

const EXPECTED_COMPANIES = [
  'Banco Moneo',
  'Bontempo',
  'Cinex',
  'Hospital Bruno Born',
  'Masterpower Turbo',
  'Neobus',
  'Santa Clara',
  'Sulmaq',
  'Tabone',
  'Unicasa',
]

describe('home cases data', () => {
  it('provides the ten published cases with complete carousel content', () => {
    expect(HOME_CASE_FALLBACKS).toHaveLength(10)
    expect(HOME_CASE_FALLBACKS.map((caseStudy) => caseStudy.company)).toEqual(EXPECTED_COMPANIES)

    HOME_CASE_FALLBACKS.forEach((caseStudy) => {
      expect(caseStudy).toEqual(expect.objectContaining({
        id: expect.any(String),
        company: expect.any(String),
        sector: expect.any(String),
        summary: expect.any(String),
        logoUrl: expect.stringMatching(/^https:\/\/(?:www\.otm\.com\.br\/wp-content\/uploads|cdn\.sanity\.io\/images)\//),
        slug: expect.any(String),
      }))
      expect(caseStudy.summary.length).toBeGreaterThan(30)
    })
  })

  it('keeps complete CMS cases in order and fills missing slots without duplicates', () => {
    const normalized = normalizeHomeCases([
      {
        _id: 'cms-sulmaq',
        name: 'Sulmaq',
        sector: 'Indústria',
        logoAlt: 'Logo Sulmaq Casting',
        logoUrl: 'https://example.com/sulmaq.svg',
        caseSlug: 'sulmaq',
      },
      {
        _id: 'incomplete-case',
        name: 'Case sem setor',
        logoUrl: 'https://example.com/incomplete.svg',
      },
      {
        _id: 'cms-bontempo',
        name: 'Bontempo',
        sector: 'Móveis',
        logoUrl: 'https://example.com/bontempo.svg',
      },
    ])

    expect(normalized).toHaveLength(10)
    expect(normalized[0]).toEqual(expect.objectContaining({
      id: 'cms-sulmaq',
      company: 'Sulmaq',
      sector: 'Indústria',
      logoAlt: 'Logo Sulmaq Casting',
      logoUrl: 'https://example.com/sulmaq.svg',
      slug: 'sulmaq',
      summary: expect.stringMatching(/orçamentos/i),
    }))
    expect(normalized[1]).toEqual(expect.objectContaining({
      company: 'Bontempo',
      logoUrl: 'https://example.com/bontempo.svg',
      summary: expect.stringMatching(/produtividade/i),
    }))
    expect(normalized.map((caseStudy) => caseStudy.company)).not.toContain('Case sem setor')
    expect(new Set(normalized.map((caseStudy) => caseStudy.company)).size).toBe(10)
  })

  it('returns the complete fallback set for empty or invalid CMS responses', () => {
    expect(normalizeHomeCases([])).toEqual(HOME_CASE_FALLBACKS)
    expect(normalizeHomeCases(null)).toEqual(HOME_CASE_FALLBACKS)
  })
})
