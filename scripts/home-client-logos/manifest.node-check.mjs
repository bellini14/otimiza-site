import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { homeClientLogos, validClientSectors } from './manifest.mjs'

test('manifest has the 27 approved unique records in order', () => {
  assert.equal(homeClientLogos.length, 27)
  assert.deepEqual(homeClientLogos.map(({ sortOrder }) => sortOrder), Array.from({ length: 27 }, (_, index) => index + 1))
  assert.equal(new Set(homeClientLogos.map(({ id }) => id)).size, 27)
  assert.equal(new Set(homeClientLogos.map(({ name }) => name)).size, 27)
  assert.equal(new Set(homeClientLogos.map(({ logoAlt }) => logoAlt)).size, 27)
})

test('manifest sectors and source files are valid', () => {
  for (const logo of homeClientLogos) {
    assert.ok(validClientSectors.has(logo.sector), `Invalid sector for ${logo.name}`)
    assert.ok(fs.existsSync(logo.sourcePath), `Missing source file for ${logo.name}`)
    assert.match(logo.website, /^https:\/\//)
  }
})
