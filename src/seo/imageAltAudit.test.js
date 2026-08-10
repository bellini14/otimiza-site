import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const sourceRoot = path.resolve('src')

function getJsxFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) return getJsxFiles(absolutePath)
    return entry.name.endsWith('.jsx') && !entry.name.endsWith('.test.jsx')
      ? [absolutePath]
      : []
  })
}

function getImageTags() {
  return getJsxFiles(sourceRoot).flatMap((file) => {
    const source = fs.readFileSync(file, 'utf8')
    return [...source.matchAll(/<img\b[\s\S]*?\/>/g)].map((match) => ({
      file: path.relative(sourceRoot, file),
      tag: match[0],
    }))
  })
}

describe('image alternative text audit', () => {
  it('gives every rendered image an explicit alt attribute', () => {
    const missingAlt = getImageTags().filter(({ tag }) => !/\balt\s*=/.test(tag))

    expect(missingAlt).toEqual([])
  })

  it('uses empty alt only for known decorative or text-redundant images', () => {
    const allowedDecorativeMarkers = [
      'aria-hidden="true"',
      'footerImage',
      'home-hero__decor',
      'quem-somos-hero-background',
      'nossa-abordagem-timeless__image',
      'inspire-story__thumb',
    ]
    const unclassifiedEmptyAlt = getImageTags().filter(({ tag }) => (
      /\balt\s*=\s*""/.test(tag)
      && !allowedDecorativeMarkers.some((marker) => tag.includes(marker))
    ))

    expect(unclassifiedEmptyAlt).toEqual([])
  })
})
