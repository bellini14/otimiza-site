import { describe, expect, it } from 'vitest'
import { promises as fs } from 'node:fs'
import os from 'node:os'
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

  it('rejects a manifest target that escapes public through a symlink', async () => {
    const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'legacy-media-'))
    const publicRoot = path.join(temporaryRoot, 'public')
    const outsideFile = path.join(temporaryRoot, 'outside.jpg')
    const link = path.join(publicRoot, 'wp-content/uploads/2020/01/escape.jpg')

    try {
      await fs.mkdir(path.dirname(link), { recursive: true })
      await fs.writeFile(outsideFile, 'outside')
      await fs.writeFile(link, 'symlink fixture')

      const result = await validateLegacyMedia({
        escape: 'wp-content/uploads/2020/01/escape.jpg',
      }, {
        publicRoot,
        fileSystem: {
          stat: fs.stat,
          realpath: async (candidate) => candidate === link ? outsideFile : candidate,
        },
      })

      expect(result).toEqual({
        valid: false,
        errors: [expect.objectContaining({ assetId: 'escape', reason: 'symlink escape' })],
      })
    } finally {
      await fs.rm(temporaryRoot, { recursive: true, force: true })
    }
  })
})
