import { describe, expect, it } from 'vitest'
import { buildLegacyManifest } from './generate-legacy-image-manifest.mjs'

describe('buildLegacyManifest', () => {
  it('maps only an unambiguous filename and dimension match', () => {
    const { manifest, report } = buildLegacyManifest([
      { _id: 'image-exact', originalFilename: 'exact.jpg', width: 1200, height: 800, url: 'https://cdn.sanity.io/images/igy822g7/production/exact-hash-1200x800.jpg' },
      { _id: 'image-duplicate', originalFilename: 'duplicate.jpg', width: 500, height: 500, url: 'https://cdn.sanity.io/images/igy822g7/production/duplicate-hash-500x500.jpg' },
      { _id: 'image-dimensions', originalFilename: 'dimensions.jpg', width: 640, height: 480, url: 'https://cdn.sanity.io/images/igy822g7/production/dimensions-hash-640x480.jpg' },
      { _id: 'image-missing', originalFilename: 'missing.jpg', width: 300, height: 200, url: 'https://cdn.sanity.io/images/igy822g7/production/missing-hash-300x200.jpg' },
    ], [
      { relativePath: 'wp-content/uploads/2020/01/exact.jpg', filename: 'exact.jpg', width: 1200, height: 800 },
      { relativePath: 'wp-content/uploads/../exact.jpg', filename: 'exact.jpg', width: 1200, height: 800 },
      { relativePath: 'wp-content/uploads/2020/01/duplicate.jpg', filename: 'duplicate.jpg', width: 500, height: 500 },
      { relativePath: 'wp-content/uploads/2021/01/duplicate.jpg', filename: 'duplicate.jpg', width: 500, height: 500 },
      { relativePath: 'wp-content/uploads/2020/01/dimensions.jpg', filename: 'dimensions.jpg', width: 640, height: 400 },
    ])

    expect(manifest).toEqual({
      'exact-hash-1200x800.jpg': 'wp-content/uploads/2020/01/exact.jpg',
    })
    expect(report.matched).toHaveLength(1)
    expect(report.ambiguous.map(({ assetId }) => assetId)).toEqual(['duplicate-hash-500x500.jpg'])
    expect(report.dimensionMismatch.map(({ assetId }) => assetId)).toEqual(['dimensions-hash-640x480.jpg'])
    expect(report.missing.map(({ assetId }) => assetId)).toEqual(['missing-hash-300x200.jpg'])
  })

  it('sorts manifest entries alphabetically by immutable URL asset id', () => {
    const { manifest } = buildLegacyManifest([
      { _id: 'image-z', originalFilename: 'z.jpg', url: 'https://cdn.sanity.io/images/igy822g7/production/z-hash-1x1.jpg' },
      { _id: 'image-a', originalFilename: 'a.jpg', url: 'https://cdn.sanity.io/images/igy822g7/production/a-hash-1x1.jpg' },
    ], [
      { relativePath: 'wp-content/uploads/2020/01/z.jpg', filename: 'z.jpg' },
      { relativePath: 'wp-content/uploads/2020/01/a.jpg', filename: 'a.jpg' },
    ])

    expect(Object.keys(manifest)).toEqual(['a-hash-1x1.jpg', 'z-hash-1x1.jpg'])
  })

  it('reports invalid Sanity assets without preventing valid assets from being generated', () => {
    const { manifest, report } = buildLegacyManifest([
      { _id: 'image-invalid', originalFilename: 'invalid.jpg', url: null },
      { _id: 'image-invalid-2', originalFilename: null, url: 'https://cdn.sanity.io/images/igy822g7/production/invalid-hash-1x1.jpg' },
      { _id: 'image-valid', originalFilename: 'valid.jpg', url: 'https://cdn.sanity.io/images/igy822g7/production/valid-hash-1x1.jpg' },
    ], [
      { relativePath: 'wp-content/uploads/2020/01/valid.jpg', filename: 'valid.jpg' },
    ])

    expect(manifest).toEqual({ 'valid-hash-1x1.jpg': 'wp-content/uploads/2020/01/valid.jpg' })
    expect(report.invalid).toHaveLength(2)
  })
})
