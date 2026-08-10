export const staticPageMetadata = {
  '/': {
    title: 'Consultoria Estratégica em Negócios e Execução | Otimiza',
    description: 'A Otimiza transforma estratégia em resultados, conectando visão de negócio, gestão e execução para impulsionar crescimento sustentável.',
  },
  '/quem-somos': {
    title: 'Quem somos: experiência em gestão empresarial | Otimiza',
    description: 'Conheça a Otimiza, sua experiência em gestão empresarial e a equipe que transforma estratégia, processos e dados em ações práticas.',
  },
  '/nossa-abordagem': {
    title: 'Nossa abordagem de consultoria empresarial | Otimiza',
    description: 'Entenda a abordagem da Otimiza para diagnosticar desafios, alinhar equipes, acompanhar indicadores e sustentar melhorias na gestão.',
  },
  '/o-que-fazemos': {
    title: 'Consultoria, tecnologia e desenvolvimento | Otimiza',
    description: 'Conheça as soluções da Otimiza em consultoria, tecnologia e desenvolvimento de pessoas para aprimorar gestão, processos e desempenho.',
  },
  '/cases': {
    title: 'Cases de consultoria e melhoria de processos | Otimiza',
    description: 'Veja cases reais da Otimiza em diferentes setores, com desafios, objetivos e melhorias aplicadas a processos, indicadores e operações.',
  },
  '/tecnologia': {
    title: 'Tecnologia para gestão, dados e automação | Otimiza',
    description: 'Conheça soluções de tecnologia da Otimiza para integrar sistemas, automatizar rotinas e transformar dados em decisões de gestão.',
  },
  '/academia-otimiza': {
    title: 'Academia Otimiza: desenvolvimento de equipes | Otimiza',
    description: 'Conheça a Academia Otimiza e suas trilhas, workshops e mentorias voltados ao desenvolvimento técnico e gerencial das equipes.',
  },
  '/contato': {
    title: 'Contato da consultoria Otimiza em Caxias do Sul',
    description: 'Entre em contato com a Otimiza em Caxias do Sul para conversar sobre consultoria, tecnologia, treinamentos e melhoria de processos.',
  },
  '/politica-de-privacidade': {
    title: 'Política de Privacidade | Otimiza',
    description: 'Entenda como a Otimiza trata dados pessoais, consentimento para comunicações, direitos dos titulares e solicitações de privacidade.',
  },
  '/inspire': {
    title: 'Inspire: conteúdos sobre gestão e processos | Otimiza',
    description: 'Leia análises, aprendizados e conteúdos do Inspire sobre gestão, estratégia, processos, tecnologia e desenvolvimento organizacional.',
  },
  '/inspire/newsletter': {
    title: 'Newsletter Inspire sobre gestão empresarial | Otimiza',
    description: 'Assine a newsletter Inspire para acompanhar conteúdos da Otimiza sobre gestão empresarial, processos, tecnologia e desenvolvimento.',
  },
}

export function getPageTitle(contentTitle) {
  const normalizedTitle = contentTitle?.trim()
  return normalizedTitle
    ? `${normalizedTitle} | Otimiza`
    : 'Conteúdo não encontrado | Otimiza'
}

export function getPageDescription(content) {
  const normalized = content?.replace(/\s+/g, ' ').trim()
  if (!normalized) {
    return 'O conteúdo solicitado não foi encontrado no site da Otimiza.'
  }
  if (normalized.length <= 160) return normalized

  const shortened = normalized.slice(0, 159)
  return `${shortened.slice(0, shortened.lastIndexOf(' ')).trim()}…`
}

export function buildCanonicalUrl(pathname, siteOrigin) {
  const origin = new URL(siteOrigin)
  origin.protocol = 'https:'
  origin.pathname = '/'
  origin.search = ''
  origin.hash = ''

  const parsedPath = new URL(pathname || '/', origin)
  const normalizedPath = parsedPath.pathname === '/'
    ? '/'
    : parsedPath.pathname.replace(/\/+$/, '')

  return new URL(normalizedPath, origin).toString()
}
