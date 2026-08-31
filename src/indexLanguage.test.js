import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

const html = readFileSync(resolve(cwd(), 'index.html'), 'utf8')
const parsedDocument = new DOMParser().parseFromString(html, 'text/html')

describe('document language', () => {
  it('declares Brazilian Portuguese as the page language', () => {
    expect(parsedDocument.documentElement.lang).toBe('pt-BR')
  })

  it('keeps browser translation available', () => {
    const hasGoogleNotranslate = [...parsedDocument.querySelectorAll('meta')].some(
      (meta) => meta.name.toLowerCase() === 'google'
        && meta.content.toLowerCase().includes('notranslate'),
    )

    expect(parsedDocument.querySelector('[translate="no" i]')).toBeNull()
    expect(parsedDocument.querySelector('.notranslate')).toBeNull()
    expect(hasGoogleNotranslate).toBe(false)
  })
})
