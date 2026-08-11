import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

describe('site favicon', () => {
  it('publishes PNG and ICO fallbacks rendered from the supplied Otimiza SVG', async () => {
    const root = process.cwd()
    const html = readFileSync(resolve(root, 'index.html'), 'utf8')
    const head = html.match(/<head>[\s\S]*?<\/head>/)?.[0]
    const sourceFavicon = readFileSync(resolve(root, 'imagens/favicon otimiza.svg'))
    const publicFavicon = readFileSync(resolve(root, 'public/favicon.svg'))
    const publicPng = resolve(root, 'public/favicon.png')
    const publicIco = resolve(root, 'public/favicon.ico')
    const ico = readFileSync(publicIco)

    const iconLinks = head?.match(/<link rel="icon"[^>]*>/g)

    expect(head).toBeDefined()
    expect(iconLinks).toEqual([
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=20260811-otimiza" />',
      '<link rel="icon" type="image/png" sizes="256x256" href="/favicon.png?v=20260811-otimiza" />',
      '<link rel="icon" type="image/x-icon" href="/favicon.ico?v=20260811-otimiza" />',
    ])

    const sourcePixels = await sharp(sourceFavicon).resize(256, 256).ensureAlpha().raw().toBuffer()
    const pngPixels = await sharp(publicPng).resize(256, 256).ensureAlpha().raw().toBuffer()

    expect(pngPixels).toEqual(sourcePixels)
    expect(existsSync(publicIco)).toBe(true)
    expect(ico.subarray(0, 4)).toEqual(Buffer.from([0, 0, 1, 0]))

    const icoLength = ico.readUInt32LE(14)
    const icoOffset = ico.readUInt32LE(18)
    const icoPng = ico.subarray(icoOffset, icoOffset + icoLength)
    const icoPixels = await sharp(icoPng).resize(256, 256).ensureAlpha().raw().toBuffer()

    expect(icoPixels).toEqual(sourcePixels)
    expect(publicFavicon.equals(sourceFavicon)).toBe(true)
  })
})
