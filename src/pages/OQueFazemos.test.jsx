import { cleanup, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import OQueFazemos from './OQueFazemos'

const testDir = dirname(fileURLToPath(import.meta.url))
const pageSource = readFileSync(resolve(testDir, './OQueFazemos.jsx'), 'utf8')
const indexCss = readFileSync(resolve(testDir, '../index.css'), 'utf8')

const expectedSolutionTitles = [
  'Diagnóstico',
  'Gestão estratégica',
  'Inteligência de negócios',
  'Gestão de Pessoas',
  'Gestão de Processos de Negócio',
  'Gestão integrada da manufatura',
  'Gestão estratégica de custos',
  'Programa de otimização de desempenho (POD)',
  'Tecnologia de negócios',
  'Academia Otimiza de inteligência empresarial',
  'Consultoria on-line (ECN)',
]

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
  it('renders the hero title with the same SplitText animation wrapper used by Quem Somos', () => {
    renderPage()

    const heading = screen.getByRole('heading', { name: 'O Que Fazemos' })

    expect(heading.tagName).toBe('H1')
    expect(heading).toHaveAttribute('id', 'oquefazemos-title')
    expect(heading).toHaveClass('split-parent')
    expect(heading).toHaveClass('internal-page-title')
    expect(heading).toHaveStyle({ textAlign: 'center' })
    expect(indexCss).toMatch(/\.internal-page-title\s*\{[^}]*font-size:\s*clamp\(4\.35rem,\s*8\.35vw,\s*7\.35rem\)/s)
    expect(indexCss).toMatch(/\.internal-page-title\s*\{[^}]*line-height:\s*0\.92/s)
  })

  it('keeps the hero copy entrance independent from the desktop horizontal offset', () => {
    expect(indexCss).toMatch(
      /@keyframes\s+oquefazemos-copy-enter\s*\{\s*from\s*\{[^}]*translate:\s*0\s+1\.1rem[^}]*\}\s*to\s*\{[^}]*translate:\s*0\s+0[^}]*\}/s,
    )
    expect(indexCss).toMatch(
      /@media\s*\(min-width:\s*768px\)[\s\S]*?\.oquefazemos-hero__title,\s*\.oquefazemos-hero__copy\s*\{[^}]*transform:\s*translateX\(0\.5rem\)/,
    )
  })

  it('renders every solution as a sticky service section with process, result, and CTA', () => {
    renderPage()

    const sections = screen.getAllByTestId('solution-sticky-section')

    expect(sections).toHaveLength(11)
    expect(
      sections.map(
        (section) => within(section).getByRole('heading', { level: 2 }).textContent,
      ),
    ).toEqual(expectedSolutionTitles)

    sections.forEach((section) => {
      expect(section).toHaveClass('oquefazemos-sticky-card')
      expect(within(section).getByText('Processo')).toBeInTheDocument()
      expect(within(section).getByText(/^Resultado/)).toBeInTheDocument()
      expect(
        within(section).getByRole('link', { name: 'Quero contratar essa solução!' }),
      ).toHaveAttribute('href', '/contato')
    })
  })

  it('binds the visual to the same spring-smoothed motion as the chapter content', () => {
    expect(pageSource).toContain('useSpring(scrollYProgress, {')
    expect(pageSource).toContain('useReducedMotion')
    expect(pageSource.match(/useTransform\(\s*smoothProgress/g) ?? []).toHaveLength(5)
    expect(pageSource).not.toMatch(/useTransform\(\s*scrollYProgress/)
    expect(pageSource).toMatch(
      /<MotionDiv[^>]*className="oquefazemos-service-chapter__heading"[^>]*style=\{prefersReducedMotion \? undefined : \{ opacity: headingOpacity, y: headingY \}\}[^>]*>/,
    )
    expect(pageSource).toMatch(
      /<MotionDiv[^>]*className="oquefazemos-service-chapter__content"[^>]*style=\{prefersReducedMotion \? undefined : \{ opacity: contentOpacity, y: contentY \}\}[^>]*>/,
    )
    expect(pageSource).toMatch(
      /<MotionDiv[^>]*className="oquefazemos-service-chapter__visual"[^>]*style=\{prefersReducedMotion \? undefined : \{ opacity: contentOpacity, y: contentY \}\}[^>]*>/,
    )
    expect(pageSource).toMatch(
      /<MotionDiv[^>]*className="oquefazemos-service-chapter__depth-overlay"[^>]*style=\{prefersReducedMotion \? undefined : \{ opacity: depthOpacity \}\}[^>]*>/,
    )
    expect(indexCss).toMatch(
      /\.oquefazemos-service-chapter__heading,\s*\.oquefazemos-service-chapter__content,\s*\.oquefazemos-service-chapter__visual\s*\{[^}]*will-change:\s*transform,\s*opacity/s,
    )
    expect(indexCss).toMatch(
      /\.oquefazemos-service-chapter__visual\s*\{[^}]*transform-origin:\s*100%\s+50%/s,
    )
  })

  it('keeps the lower service numbers without the small heading numbers', () => {
    renderPage()

    expect(screen.queryByText('01')).not.toBeInTheDocument()
    expect(screen.queryByText('11')).not.toBeInTheDocument()

    const visualNumbers = document.querySelectorAll(
      '.oquefazemos-service-chapter__visual[data-number]',
    )
    expect(visualNumbers).toHaveLength(11)
    expect(visualNumbers[0]).toHaveAttribute('data-number', '01')
    expect(visualNumbers[10]).toHaveAttribute('data-number', '11')
  })

  it('uses a readable editorial type hierarchy without changing the service content', () => {
    renderPage()

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(11)
    expect(indexCss).toMatch(
      /\.oquefazemos-service-chapter__heading\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s,
    )
    expect(indexCss).toMatch(
      /\.oquefazemos-service-chapter__heading h2\s*\{[^}]*font-size:\s*clamp\(2\.35rem,\s*4\.1vw,\s*4\.6rem\)/s,
    )
    expect(indexCss).toMatch(
      /\.oquefazemos-service-chapter__intro\s*\{[^}]*font-size:\s*clamp\(1\.25rem,\s*1\.9vw,\s*2\.15rem\)/s,
    )
    expect(indexCss).toMatch(
      /\.oquefazemos-service-chapter__detail h3\s*\{[^}]*font-size:\s*0\.78rem/s,
    )
    expect(indexCss).toMatch(
      /\.oquefazemos-service-chapter__detail p\s*\{[^}]*font-size:\s*clamp\(0\.95rem,\s*0\.92vw,\s*1\.05rem\)/s,
    )
    expect(indexCss).toMatch(
      /\.oquefazemos-service-chapter__cta\s*\{[^}]*font-size:\s*0\.98rem/s,
    )
    expect(indexCss).toMatch(
      /\.oquefazemos-service-chapter__cta:hover,\s*\.oquefazemos-service-chapter__cta:focus-visible\s*\{[^}]*color:\s*var\(--brand-red-strong\)/s,
    )
    expect(indexCss).toMatch(
      /\.oquefazemos-service-chapter__cta:focus-visible\s*\{[^}]*outline:\s*2px\s+solid\s+var\(--brand-red-strong\)[^}]*outline-offset:\s*0\.4rem/s,
    )
  })

  it('keeps the tablet service heading in the first grid row', () => {
    const tabletStyles = indexCss.match(
      /@media\s*\(max-width:\s*1024px\)\s*\{\s*\.oquefazemos-service-chapter__stack[\s\S]*?(?=@media\s*\(max-width:\s*767px\))/,
    )?.[0]

    expect(tabletStyles).toBeDefined()
    expect(tabletStyles).toMatch(
      /\.oquefazemos-service-chapter__heading h2\s*\{[^}]*grid-row:\s*1/s,
    )
  })

  it('does not keep responsive rules for the removed small heading numbers', () => {
    const tabletStyles = indexCss.match(
      /@media\s*\(max-width:\s*1024px\)\s*\{\s*\.oquefazemos-service-chapter__stack[\s\S]*?(?=@media\s*\(max-width:\s*767px\))/,
    )?.[0]
    const mobileStyles = indexCss.match(
      /@media\s*\(max-width:\s*767px\)\s*\{\s*\.oquefazemos-page[\s\S]*?(?=@media\s*\(prefers-reduced-motion:\s*reduce\))/,
    )?.[0]

    expect(tabletStyles).toBeDefined()
    expect(mobileStyles).toBeDefined()
    expect(tabletStyles).not.toContain('.oquefazemos-service-chapter__heading span')
    expect(mobileStyles).not.toContain('.oquefazemos-service-chapter__heading span')
  })

  it('uses one scroll owner and keeps the sticky chapters enabled at every mobile height', () => {
    const serviceStylesStart = indexCss.indexOf('  .oquefazemos-page {')
    const serviceStylesEnd = indexCss.indexOf('  .pillar-card {', serviceStylesStart)

    expect(serviceStylesStart).toBeGreaterThanOrEqual(0)
    expect(serviceStylesEnd).toBeGreaterThan(serviceStylesStart)

    const serviceStyles = indexCss.slice(serviceStylesStart, serviceStylesEnd)
    const mobileMatch = serviceStyles.match(
      /@media\s*\(max-width:\s*767px\)\s*\{\s*\.oquefazemos-page[\s\S]*?(?=\n\s*@media\s*\()/,
    )
    const narrowMatch = serviceStyles.match(
      /@media\s*\(max-width:\s*360px\)\s+and\s+\(min-height:\s*700px\)\s+and\s+\(max-height:\s*760px\)[\s\S]*?(?=\n\s*@media\s*\()/,
    )
    const compactMatch = serviceStyles.match(
      /@media\s*\(max-width:\s*767px\)\s+and\s+\(max-height:\s*699px\)[\s\S]*?(?=\n\s*@media\s*\()/,
    )
    const reducedMotionMatch = serviceStyles.match(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*$/,
    )

    expect(mobileMatch).not.toBeNull()
    expect(narrowMatch).not.toBeNull()
    expect(compactMatch).not.toBeNull()
    expect(reducedMotionMatch).not.toBeNull()
    expect(mobileMatch.index).toBeLessThan(narrowMatch.index)
    expect(narrowMatch.index).toBeLessThan(compactMatch.index)
    expect(compactMatch.index).toBeLessThan(reducedMotionMatch.index)

    const mobileStyles = mobileMatch[0]
    expect(mobileStyles).toMatch(
      /\.oquefazemos-page\s*\{[^}]*--oquefazemos-card-y:\s*clamp\(3\.5rem,\s*8\.5svh,\s*4\.5rem\)/s,
    )
    expect(mobileStyles).toMatch(
      /\.oquefazemos-hero__copy\s*\{[^}]*max-width:\s*31rem[^}]*margin-top:\s*1\.5rem[^}]*font-size:\s*clamp\(1rem,\s*4\.4vw,\s*1\.1rem\)[^}]*line-height:\s*1\.55/s,
    )
    expect(mobileStyles).toMatch(
      /\.oquefazemos-service-chapter__panel\s*\{[^}]*overflow:\s*clip/s,
    )
    expect(mobileStyles).not.toMatch(/overflow-y:\s*auto|scrollbar-width|::-webkit-scrollbar/)
    expect(mobileStyles).toMatch(
      /\.oquefazemos-service-chapter__stack\s*\{[^}]*gap:\s*clamp\(1rem,\s*2\.4svh,\s*1\.35rem\)/s,
    )
    expect(mobileStyles).toMatch(
      /\.oquefazemos-service-chapter__heading h2\s*\{[^}]*grid-row:\s*1[^}]*font-size:\s*clamp\(1\.95rem,\s*8\.7vw,\s*2\.8rem\)[^}]*line-height:\s*1\.02[^}]*letter-spacing:\s*-0\.02em/s,
    )
    expect(mobileStyles).toMatch(
      /\.oquefazemos-service-chapter__content\s*\{[^}]*gap:\s*0\.9rem[^}]*padding-top:\s*1rem/s,
    )
    expect(mobileStyles).toMatch(
      /\.oquefazemos-service-chapter__intro\s*\{[^}]*font-size:\s*clamp\(1\.08rem,\s*4\.9vw,\s*1\.45rem\)[^}]*line-height:\s*1\.15/s,
    )
    expect(mobileStyles).toMatch(
      /\.oquefazemos-service-chapter__capabilities\s*\{[^}]*grid-template-columns:\s*1fr[^}]*gap:\s*0\.9rem/s,
    )
    expect(mobileStyles).toMatch(
      /\.oquefazemos-service-chapter__detail h3\s*\{[^}]*margin-bottom:\s*0\.45rem[^}]*font-size:\s*0\.75rem/s,
    )
    expect(mobileStyles).toMatch(
      /\.oquefazemos-service-chapter__detail p\s*\{[^}]*font-size:\s*0\.92rem[^}]*line-height:\s*1\.52/s,
    )
    expect(mobileStyles).toMatch(
      /\.oquefazemos-service-chapter__cta\s*\{[^}]*min-height:\s*2\.65rem[^}]*font-size:\s*0\.92rem/s,
    )
    expect(mobileStyles).toMatch(
      /\.oquefazemos-service-chapter__heading,\s*\.oquefazemos-service-chapter__content\s*\{[^}]*position:\s*relative[^}]*z-index:\s*1/s,
    )
    expect(mobileStyles).toMatch(
      /\.oquefazemos-service-chapter__visual\s*\{[^}]*position:\s*relative[^}]*order:\s*2[^}]*flex:\s*1 1 auto[^}]*min-height:\s*clamp\(14rem,\s*32svh,\s*18rem\)[^}]*pointer-events:\s*none/s,
    )
    expect(mobileStyles).toMatch(
      /\.oquefazemos-service-chapter__visual::after\s*\{[^}]*position:\s*absolute[^}]*right:\s*clamp\(0\.75rem,\s*4vw,\s*1\.25rem\)[^}]*bottom:\s*clamp\(0\.45rem,\s*1\.2svh,\s*0\.7rem\)[^}]*text-align:\s*right[^}]*font-size:\s*clamp\(10\.5rem,\s*52vw,\s*15rem\)[^}]*line-height:\s*0\.8/s,
    )

    const narrowStyles = narrowMatch[0]
    expect(narrowStyles).toMatch(
      /\.oquefazemos-page\s*\{[^}]*--oquefazemos-card-y:\s*2\.75rem/s,
    )
    expect(narrowStyles).toMatch(
      /\.oquefazemos-service-chapter__heading h2\s*\{[^}]*font-size:\s*clamp\(1\.75rem,\s*8vw,\s*2rem\)/s,
    )
    expect(narrowStyles).toMatch(
      /\.oquefazemos-service-chapter__content\s*\{[^}]*gap:\s*0\.7rem/s,
    )
    expect(narrowStyles).toMatch(
      /\.oquefazemos-service-chapter__intro\s*\{[^}]*font-size:\s*1rem/s,
    )
    expect(narrowStyles).toMatch(
      /\.oquefazemos-service-chapter__capabilities\s*\{[^}]*gap:\s*0\.6rem/s,
    )
    expect(narrowStyles).toMatch(
      /\.oquefazemos-service-chapter__detail p,\s*\.oquefazemos-service-chapter__cta\s*\{[^}]*font-size:\s*0\.88rem/s,
    )

    const compactStyles = compactMatch[0]
    expect(compactStyles).toMatch(
      /\.oquefazemos-page\s*\{[^}]*--oquefazemos-card-y:\s*clamp\(2rem,\s*6svh,\s*2\.5rem\)/s,
    )
    expect(compactStyles).toMatch(
      /\.oquefazemos-service-chapter__stack\s*\{[^}]*gap:\s*0\.75rem/s,
    )
    expect(compactStyles).toMatch(
      /\.oquefazemos-service-chapter__visual\s*\{[^}]*display:\s*flex[^}]*position:\s*relative[^}]*inset:\s*auto[^}]*flex:\s*1\s+1\s+auto[^}]*min-height:\s*clamp\(5rem,\s*14svh,\s*7rem\)[^}]*max-height:\s*clamp\(8rem,\s*24svh,\s*11rem\)/s,
    )
    expect(compactStyles).toMatch(
      /\.oquefazemos-service-chapter__visual::after\s*\{[^}]*bottom:\s*0[^}]*font-size:\s*clamp\(5rem,\s*17\.5svh,\s*7rem\)/s,
    )
    expect(compactStyles).not.toMatch(
      /\.oquefazemos-service-chapter__panel[\s\S]*position:\s*relative/,
    )
    expect(compactStyles).not.toMatch(
      /\.oquefazemos-service-chapter\s*\{[^}]*min-height:\s*auto/,
    )
    expect(compactStyles).not.toMatch(/background:\s*none/)

    const reducedMotionStyles = reducedMotionMatch[0]
    const staticMotionRule = reducedMotionStyles.match(
      /\.oquefazemos-hero__copy,\s*\.oquefazemos-hero__title,\s*\.oquefazemos-service-chapter__heading,\s*\.oquefazemos-service-chapter__content,\s*\.oquefazemos-service-chapter__visual,\s*\.oquefazemos-service-chapter__cta,\s*\.oquefazemos-service-chapter__cta svg,\s*\.oquefazemos-page \.split-char\s*\{([^}]*)\}/s,
    )

    expect(staticMotionRule).not.toBeNull()
    expect(staticMotionRule[1]).toMatch(/animation:\s*none\s*!important/)
    expect(staticMotionRule[1]).toMatch(/opacity:\s*1\s*!important/)
    expect(staticMotionRule[1]).toMatch(/transform:\s*none\s*!important/)
    expect(staticMotionRule[1]).toMatch(/translate:\s*none\s*!important/)
    expect(staticMotionRule[1]).toMatch(/transition:\s*none\s*!important/)
    expect(reducedMotionStyles).toMatch(
      /\.oquefazemos-service-chapter__depth-overlay\s*\{[^}]*display:\s*none/s,
    )
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
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter\s*\{[^}]*min-height:\s*360svh/s)
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter\s*\+\s*\.oquefazemos-service-chapter\s*\{[^}]*margin-top:\s*-160svh/s)
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter--last\s*\{[^}]*min-height:\s*auto\s*!important/s)
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter--last\s*\{[^}]*margin-top:\s*-80svh\s*!important/s)
    expect(indexCss).toMatch(/\.oquefazemos-page\s*\{[^}]*--oquefazemos-shell-width:\s*1320px/s)
    expect(indexCss).toMatch(/\.oquefazemos-page\s*\{[^}]*--oquefazemos-card-y:\s*clamp\(4\.5rem,\s*9svh,\s*6rem\)/s)
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter__stack\s*\{[^}]*grid-template-rows:\s*minmax\(clamp\(5\.5rem,\s*12svh,\s*8\.75rem\),\s*auto\)\s*minmax\(0,\s*1fr\)/s)
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter__stack\s*\{[^}]*width:\s*min\(calc\(100%\s*-\s*\(var\(--oquefazemos-card-x\)\s*\*\s*2\)\),\s*var\(--oquefazemos-shell-width\)\)/s)
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter__stack\s*\{[^}]*padding:\s*var\(--oquefazemos-card-y\)\s*0/s)
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter__heading h2\s*\{[^}]*font-size:\s*clamp\(2\.35rem,\s*4\.1vw,\s*4\.6rem\)/s)
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter__panel\s*\{[^}]*position:\s*sticky/s)
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter--last\s+\.oquefazemos-service-chapter__panel\s*\{[^}]*position:\s*relative\s*!important/s)
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter--last\s+\.oquefazemos-service-chapter__panel\s*\{[^}]*height:\s*auto\s*!important/s)
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter--last\s+\.oquefazemos-service-chapter__panel\s*\{[^}]*min-height:\s*100svh\s*!important/s)
    expect(indexCss).toMatch(/\.oquefazemos-service-chapter--last\s+\.oquefazemos-service-chapter__depth-overlay\s*\{[^}]*display:\s*none/s)
    expect(indexCss).toMatch(/@media\s*\(max-width:\s*767px\)[\s\S]*\.oquefazemos-service-chapter\s*\{[\s\S]*min-height:\s*400svh/)
    expect(indexCss).toMatch(/@media\s*\(max-width:\s*767px\)[\s\S]*\.oquefazemos-service-chapter\s*\+\s*\.oquefazemos-service-chapter\s*\{[\s\S]*margin-top:\s*-180svh/)
    expect(indexCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.oquefazemos-service-chapter\s*\{[\s\S]*min-height:\s*auto/)
    expect(indexCss).toMatch(/html\.oquefazemos-sticky-scroll\s+\.site-footer\s*\{[^}]*z-index:\s*80/s)
    expect(indexCss).toMatch(/html\.oquefazemos-sticky-scroll\s+\.site-footer\s*\{[^}]*background:\s*#f7f8fa/s)
    expect(indexCss).not.toMatch(/html\.oquefazemos-sticky-scroll\s+footer\s*\{/)
  })
})
