import { describe, expect, it } from 'vitest'
import { schemaTypes } from './index'

const clientSectorOptions = [
  { title: 'Alimentos, Bebidas e Supermercados', value: 'Alimentos, Bebidas e Supermercados' },
  {
    title: 'Associações, Fundações e Órgãos Públicos',
    value: 'Associações, Fundações e Órgãos Públicos',
  },
  { title: 'Bancos', value: 'Bancos' },
  { title: 'Comércio e Distribuidoras', value: 'Comércio e Distribuidoras' },
  {
    title: 'Educação, Editora e Outros Serviços',
    value: 'Educação, Editora e Outros Serviços',
  },
  { title: 'Energia', value: 'Energia' },
  { title: 'Indústria', value: 'Indústria' },
  {
    title: 'Informática, Consultoria e Tecnologia',
    value: 'Informática, Consultoria e Tecnologia',
  },
  { title: 'Logística e Transportes', value: 'Logística e Transportes' },
  { title: 'Móveis', value: 'Móveis' },
  { title: 'Saúde', value: 'Saúde' },
  { title: 'Vestuário e Calçados', value: 'Vestuário e Calçados' },
  { title: 'Serviços', value: 'Serviços' },
]

describe('clientLogoType', () => {
  it('registers client logos with the approved sectors', () => {
    const clientLogoType = schemaTypes.find((schemaType) => schemaType.name === 'clientLogo')

    expect(clientLogoType).toBeDefined()
    expect(clientLogoType.name).toBe('clientLogo')
    expect(clientLogoType.title).toBe('Clientes')

    const fieldsByName = Object.fromEntries(clientLogoType.fields.map((field) => [field.name, field]))

    expect(fieldsByName.name.type).toBe('string')
    expect(fieldsByName.logo.type).toBe('image')
    expect(fieldsByName.logo.options.hotspot).toBe(true)
    expect(fieldsByName.sector.type).toBe('string')
    expect(fieldsByName.sector.options.list).toEqual(clientSectorOptions)
    expect(fieldsByName.isVisible.initialValue).toBe(true)
    expect(fieldsByName.showOnHome.type).toBe('boolean')
    expect(fieldsByName.showOnHome.title).toBe('O logotipo aparece na home')
    expect(fieldsByName.showOnHome.initialValue).toBe(false)
    expect(fieldsByName.showOnCases.type).toBe('boolean')
    expect(fieldsByName.showOnCases.title).toBe('O logotipo aparece na página Cases')
    expect(fieldsByName.showOnCases.initialValue).toBe(true)
    expect(fieldsByName.caseTitle.type).toBe('string')
    expect(fieldsByName.caseTitle.title).toBe('Título na página Cases')
    expect(fieldsByName.caseTitle.hidden({ parent: { showOnCases: true } })).toBe(false)
    expect(fieldsByName.caseTitle.hidden({ parent: { showOnCases: false } })).toBe(true)
    expect(fieldsByName.caseDescription.type).toBe('text')
    expect(fieldsByName.caseDescription.title).toBe('Descrição na página Cases')
    expect(fieldsByName.caseDescription.rows).toBe(3)
    expect(fieldsByName.caseDescription.hidden({ parent: { showOnCases: true } })).toBe(false)
    expect(fieldsByName.caseDescription.hidden({ parent: { showOnCases: false } })).toBe(true)
    expect(fieldsByName.caseSlug.type).toBe('slug')
    expect(fieldsByName.caseSlug.options.source).toBe('name')
    expect(fieldsByName.caseSlug.hidden({ parent: { showOnCases: true } })).toBe(false)
    expect(fieldsByName.caseSlug.hidden({ parent: { showOnCases: false } })).toBe(true)
    expect(fieldsByName.caseContent.type).toBe('array')
    expect(fieldsByName.caseContent.of).toEqual([{ type: 'block' }])
    expect(fieldsByName.caseContent.hidden({ parent: { showOnCases: true } })).toBe(false)
    expect(fieldsByName.caseContent.hidden({ parent: { showOnCases: false } })).toBe(true)
    expect(fieldsByName.sortOrder.type).toBe('number')
  })
})
