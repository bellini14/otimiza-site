import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import Home from './Home'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const homeCss = fs.readFileSync(path.resolve(testDir, '../index.css'), 'utf8')
const htmlEntry = fs.readFileSync(path.resolve(testDir, '../../index.html'), 'utf8')

afterEach(() => {
  cleanup()
})

describe('Home', () => {
  it('forces Elza as the only declared font family in the global stylesheet', () => {
    expect(htmlEntry).toMatch(/<link rel="stylesheet" href="https:\/\/use\.typekit\.net\/hrm4pwi\.css" \/>/)
    expect(htmlEntry).toMatch(/<body class="tk-elza">/)
    expect(homeCss).toMatch(/@import url\("https:\/\/use\.typekit\.net\/hrm4pwi\.css"\);/)
    expect(homeCss).toMatch(
      /html\s*\{[\s\S]*font-family:\s*"elza",\s*sans-serif;[\s\S]*font-weight:\s*100;[\s\S]*font-style:\s*normal;[\s\S]*\}/,
    )
    expect(homeCss).toMatch(
      /body,\s*#root,\s*button,\s*input,\s*textarea,\s*select,\s*\*,\s*\*::before,\s*\*::after\s*\{[\s\S]*font-family:\s*inherit\s*!important;[\s\S]*font-weight:\s*inherit;[\s\S]*font-style:\s*inherit;/,
    )
  })

  it('keeps the hero gradient layer interactive for mouse tracking', () => {
    expect(homeCss).not.toMatch(/\.home-hero__gradient\s*\{[^}]*pointer-events:\s*none;/s)
  })

  it('pulls the hero up enough to cover the layout top padding', () => {
    expect(homeCss).toMatch(/\.home-hero\s*\{[\s\S]*margin-top:\s*-8rem;/)
    expect(homeCss).toMatch(/@media\s*\(min-width:\s*640px\)\s*\{[\s\S]*\.home-hero\s*\{[\s\S]*margin-top:\s*-9rem;/)
  })

  it('keeps the hero at full viewport height and does not overlap the next section', () => {
    expect(homeCss).toMatch(/\.home-hero__stage\s*\{[\s\S]*min-height:\s*100svh;/)
    expect(homeCss).toMatch(/\.home-hero__content\s*\{[\s\S]*min-height:\s*100svh;/)
  })

  it('does not apply a global vertical gap below the hero wrapper', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('home-page')).not.toHaveClass('space-y-12')
    expect(screen.getByTestId('home-content')).not.toHaveClass('-mt-10')
  })

  it('renders the rebuilt hero with centered copy, email field and CTA', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.getAllByRole('heading', { name: 'Criar o atemporal.' }).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/junte-se as mais de 400 empresas/i).length).toBeGreaterThan(0)
    expect(screen.getAllByPlaceholderText('Seu email').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Quero fazer parte' })).toBeInTheDocument()

    const stage = screen.getByTestId('hero-stage')
    const background = screen.getByTestId('hero-gradient-blinds')

    expect(background).toBeInTheDocument()
    expect(stage.querySelector('[data-testid="hero-gradient-blinds"]')).not.toBeNull()
  })
})
