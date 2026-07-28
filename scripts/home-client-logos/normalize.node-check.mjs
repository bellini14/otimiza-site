import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import sharp from 'sharp'
import { homeClientLogos } from './manifest.mjs'
import { normalizedDirectory, normalizeAllLogos } from './normalize.mjs'

test('normalized logos are transparent, compact and optically filled', async () => {
  await normalizeAllLogos()

  for (const logo of homeClientLogos) {
    const outputPath = path.join(normalizedDirectory, logo.outputFile)
    const metadata = await sharp(outputPath).metadata()
    const { data, info } = await sharp(outputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

    assert.equal(metadata.format, 'png')
    assert.ok(
      Math.max(metadata.width, metadata.height) <= 1200,
      `${logo.name} is ${metadata.width}x${metadata.height}`,
    )
    assert.equal(info.channels, 4)

    let minX = info.width
    let minY = info.height
    let maxX = -1
    let maxY = -1
    let transparentPixels = 0

    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        const alpha = data[(y * info.width + x) * 4 + 3]
        if (alpha <= 8) {
          transparentPixels += 1
          continue
        }
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }

    assert.ok(transparentPixels > 0, `${logo.name} needs transparent clear space`)
    assert.ok(maxX >= minX && maxY >= minY, `${logo.name} has no visible pixels`)

    const visibleWidthRatio = (maxX - minX + 1) / info.width
    const visibleHeightRatio = (maxY - minY + 1) / info.height
    assert.ok(
      Math.max(visibleWidthRatio, visibleHeightRatio) >= 0.82,
      `${logo.name} visible bounding box is too small`,
    )
  }

  const outputFiles = await fs.readdir(normalizedDirectory)
  assert.equal(outputFiles.filter((file) => file.endsWith('.png')).length, 27)
})
