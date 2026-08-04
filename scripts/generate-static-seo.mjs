import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildCanonicalUrl, staticPageMetadata } from '../src/seo/siteMetadata.js'
import { memorialMetadata } from '../src/seo/memorialMetadata.js'
import { buildStructuredData } from '../src/seo/structuredData.js'

const routeHeadings = {
  '/': 'Transformamos visão em método, cultura em capacidade e estratégia em operação.',
  '/quem-somos': 'Quem somos',
  '/nossa-abordagem': 'Nossa abordagem',
  '/o-que-fazemos': 'O que fazemos',
  '/cases': 'Cases',
  '/tecnologia': 'Tecnologia',
  '/academia-otimiza': 'Academia Otimiza',
  '/contato': 'Contato',
  '/inspire': 'Inspire: conteúdos sobre gestão e processos',
  '/inspire/newsletter': 'Assine a newsletter',
}

const routeSections = {
  '/': [
    {
      heading: 'Conteúdos sobre gestão e processos',
      children: ['Estratégia', 'Tecnologia', 'Operações'],
      paragraphs: [
        'A Otimiza trabalha para transformar visão em método, cultura em capacidade e estratégia em operação. A atuação integra consultoria, tecnologia e desenvolvimento de pessoas para apoiar empresas que precisam compreender problemas, organizar prioridades e executar mudanças de forma consistente. O trabalho parte do contexto real de cada organização, de seus processos e de seus indicadores, mantendo o foco em decisões aplicáveis ao dia a dia.',
        'Na frente de consultoria, a equipe ajuda a identificar problemas relacionados à política, à organização, aos procedimentos e aos métodos da empresa. Conhecimento, experiência e tecnologia são utilizados para encontrar ações adequadas a cada situação e apoiar a implementação das mudanças. O objetivo é conectar análise e execução, evitando que diagnósticos e planos permaneçam separados da rotina das equipes responsáveis pelos resultados.',
      ],
    },
    {
      heading: 'Marcas que confiam na Otimiza',
      paragraphs: [
        'Os cases apresentados no site registram trabalhos em diferentes segmentos, como setor financeiro, indústria, saúde, alimentos e móveis. Os projetos incluem desafios de planejamento, processos produtivos, orçamento, enfermagem, farmácia, prazos e gargalos operacionais. Cada case descreve problemas, objetivos, desenvolvimento e resultados com base nas informações disponíveis no próprio projeto, permitindo compreender como a metodologia é aplicada em contextos empresariais distintos.',
      ],
    },
    {
      heading: 'Nossa tecnologia',
      paragraphs: [
        'Tecnologia é tratada como uma alavanca para automatizar, medir e escalar operações com segurança. As soluções envolvem consolidação de dados e dashboards, eliminação de tarefas repetitivas e integração entre sistemas. Essa estrutura reduz retrabalho, melhora a confiabilidade das informações e oferece indicadores mais claros para a tomada de decisão. A tecnologia complementa a consultoria e o desenvolvimento das equipes, em vez de funcionar como uma iniciativa isolada.',
      ],
    },
    {
      heading: 'Nossas soluções',
      children: ['Diagnóstico', 'Gestão estratégica', 'Inteligência de negócios'],
      paragraphs: [
        'O portfólio inclui diagnóstico, gestão estratégica, inteligência de negócios, gestão de pessoas, gestão de processos de negócio, gestão integrada da manufatura, gestão estratégica de custos, programa de otimização de desempenho, tecnologia de negócios, Academia Otimiza e consultoria on-line. As soluções são apresentadas com seus processos e resultados esperados para que cada organização identifique a frente mais coerente com sua necessidade.',
        'A Academia Otimiza amplia essa atuação por meio de trilhas de aprendizagem, workshops e mentoria. O desenvolvimento técnico e gerencial ajuda as equipes a consolidar práticas no trabalho cotidiano. Ao reunir consultoria, tecnologia e academia, a Otimiza busca sustentar melhorias ao longo do tempo, acompanhar metas e indicadores e criar condições para que a organização mantenha os avanços alcançados em seus processos e em sua gestão.',
      ],
    },
  ],
  '/quem-somos': [
    { heading: 'Como atuamos', children: ['Consultoria', 'Tecnologia', 'Academia'] },
    { heading: 'Estratégia' },
    { heading: 'Consultores' },
  ],
  '/nossa-abordagem': [
    { heading: 'Criar o atemporal' },
    { heading: 'A visão da Otimiza sobre valor', children: ['O papel da Otimiza', 'Tecnologia como meio', 'O papel das relações'] },
  ],
  '/o-que-fazemos': [
    { heading: 'Diagnóstico', children: ['Processo', 'Resultados'] },
    { heading: 'Gestão estratégica', children: ['Processo', 'Resultados'] },
    { heading: 'Inteligência de negócios', children: ['Processo', 'Resultados'] },
  ],
  '/cases': [
    { heading: 'Cases selecionados' },
    { heading: 'Nossos clientes' },
    { heading: 'Construa o próximo case de sucesso' },
  ],
  '/tecnologia': [
    { heading: 'Dados e dashboards' },
    { heading: 'Automação' },
    { heading: 'Integrações' },
  ],
  '/academia-otimiza': [
    { heading: 'Trilhas de aprendizagem' },
    { heading: 'Workshops' },
    { heading: 'Mentoria' },
  ],
  '/contato': [{ heading: 'Mande uma mensagem' }],
  '/inspire': [
    { heading: 'Publicações recentes', children: ['Gestão', 'Processos', 'Tecnologia'] },
    { heading: 'Seleções da redação' },
  ],
  '/inspire/newsletter': [],
}

