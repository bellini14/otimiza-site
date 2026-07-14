import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('vercel configuration', () => {
  it('serves prerendered HTML for static routes and keeps SPA fallbacks for dynamic routes', () => {
    const rawConfig = readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')
    const config = JSON.parse(rawConfig)

    expect(config.rewrites).toContainEqual({
      source: '/quem-somos',
      destination: '/quem-somos.html',
    })
    expect(config.rewrites).toContainEqual({
      source: '/inspire/newsletter',
      destination: '/inspire/newsletter.html',
    })
    expect(config.rewrites).toContainEqual({
      source: '/cases/:slug',
      destination: '/index.html',
    })
    expect(config.rewrites.findIndex(({ source }) => source === '/quem-somos')).toBeLessThan(
      config.rewrites.findIndex(({ source }) => source === '/((?!api/).*)'),
    )
  })

  it('exposes the CDN compression header to cross-origin browser audits', () => {
    const rawConfig = readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')
    const config = JSON.parse(rawConfig)
    const globalHeaders = config.headers.find(({ source }) => source === '/(.*)')

    expect(globalHeaders.headers).toContainEqual({
      key: 'Access-Control-Expose-Headers',
      value: 'Content-Encoding',
    })
  })
})
