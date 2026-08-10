import { describe, expect, it } from 'vitest'
import { buildStructuredData } from './structuredData'

describe('structured data', () => {
  it('uses only confirmed organization and local-business facts', () => {
    const data = buildStructuredData('/', {
      canonicalUrl: 'https://www.otimiza.test/',
      title: 'Consultoria empresarial | Otimiza',
      description: 'Consultoria empresarial, tecnologia e desenvolvimento.',
    })
    const organization = data['@graph'].find((item) => item['@id'] === 'https://www.otimiza.test/#organization')

    expect(organization['@type']).toEqual(['Organization', 'ProfessionalService'])
    expect(organization.name).toBe('Otimiza')
    expect(organization.email).toBe('otm@otm.com.br')
    expect(organization.address).toMatchObject({
      streetAddress: 'Rua Frei Pacífico, 260',
      addressLocality: 'Caxias do Sul',
      addressRegion: 'RS',
      postalCode: '95032-380',
      addressCountry: 'BR',
    })
    expect(organization.telephone).toBeUndefined()
    expect(organization.aggregateRating).toBeUndefined()
    expect(organization.priceRange).toBeUndefined()
  })

  it('adds WebSite and a page-specific breadcrumb without duplicate graph nodes', () => {
    const data = buildStructuredData('/quem-somos', {
      canonicalUrl: 'https://www.otimiza.test/quem-somos',
      title: 'Quem somos | Otimiza',
      description: 'Conheça a Otimiza.',
    })
    const types = data['@graph'].map((item) => item['@type']).flat()
    const ids = data['@graph'].map((item) => item['@id'])

    expect(types).toContain('WebSite')
    expect(types).toContain('WebPage')
    expect(types).toContain('BreadcrumbList')
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('adds Service only to real service pages', () => {
    const serviceData = buildStructuredData('/tecnologia', {
      canonicalUrl: 'https://www.otimiza.test/tecnologia',
      title: 'Tecnologia | Otimiza',
      description: 'Tecnologia para gestão.',
    })
    const aboutData = buildStructuredData('/quem-somos', {
      canonicalUrl: 'https://www.otimiza.test/quem-somos',
      title: 'Quem somos | Otimiza',
      description: 'Conheça a Otimiza.',
    })

    expect(serviceData['@graph'].some((item) => item['@type'] === 'Service')).toBe(true)
    expect(aboutData['@graph'].some((item) => item['@type'] === 'Service')).toBe(false)
  })
})
