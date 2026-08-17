import { describe, expect, it } from 'vitest'
import { assertAllowedProductionSource } from './verify-production-source.mjs'

describe('production source verification', () => {
  it('allows local and preview builds', () => {
    expect(() => assertAllowedProductionSource({ VERCEL_ENV: 'preview' })).not.toThrow()
    expect(() => assertAllowedProductionSource({})).not.toThrow()
  })

  it('allows production builds originating from main', () => {
    expect(() => assertAllowedProductionSource({
      VERCEL_ENV: 'production',
      VERCEL_GIT_COMMIT_REF: 'main',
    })).not.toThrow()
  })

  it('rejects production builds from a non-main or unknown branch', () => {
    expect(() => assertAllowedProductionSource({
      VERCEL_ENV: 'production',
      VERCEL_GIT_COMMIT_REF: 'publish/old-release',
    })).toThrow('A produção só pode ser publicada a partir da branch main.')
    expect(() => assertAllowedProductionSource({ VERCEL_ENV: 'production' }))
      .toThrow('A produção só pode ser publicada a partir da branch main.')
  })
})
