import { cleanup, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import OQueFazemos from './OQueFazemos'

const testDir = dirname(fileURLToPath(import.meta.url))
const indexCss = readFileSync(resolve(testDir, '../index.css'), 'utf8')

function renderPage() {
  return render(
    <MemoryRouter>
      <OQueFazemos />
    </MemoryRouter>,
  )
}

afterEach(() => {
  cleanup()
})

describe('OQueFazemos', () => {
  it('renders every solution as a sticky service section with process, result, and CTA', () => {
    renderPage()

    const sections = screen.getAllByTestId('solution-sticky-section')

    expect(sections).toHaveLength(11)
    expect(within(sections[0]).getByRole('heading', { name: 'Diagnóstico' })).toBeInTheDocument()
    expect(within(sections[10]).getByRole('heading', { name: 'Consultoria on-line (ECN)' })).toBeInTheDocument()

    sections.forEach((section) => {
      expect(section).toHaveClass('oquefazemos-sticky-card')
      expect(within(section).getByText('Processo')).toBeInTheDocument()
      expect(within(section).getByText(/^Resultado/)).toBeInTheDocument()
      expect(
        within(section).getByRole('link', { name: 'Quero contratar essa solução!' }),
      ).toHaveAttribute('href', '/contato')
    })
  })

  it('keeps service numbering aligned with the sticky stack', () => {
    renderPage()

    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('11')).toBeInTheDocument()
  })

  it('keeps the sticky stack composed as overlapping service chapters', () => {
    renderPage()

    const panels = screen.getAllByTestId('solution-sticky-section')
    const chapters = document.querySelectorAll('.oquefazemos-service-chapter')

    expect(chapters).toHaveLength(panels.length)
    panels.forEach((panel, index) => {
      expect(chapters[index]).toHaveStyle({
        '--chapter-index': String(index),
        zIndex: String(10 + index),
      })
      expect(panel).toHaveClass('oquefazemos-service-chapter__panel')
      expect(panel.querySelector('.oquefazemos-service-chapter__stack')).toBeInTheDocument()
      expect(panel.querySelector('.oquefazemos-service-chapter__depth-overlay')).toBeInTheDocument()
    })

    expect(chapters[chapters.length - 1]).toHaveClass('oquefazemos-service-chapter--last')
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter\s*\{[^}]*min-height:\s*380svh/s)
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter\s*\+\s*\.oquefazemos-service-chapter\s*\{[^}]*margin-top:\s*-200svh/s)
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter__panel\s*\{[^}]*position:\s*sticky/s)
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter--last\s+\.oquefazemos-service-chapter__panel\s*\{[^}]*position:\s*relative\s*!important/s)
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter--last\s+\.oquefazemos-service-chapter__panel\s*\{[^}]*height:\s*auto\s*!important/s)
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter--last\s+\.oquefazemos-service-chapter__panel\s*\{[^}]*min-height:\s*100svh\s*!important/s)
    expect(indexCss).toMatch(/@media\s*\(max-width:\s*767px\)[\s\S]*\.oquefazemos-service-chapter\s*\{[\s\S]*min-height:\s*420svh/)
    expect(indexCss).toMatch(/@media\s*\(max-width:\s*767px\)[\s\S]*\.oquefazemos-service-chapter\s*\+\s*\.oquefazemos-service-chapter\s*\{[\s\S]*margin-top:\s*-230svh/)
    expect(indexCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.oquefazemos-service-chapter\s*\{[\s\S]*min-height:\s*auto/)
    expect(indexCss).toMatch(/html\.oquefazemos-sticky-scroll\s+footer\s*\{[^}]*z-index:\s*80/s)
  })
})
