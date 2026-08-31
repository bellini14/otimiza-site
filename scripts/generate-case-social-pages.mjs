export const CASES_QUERY = `*[_type == "clientLogo" && isVisible != false && showOnCases == true] {
  "name": name,
  "title": caseTitle,
  "description": caseDescription,
  "slug": caseSlug.current,
  "imageUrl": logo.asset->url
}`

const CASE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function renderCaseSocialPage({ caseStudy, siteOrigin, baseHtml } = {}) {
  const slug = typeof caseStudy?.slug === 'string' ? caseStudy.slug : ''
  if (!CASE_SLUG.test(slug)) {
    throw new Error('A valid case slug is required to render a social page.')
  }

  const name = caseStudy.name || caseStudy.title || 'cliente'
  const title = `${caseStudy.title || name} | Otimiza`
  const description = caseStudy.description || `Case de consultoria da Otimiza para ${name}.`
  const canonicalUrl = new URL(`/cases/${slug}`, `${siteOrigin}/`).toString()
  const imageUrl = caseStudy.imageUrl ? new URL(caseStudy.imageUrl).toString() : null
  const titleTag = `<title>${escapeHtml(title)}</title>`
  const descriptionTag = `<meta name="description" content="${escapeHtml(description)}" />`
  const imageTags = imageUrl ? [
    `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
  ] : []
  const twitterImageTags = imageUrl ? [
    `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
  ] : []
  const socialTags = [
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    '<meta property="og:type" content="article" />',
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    ...imageTags,
    `<meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    ...twitterImageTags,
  ].join('\n  ')
  const documentHtml = baseHtml || '<!doctype html><html lang="pt-BR"><head></head><body><div id="root"></div></body></html>'
  const withTitle = /<title>[\s\S]*?<\/title>/i.test(documentHtml)
    ? documentHtml.replace(/<title>[\s\S]*?<\/title>/i, titleTag)
    : documentHtml.replace(/<head(\s[^>]*)?>/i, (head) => `${head}\n  ${titleTag}`)
  const withDescription = /<meta\s+name=["']description["'][^>]*>/i.test(withTitle)
    ? withTitle.replace(/<meta\s+name=["']description["'][^>]*>/i, descriptionTag)
    : withTitle.replace(/<\/head>/i, `  ${descriptionTag}\n  </head>`)

  return withDescription.replace(/<\/head>/i, `  ${socialTags}\n  </head>`)
}

export async function fetchCaseStudies(fetchFn = globalThis.fetch) {
  const query = encodeURIComponent(CASES_QUERY)
  const response = await fetchFn(`https://igy822g7.api.sanity.io/v2024-03-21/data/query/production?query=${query}`)
  if (!response.ok) throw new Error(`Sanity returned HTTP ${response.status}`)
  const body = await response.json()
  if (!Array.isArray(body.result)) throw new Error('Sanity returned an invalid cases response')
  return body.result
}

export async function generateCaseSocialPages({
  siteOrigin,
  baseHtml,
  fetchCases = fetchCaseStudies,
  localCases = {},
  resolveLocalSlug = () => null,
  localHeroImages = {},
  writeFile,
} = {}) {
  if (typeof writeFile !== 'function') throw new Error('A writeFile boundary is required.')
  const caseStudyRecords = await fetchCases()
  if (!Array.isArray(caseStudyRecords)) {
    throw new Error('Could not fetch cases: response was not an array.')
  }

  let generated = 0
  let skipped = 0
  for (const caseStudy of caseStudyRecords) {
    const slug = caseStudy?.slug || resolveLocalSlug(caseStudy?.name)
    if (!CASE_SLUG.test(slug || '')) {
      skipped += 1
      continue
    }
    const localCase = localCases[slug]
    const resolvedCase = {
      ...caseStudy,
      slug,
      title: caseStudy.title || localCase?.title || caseStudy.name,
      description: caseStudy.description || localCase?.subtitle,
      imageUrl: localHeroImages[slug] || caseStudy.imageUrl || null,
    }
    await writeFile(
      `cases/${slug}/index.html`,
      renderCaseSocialPage({ caseStudy: resolvedCase, siteOrigin, baseHtml }),
    )
    generated += 1
  }

  return { generated, skipped }
}
