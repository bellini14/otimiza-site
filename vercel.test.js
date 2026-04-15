import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('vercel configuration', () => {
  it('rewrites non-api routes to index.html for the SPA router', () => {
    const rawConfig = readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')
    const config = JSON.parse(rawConfig)

    expect(config.rewrites).toEqual(
      expect.arrayContaining([
        {
          source: '/((?!api/).*)',
          destination: '/index.html',
        },
      ]),
    )
  })
})
