import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const cssPath = resolve(process.cwd(), 'src/index.css')
const css = readFileSync(cssPath, 'utf8')

function ruleFor(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return Array.from(css.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`, 'g')))
    .map((match) => match[1])
    .join('\n')
}

describe('contact form layout styles', () => {
  it('aligns the flat form with the menu surface width', () => {
    const shellRule = ruleFor('.contact-shell')
    const panelRule = ruleFor('.contact-form-panel')

    expect(shellRule).toContain('1320px')
    expect(panelRule).not.toMatch(/\b(background|border-radius|box-shadow|padding)\s*:/)
  })

  it('gives the form section generous responsive vertical spacing', () => {
    const mainRule = ruleFor('.contact-main')

    expect(mainRule).toContain('clamp(4rem, 7vw, 7rem)')
    expect(mainRule).toContain('clamp(7rem, 12vw, 11rem)')
  })

  it('styles fields as the minimal underlined controls from the reference', () => {
    const fieldRule = ruleFor('.contact-form__field')
    const buttonRule = ruleFor('.contact-form__footer button')

    expect(fieldRule).toContain('border: 0')
    expect(fieldRule).toContain('border-bottom: 1px solid')
    expect(fieldRule).toContain('border-radius: 0')
    expect(fieldRule).toContain('background: transparent')
    expect(buttonRule).toContain('border-radius: 1.1rem')
    expect(buttonRule).toContain('background: #5a6572')
    expect(buttonRule).not.toContain('width: 100%')
  })

  it('uses the Otimiza slate palette throughout the form without red or black accents', () => {
    const formStyles = css.slice(css.indexOf('  .contact-main {'), css.indexOf('  @keyframes contact-rise'))

    expect(formStyles).toContain('color: #5a6572')
    expect(formStyles).toContain('background: #5a6572')
    expect(formStyles).not.toMatch(/#(?:171717|e02020|bd1717)/i)
  })

  it('uses Elza explicitly across the contact form', () => {
    const panelRule = ruleFor('.contact-form-panel')

    expect(panelRule).toContain('font-family: "elza", sans-serif')
  })

  it('uses the contact hero color behind provider-rendered map tiles', () => {
    const canvasRule = ruleFor('.contact-leaflet__canvas')
    const tilesRule = ruleFor('.contact-leaflet__canvas .leaflet-tile-pane')
    const tintRule = ruleFor('.contact-leaflet__canvas::after')

    expect(canvasRule).toContain('background: #e5e9f1')
    expect(canvasRule).toContain('isolation: isolate')
    expect(canvasRule).toContain('overflow: hidden')
    expect(tilesRule).not.toContain('mix-blend-mode')
    expect(tintRule).toBe('')
  })

  it('clips and isolates the vector map canvas inside the hero map area', () => {
    const mapRule = ruleFor('.contact-hero__map')

    expect(mapRule).toContain('isolation: isolate')
    expect(mapRule).toContain('overflow: hidden')
  })

  it('prevents direct pointer navigation on the map canvas', () => {
    const canvasRule = ruleFor('.contact-leaflet__canvas')

    expect(canvasRule).toContain('pointer-events: none')
  })

  it('styles the location as a branded pin with a label', () => {
    const shapeRule = ruleFor('.contact-map-pin__shape')
    const labelRule = ruleFor('.contact-map-pin__label')

    expect(shapeRule).toContain('width: 1.65rem')
    expect(shapeRule).toContain('border: 2px solid #ffffff')
    expect(shapeRule).toContain('background: #e02020')
    expect(labelRule).toContain('padding: 0.42rem 0.65rem 0.38rem')
    expect(labelRule).toContain('background: rgb(255 255 255 / 0.94)')
  })

  it('lays contact details out horizontally without red accents', () => {
    const rowRule = ruleFor('.contact-details__row')
    const linkRule = ruleFor('.contact-details__link')

    expect(rowRule).toContain('grid-template-columns: auto auto 1fr')
    expect(linkRule).toContain('color: #5a6572')
    expect(linkRule).not.toContain('#e02020')
  })
})
