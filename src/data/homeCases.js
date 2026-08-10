import { resolveLegacyImageUrl } from '../lib/legacyImageUrl'

const HOME_CASES = [
  {
    id: 'fallback-banco-moneo',
    company: 'Banco Moneo',
    sector: 'Bancos',
    summary: 'Automatizamos a gestão de contratos para reduzir conferências, acelerar emissões e aumentar a segurança das informações.',
    logoAlt: 'Moneo',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/14ada562c98ddb5d2c60222e9288035ac02e1a03-2270x635.png',
    slug: 'banco-moneo',
  },
  {
    id: 'fallback-bontempo',
    company: 'Bontempo',
    sector: 'Móveis',
    summary: 'Redesenhamos o fluxo produtivo para elevar a produtividade, eliminar retrabalho e recuperar a pontualidade das entregas.',
    logoAlt: 'Bontempo',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/2e3cf7816217227a1172f9ba9558af0c7c5d0a3f-786x168.png',
    slug: 'bontempo',
  },
  {
    id: 'fallback-cinex',
    company: 'Cinex',
    sector: 'Móveis',
    summary: 'Integramos canais de distribuição, engenharia e chão de fábrica para simplificar o fluxo de dados e o controle da produção.',
    logoAlt: 'Cinex',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/8c12d0700da0b40cdf73dcea8d4f489ef3859176-1609x608.png',
    slug: 'cinex',
  },
  {
    id: 'fallback-hospital-bruno-born',
    company: 'Hospital Bruno Born',
    sector: 'Saúde',
    summary: 'Otimizamos a administração de medicamentos para ampliar a segurança, o rastreamento e o tempo de cuidado ao paciente.',
    logoAlt: 'Hospital Bruno Born',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/6dc368567f820ffd3b92d8fb0189630d875dcd51-225x109.png',
    slug: 'hospital-bruno-born',
  },
  {
    id: 'fallback-masterpower-turbo',
    company: 'Masterpower Turbo',
    sector: 'Indústria',
    summary: 'Estruturamos a gestão integrada da manufatura e dos estoques para dar mais clareza à carteira de pedidos e à operação.',
    logoAlt: 'Masterpower Turbo',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/68ee44abb22c64e0592de20a325451ba01208b1b-317x143.svg',
    slug: 'master-power',
  },
  {
    id: 'fallback-neobus',
    company: 'Neobus',
    sector: 'Logística e Transportes',
    summary: 'Integramos engenharia e ERP, automatizando desenhos e controles para reduzir etapas de oito dias para apenas um.',
    logoAlt: 'Neobus',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/3a9af30547711112df32dce11ff99d8d3565c3b3-898x89.png',
    slug: 'neobus',
  },
  {
    id: 'fallback-santa-clara',
    company: 'Santa Clara',
    sector: 'Alimentos, Bebidas e Supermercados',
    summary: 'Implantamos um Escritório de Processos que elevou a produtividade, reduziu desperdícios e gerou ganhos financeiros mensuráveis.',
    logoAlt: 'Santa Clara',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/77ba755d421827a8073786f355383fbe2c790a52-1280x644.png',
    slug: 'santa-clara',
  },
  {
    id: 'fallback-sulmaq',
    company: 'Sulmaq',
    sector: 'Indústria',
    summary: 'Centralizamos os orçamentos no ERP, eliminando papel, simplificando aprovações e dando mais agilidade a novas vendas.',
    logoAlt: 'Sulmaq',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/4ae4885330c0477401446af9612a930df50f2f18-200x76.jpg',
    slug: 'sulmaq',
  },
  {
    id: 'fallback-tabone',
    company: 'Tabone',
    sector: 'Indústria',
    summary: 'Automatizamos o processamento de informações fabris com a OTMSuite, reduzindo um ciclo de 24 horas para pouco mais de um minuto.',
    logoAlt: 'Tabone',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/599e2fd286d3b3332b2dc73758bc9d9bc453c457-300x62.png',
    slug: 'tabone',
  },
  {
    id: 'fallback-unicasa',
    company: 'Unicasa',
    sector: 'Móveis',
    summary: 'Aplicamos Quick Wins para automatizar rotinas, qualificar informações e reduzir atividades operacionais de horas para minutos.',
    logoAlt: 'Unicasa',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/3beda322da7d2486e8dbb79eba33742907749e3c-600x133.png',
    slug: 'unicasa',
  },
]

export const HOME_CASE_FALLBACKS = HOME_CASES.map((caseStudy) => ({
  ...caseStudy,
  logoUrl: resolveLegacyImageUrl(caseStudy.logoUrl),
}))

function normalizeKey(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getFallbackForCase(caseStudy) {
  const candidateKeys = [caseStudy.caseSlug, caseStudy.name]
    .filter(Boolean)
    .map(normalizeKey)

  return HOME_CASE_FALLBACKS.find((fallback) => {
    const fallbackKeys = [fallback.slug, fallback.company].map(normalizeKey)
    if (fallback.slug === 'master-power') fallbackKeys.push('masterpower-turbo')
    return candidateKeys.some((key) => fallbackKeys.includes(key))
  })
}

export function normalizeHomeCases(cases) {
  if (!Array.isArray(cases) || cases.length === 0) return HOME_CASE_FALLBACKS

  const normalized = []
  const includedCompanies = new Set()

  cases.forEach((caseStudy, index) => {
    if (normalized.length >= 10) return
    if (!caseStudy?.name || !caseStudy?.sector || !caseStudy?.logoUrl) return

    const fallback = getFallbackForCase(caseStudy)
    const companyKey = normalizeKey(caseStudy.name)
    if (includedCompanies.has(companyKey)) return

    const summary = fallback?.summary || caseStudy.caseDescription?.replace(/\s+/g, ' ').trim()
    if (!summary) return

    normalized.push({
      id: caseStudy._id || fallback?.id || `case-${index}`,
      company: caseStudy.name,
      sector: caseStudy.sector,
      summary,
      logoAlt: caseStudy.logoAlt || fallback?.logoAlt || caseStudy.name,
      logoUrl: caseStudy.logoUrl,
      slug: caseStudy.caseSlug || fallback?.slug || normalizeKey(caseStudy.name),
    })
    includedCompanies.add(companyKey)
  })

  HOME_CASE_FALLBACKS.forEach((fallback) => {
    if (normalized.length >= 10) return
    const companyKey = normalizeKey(fallback.company)
    if (includedCompanies.has(companyKey)) return
    normalized.push({ ...fallback })
    includedCompanies.add(companyKey)
  })

  return normalized
}
