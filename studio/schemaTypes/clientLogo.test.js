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
    expect(fieldsByName.sector.type).toBe('string')
    expect(fieldsByName.sector.options.list).toEqual(clientSectorOptions)
    expect(fieldsByName.isVisible.initialValue).toBe(true)
    expect(fieldsByName.showOnHome.type).toBe('boolean')
    expect(fieldsByName.showOnHome.title).toBe('O logotipo aparece na home')
    expect(fieldsByName.showOnHome.initialValue).toBe(false)
    expect(fieldsByName.sortOrder.type).toBe('number')
  })
})