const routeLinks = {
  '/': [
    { href: '/quem-somos', label: 'Conheça a Otimiza' },
    { href: '/nossa-abordagem', label: 'Entenda nossa abordagem' },
    { href: '/o-que-fazemos', label: 'Explore nossas soluções' },
    { href: '/cases', label: 'Veja nossos cases' },
    { href: '/inspire', label: 'Leia conteúdos do Inspire' },
    { href: '/contato', label: 'Fale com a Otimiza' },
  ],
  '/quem-somos': [
    { href: '/nossa-abordagem', label: 'Conheça nossa abordagem' },
    { href: '/o-que-fazemos', label: 'Veja o que fazemos' },
    { href: '/contato', label: 'Converse com a Otimiza' },
  ],
  '/nossa-abordagem': [
    { href: '/o-que-fazemos', label: 'Conheça nossas soluções' },
    { href: '/cases', label: 'Veja a abordagem aplicada nos cases' },
    { href: '/contato', label: 'Fale sobre seu contexto' },
  ],
  '/o-que-fazemos': [
    { href: '/tecnologia', label: 'Conheça nossas soluções de tecnologia' },
    { href: '/academia-otimiza', label: 'Conheça a Academia Otimiza' },
    { href: '/cases', label: 'Veja cases de consultoria' },
    { href: '/contato', label: 'Solicite uma conversa' },
  ],
  '/cases': [
    { href: '/o-que-fazemos', label: 'Conheça os serviços relacionados' },
    { href: '/nossa-abordagem', label: 'Entenda a metodologia da Otimiza' },
    { href: '/contato', label: 'Construa um novo case com a Otimiza' },
  ],
  '/tecnologia': [
    { href: '/o-que-fazemos', label: 'Veja todas as soluções' },
    { href: '/cases', label: 'Conheça aplicações em cases' },
    { href: '/contato', label: 'Converse sobre tecnologia para gestão' },
  ],
  '/academia-otimiza': [
    { href: '/o-que-fazemos', label: 'Veja todas as frentes de atuação' },
    { href: '/quem-somos', label: 'Conheça a equipe Otimiza' },
    { href: '/contato', label: 'Converse sobre desenvolvimento de equipes' },
  ],
  '/contato': [
    { href: '/o-que-fazemos', label: 'Conheça nossas soluções' },
    { href: '/cases', label: 'Veja cases da Otimiza' },
  ],
  '/inspire': [
    { href: '/inspire/newsletter', label: 'Assine a newsletter Inspire' },
    { href: '/nossa-abordagem', label: 'Conheça a abordagem da Otimiza' },
    { href: '/contato', label: 'Fale com a Otimiza' },
  ],
  '/inspire/newsletter': [
    { href: '/inspire', label: 'Volte para os conteúdos do Inspire' },
    { href: '/', label: 'Conheça o site da Otimiza' },
  ],
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function resolveSiteOrigin(environment = process.env) {
  if (environment.VITE_SITE_URL) return environment.VITE_SITE_URL
  const vercelHost = environment.VERCEL_PROJECT_PRODUCTION_URL || environment.VERCEL_URL
  if (vercelHost) {
    return vercelHost.startsWith('http') ? vercelHost : `https://${vercelHost}`
  }
  return 'https://SEU-DOMINIO-PUBLICO-AQUI'
}

export function renderStaticRouteHtml(baseHtml, page) {
  const sections = (page.sections || []).map((section) => {
    const children = (section.children || [])
      .map((heading) => `<h3>${escapeHtml(heading)}</h3>`)
      .join('')
    const paragraphs = (section.paragraphs || [])
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join('')
    return `<section><h2>${escapeHtml(section.heading)}</h2>${children}${paragraphs}</section>`
  }).join('')
  const openGraph = [
    ['og:title', page.title],
    ['og:description', page.description],
    ['og:type', 'website'],
    ['og:url', page.canonicalUrl],
    ['og:image', page.imageUrl],
    ['og:site_name', 'Otimiza'],
  ].map(([property, content]) => (
    `<meta property="${property}" content="${escapeHtml(content)}" />`
  )).join('\n  ')
  const twitterCards = [
    ['twitter:card', 'summary_large_image'],
    ['twitter:title', page.title],
    ['twitter:description', page.description],
    ['twitter:image', page.imageUrl],
  ].map(([name, content]) => (
    `<meta name="${name}" content="${escapeHtml(content)}" />`
  )).join('\n  ')
  const jsonLd = JSON.stringify(page.structuredData).replaceAll('<', '\\u003c')
  const robotsMeta = page.robots
    ? `<meta name="robots" content="${escapeHtml(page.robots)}" />\n  `
    : ''
  const links = (page.links || [])
    .map(({ href, label }) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`)
    .join('')
  const navigation = links
    ? `<nav aria-label="Links relacionados">${links}</nav>`
    : ''
  const fallback = `<main data-seo-fallback="true" style="display:none"><h1>${escapeHtml(page.h1)}</h1>${sections}${navigation}</main>`

  return baseHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"\s*\/>/,
      `<meta name="description" content="${escapeHtml(page.description)}" />`,
    )
    .replace(
      '</head>',
      `  ${robotsMeta}<link rel="canonical" href="${escapeHtml(page.canonicalUrl)}" />\n  ${openGraph}\n  ${twitterCards}\n  <script type="application/ld+json" data-seo-json-ld>${jsonLd}</script>\n  </head>`,
    )
    .replace('<div id="root"></div>', `<div id="root">${fallback}</div>`)
}

export function getStaticRouteWordCount(route) {
  const text = [
    routeHeadings[route],
    ...(routeSections[route] || []).flatMap((section) => [
      section.heading,
      ...(section.children || []),
      ...(section.paragraphs || []),
    ]),
  ].filter(Boolean).join(' ')

  return text.trim().split(/\s+/).filter(Boolean).length
}

export function generateStaticSeoPages(distDirectory, environment = process.env) {
  const indexPath = path.join(distDirectory, 'index.html')
  const baseHtml = fs.readFileSync(indexPath, 'utf8')
  const siteOrigin = resolveSiteOrigin(environment)
  const socialImageFile = fs.readdirSync(path.join(distDirectory, 'assets'))
    .find((file) => file.startsWith('hero-bw-') && file.endsWith('.jpg'))
  const imageUrl = new URL(`/assets/${socialImageFile}`, siteOrigin).toString()

  Object.entries(staticPageMetadata).forEach(([route, metadata]) => {
    const canonicalUrl = buildCanonicalUrl(route, siteOrigin)
    const page = {
      ...metadata,
      h1: routeHeadings[route],
      sections: routeSections[route],
      canonicalUrl,
      imageUrl,
      links: routeLinks[route],
    }
    const html = renderStaticRouteHtml(baseHtml, {
      ...page,
      structuredData: buildStructuredData(route, page),
    })
    const outputPath = route === '/'
      ? indexPath
      : path.join(distDirectory, `${route.slice(1)}.html`)

    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, html)
  })

  const memorialImageFile = path.join(
    distDirectory,
    memorialMetadata.imagePath.replace(/^\//, ''),
  )
  if (!fs.existsSync(memorialImageFile)) {
    throw new Error(`Missing memorial social image: ${memorialImageFile}`)
  }

  const memorialPage = {
    ...memorialMetadata,
    sections: [],
    links: [],
  }
  const memorialHtml = renderStaticRouteHtml(baseHtml, {
    ...memorialPage,
    structuredData: buildStructuredData(memorialMetadata.route, memorialPage),
  })
  fs.writeFileSync(path.join(distDirectory, 'silvana-bettiol.html'), memorialHtml)
}

const invokedFile = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ''

if (import.meta.url === invokedFile) {
  generateStaticSeoPages(path.resolve('dist'))
}
