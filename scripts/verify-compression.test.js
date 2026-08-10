import { describe, expect, it } from 'vitest'
import { validateCompressionHeaders } from './verify-compression.mjs'

describe('compression verification', () => {
  it('accepts Brotli and Gzip content encodings', () => {
    expect(validateCompressionHeaders(new Headers({ 'content-encoding': 'br' }))).toBe('br')
    expect(validateCompressionHeaders(new Headers({ 'content-encoding': 'gzip' }))).toBe('gzip')
  })

  it('rejects an uncompressed textual response', () => {
    expect(() => validateCompressionHeaders(new Headers())).toThrow(
      'Resposta textual sem Content-Encoding br ou gzip',
    )
  })
})
