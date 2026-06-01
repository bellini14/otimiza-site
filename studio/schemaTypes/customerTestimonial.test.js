import { describe, expect, it } from 'vitest'
import { schemaTypes } from './index'

describe('customerTestimonialType', () => {
  it('registers CMS-managed testimonials with short home copy and optional Cases detail', () => {
    const testimonialType = schemaTypes.find((schemaType) => schemaType.name === 'customerTestimonial')

    expect(testimonialType).toBeDefined()
    expect(testimonialType.title).toBe('Depoimentos')

    const fieldsByName = Object.fromEntries(testimonialType.fields.map((field) => [field.name, field]))

    expect(fieldsByName.clientName.type).toBe('string')
    expect(fieldsByName.clientName.validation).toBeDefined()
    expect(fieldsByName.company.type).toBe('string')
    expect(fieldsByName.role.type).toBe('string')
    expect(fieldsByName.avatar.type).toBe('image')
    expect(fieldsByName.avatar.options.hotspot).toBe(true)
    expect(fieldsByName.shortQuote.type).toBe('text')
    expect(fieldsByName.shortQuote.rows).toBe(3)
    expect(fieldsByName.detailedQuote.type).toBe('text')
    expect(fieldsByName.detailedQuote.rows).toBe(6)
    expect(fieldsByName.showOnCases.type).toBe('boolean')
    expect(fieldsByName.showOnCases.title).toBe('Mostrar na pagina Cases')
    expect(fieldsByName.showOnCases.initialValue).toBe(false)
    expect(fieldsByName.detailedQuote.hidden({ parent: { showOnCases: true } })).toBe(false)
    expect(fieldsByName.detailedQuote.hidden({ parent: { showOnCases: false } })).toBe(true)
    expect(fieldsByName.metrics.type).toBe('array')
    expect(fieldsByName.metrics.hidden({ parent: { showOnCases: true } })).toBe(false)
    expect(fieldsByName.metrics.hidden({ parent: { showOnCases: false } })).toBe(true)
    expect(fieldsByName.isVisible.initialValue).toBe(true)
    expect(fieldsByName.sortOrder.type).toBe('number')
  })
})
