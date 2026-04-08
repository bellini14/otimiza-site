import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const indexCss = fs.readFileSync(path.resolve('src/index.css'), 'utf8')
const headerSource = fs.readFileSync(path.resolve('src/components/Header.jsx'), 'utf8')

describe('global text color system', () => {
  it('uses #5a6572 as the light-theme ink token and header text color', () => {
    expect(indexCss).toMatch(/--brand-ink:\s*#5a6572;/)
    expect(indexCss).toMatch(/--text-primary:\s*#5a6572;/)
    expect(indexCss).toMatch(/--text-secondary:\s*#5a6572;/)
    expect(indexCss).toMatch(/--theme-toggle-ink:\s*#5a6572;/)
    expect(headerSource).toContain("text-[#5a6572]")
  })
})
