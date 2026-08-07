import { pathToFileURL } from 'node:url'

export const DESCRIPTION = 'Confira a publicação do Inspire.'
export const INSPIRE_POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  "title": title,
  "slug": slug.current,
  publishedAt,
  "imageUrl": mainImage.asset->url
}`

const POST_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i
const DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})(?:T|$)/

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function resolvePublicSiteOrigin(environment = process.env) {
  const configuredUrl = environment.VITE_SITE_URL
  if (!configuredUrl) {
    throw new Error('VITE_SITE_URL must be a public HTTPS production URL.')
  }

  let url
  try {
    url = new URL(configuredUrl)
  } catch {
    throw new Error('VITE_SITE_URL must be a valid public HTTPS production URL.')
  }

  if (url.protocol !== 'https:') {
    throw new Error('VITE_SITE_URL must use HTTPS.')
  }
  if (url.hostname === 'localhost' || url.hostname.endsWith('.localhost')) {
    throw new Error('VITE_SITE_URL cannot use localhost.')
  }
  const isVercelPreviewAlias = /-git-[a-z0-9-]+\.vercel\.app$/i.test(url.hostname)
  if (environment.VERCEL_ENV === 'preview' || isVercelPreviewAlias) {
    throw new Error('VITE_SITE_URL cannot use a Vercel preview host.')
  }
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error('VITE_SITE_URL must contain only the public site origin.')
  }

  return url.origin
}

export function getPostOutputPath(post = {}) {
  const dateMatch = typeof post.publishedAt === 'string' && post.publishedAt.match(DATE_PREFIX)
  const slug = typeof post.slug === 'string' ? post.slug : ''
  if (!dateMatch || !POST_SLUG.test(slug)) return null

  const [, year, month, day] = dateMatch
  const parsedDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`)
  if (
    Number.isNaN(parsedDate.getTime())
    || parsedDate.getUTCFullYear() !== Number(year)
    || parsedDate.getUTCMonth() + 1 !== Number(month)
    || parsedDate.getUTCDate() !== Number(day)
  ) return null

  return `${year}/${month}/${day}/${slug}/index.html`
}

function getPostPath(post) {
  const outputPath = getPostOutputPath(post)
  return outputPath ? `/${outputPath.slice(0, -'/index.html'.length)}` : null
}

function replaceDocumentMetadata(baseHtml, metadata) {
  const titleTag = `<title>${escapeHtml(metadata.title)}</title>`
  const descriptionTag = `<meta name="description" content="${escapeHtml(DESCRIPTION)}" />`
  const socialTags = [
    `<link rel="canonical" href="${escapeHtml(metadata.url)}" />`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(DESCRIPTION)}" />`,
    '<meta property="og:type" content="article" />',
    `<meta property="og:url" content="${escapeHtml(metadata.url)}" />`,
    `<meta property="og:image" content="${escapeHtml(metadata.imageUrl)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(DESCRIPTION)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(metadata.imageUrl)}" />`,
  ].join('\n  ')

  const withTitle = baseHtml.includes('</title>')
    ? baseHtml.replace(/<title>[\s\S]*?<\/title>/i, titleTag)
    : baseHtml.replace(/<head(\s[^>]*)?>/i, (head) => `${head}\n  ${titleTag}`)
  const withDescription = /<meta\s+name=["']description["'][^>]*>/i.test(withTitle)
    ? withTitle.replace(/<meta\s+name=["']description["'][^>]*>/i, descriptionTag)
    : withTitle.replace(/<\/head>/i, `  ${descriptionTag}\n  </head>`)

  return withDescription.replace(/<\/head>/i, `  ${socialTags}\n  </head>`)
}

export function renderPostSocialPage({ post, siteOrigin, fallbackImageUrl, baseHtml } = {}) {
  const postPath = getPostPath(post)
  if (!postPath) throw new Error('A valid dated Inspire post is required to render a social page.')
  if (!fallbackImageUrl) throw new Error('A fallback social image URL is required.')

  const title = `${post.title || 'Inspire'} | Otimiza`
  const metadata = {
    title,
    url: new URL(postPath, `${siteOrigin}/`).toString(),
    imageUrl: post.imageUrl || fallbackImageUrl,
  }
  const documentHtml = baseHtml || '<!doctype html><html lang="pt-BR"><head></head><body><div id="root"></div></body></html>'

  return replaceDocumentMetadata(documentHtml, metadata)
}

export async function fetchInspirePosts(fetchFn = globalThis.fetch) {
  const query = encodeURIComponent(INSPIRE_POSTS_QUERY)
  const response = await fetchFn(`https://igy822g7.api.sanity.io/v2024-03-21/data/query/production?query=${query}`)
  if (!response.ok) throw new Error(`Sanity returned HTTP ${response.status}`)
  const body = await response.json()
  if (!Array.isArray(body.result)) throw new Error('Sanity returned an invalid posts response')
  return body.result
}

export async function generatePostSocialPages({
  environment = process.env,
  fallbackImageUrl,
  baseHtml,
  fetchPosts = fetchInspirePosts,
  writeFile,
} = {}) {
  if (typeof writeFile !== 'function') throw new Error('A writeFile boundary is required.')
  const siteOrigin = resolvePublicSiteOrigin(environment)
  let posts
  try {
    posts = await fetchPosts()
  } catch (error) {
    throw new Error(`Could not fetch Inspire posts: ${error.message}`, { cause: error })
  }
  if (!Array.isArray(posts)) throw new Error('Could not fetch Inspire posts: response was not an array.')

  let generated = 0
  let skipped = 0
  for (const post of posts) {
    const outputPath = getPostOutputPath(post)
    if (!outputPath) {
      skipped += 1
      continue
    }
    await writeFile(outputPath, renderPostSocialPage({ post, siteOrigin, fallbackImageUrl, baseHtml }))
    generated += 1
  }
  return { generated, skipped }
}

const invokedFile = process.argv[1] ? pathToFileURL(process.argv[1]).href : ''

if (import.meta.url === invokedFile) {
  throw new Error('Use generatePostSocialPages from the build script with an output write boundary.')
}
