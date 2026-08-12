import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const componentDirectory = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(componentDirectory, 'ScrollVelocity.jsx'), 'utf8')

describe('VelocityRow', () => {
  it('sizes each repeated copy to its complete marquee content', () => {
    expect(source).toMatch(/className=\{`shrink-0 w-max \$\{className\}`\}/)
  })
})
