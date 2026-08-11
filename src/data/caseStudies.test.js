import { describe, expect, it } from 'vitest'
import { resolveCaseStudySlug } from './caseStudies'

describe('resolveCaseStudySlug', () => {
  it.each([
    ['Banco Moneo S.A.', 'banco-moneo'],
    ['Bontempo – Novatempo Franchising Ltda.', 'bontempo'],
    ['Cooperativa Santa Clara', 'santa-clara'],
    ['Unimed Vales do Taquari e Rio Pardo', 'unimed-vtrp'],
  ])('resolves the published client name %s to %s', (clientName, expectedSlug) => {
    expect(resolveCaseStudySlug(clientName)).toBe(expectedSlug)
  })

  it('does not create a detail route for an unmatched client', () => {
    expect(resolveCaseStudySlug('Cliente sem case')).toBeNull()
  })
})
