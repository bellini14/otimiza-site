import { describe, expect, it } from 'vitest'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateLegacyMedia } from './verify-legacy-media.mjs'

describe('validateLegacyMedia', () => {
  it('rejects unsafe and missing manifest targets', async () => {
    const result = await validateLegacyMedia({
      safe: 'wp-content/uploads/2020/01/present.jpg',
      traversal: 'wp-content/uploads/../secret.jpg',
      driveRelative: 'wp-content/uploads/C:/outside.jpg',
      missing: 'wp-content/uploads/2020/01/missing.jpg',
    }, {
      publicRoot: path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/legacy-media-public'),
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toEqual([
      expect.objectContaining({ assetId: 'driveRelative', reason: 'unsafe path' }),
      expect.objectContaining({ assetId: 'missing', reason: 'file does not exist' }),
      expect.objectContaining({ assetId: 'traversal', reason: 'unsafe path' }),
    ])
  })
})
