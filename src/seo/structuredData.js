const socialProfiles = [
  'https://www.facebook.com/Otimizaconsultoria',
  'https://www.youtube.com/channel/UC8blc6s_gWY5tvWDhW6Y7IA',
  'https://www.instagram.com/otm_consultoria/',
  'https://www.linkedin.com/company/otimiza-consultoria',
]

const routeLabels = {
  '/': 'Início',
  '/quem-somos': 'Quem somos',
  '/nossa-abordagem': 'Nossa abordagem',
  '/o-que-fazemos': 'O que fazemos',
  '/cases': 'Cases',
  '/tecnologia': 'Tecnologia',
  '/academia-otimiza': 'Academia Otimiza',
  '/contato': 'Contato',
  '/inspire': 'Inspire',
  '/inspire/newsletter': 'Newsletter Inspire',
}

const services = {
  '/o-que-fazemos': 'Consultoria empresarial',
  '/tecnologia': 'Tecnologia para gestão',
  '/academia-otimiza': 'Desenvolvimento de equipes',
}

export function buildStructuredData(pathname, page) {
  const siteOrigin = new URL('/', page.canonicalUrl).toString()
  const organizationId = `${siteOrigin}#organization`
  const websiteId = `${siteOrigin}#website`
  const graph = [
    {
      '@type': ['Organization', 'ProfessionalService'],
      '@id': organizationId,
      name: 'Otimiza',
      url: siteOrigin,
      email: 'otm@otm.com.br',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rua Frei Pacífico, 260',
        addressLocality: 'Caxias do Sul',
        addressRegion: 'RS',
        postalCode: '95032-380',
        addressCountry: 'BR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -29.146183,
        longitude: -51.188804,
      },
      sameAs: socialProfiles,
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: siteOrigin,
      name: 'Otimiza',
      publisher: { '@id': organizationId },
      inLanguage: 'pt-BR',
    },
    {
      '@type': 'WebPage',
      '@id': `${page.canonicalUrl}#webpage`,
      url: page.canonicalUrl,
      name: page.title,
      description: page.description,
      isPartOf: { '@id': websiteId },
      about: { '@id': organizationId },
      inLanguage: 'pt-BR',
    },
  ]

  if (pathname !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${page.canonicalUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Início',
          item: siteOrigin,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: routeLabels[pathname] || page.title,
          item: page.canonicalUrl,
        },
      ],
    })
  }

  if (services[pathname]) {
    graph.push({
      '@type': 'Service',
      '@id': `${page.canonicalUrl}#service`,
      name: services[pathname],
      description: page.description,
      url: page.canonicalUrl,
      provider: { '@id': organizationId },
      areaServed: {
        '@type': 'Country',
        name: 'Brasil',
      },
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}
