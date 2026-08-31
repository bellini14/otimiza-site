import { pathToFileURL } from 'node:url'
import { resolveLegacyImageUrl } from '../src/lib/legacyImageUrl.js'

export const DESCRIPTION = 'Confira a publicação do Inspire.'
export const INSPIRE_POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  "title": title,
  description,
  "slug": slug.current,
  publishedAt,
  "mainImageUrl": mainImage.asset->url,
  "contentImageUrl": content[_type == "image"][0].asset->url
}`

const POST_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i
const DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})(?:T|$)/

function isPrivateOrUnspecifiedIpv4(hostname) {
  const octets = hostname.split('.').map(Number)
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false
  }
  const [first, second] = octets
  return first === 0
    || first === 10
    || first === 100 && second >= 64 && second <= 127
    || first === 169 && second === 254
    || first === 172 && second >= 16 && second <= 31
    || first === 192 && second === 168
}

function ipv6ToBigInt(hostname) {
  const [left, right] = hostname.split('::')
  if (hostname.split('::').length > 2) return null

  const leftGroups = left ? left.split(':') : []
  const rightGroups = right ? right.split(':') : []
  const groups = hostname.includes('::')
    ? [...leftGroups, ...Array(8 - leftGroups.length - rightGroups.length).fill('0'), ...rightGroups]
    : leftGroups
  if (groups.length !== 8 || groups.some((group) => !/^[0-9a-f]{1,4}$/i.test(group))) return null

  return groups.reduce((address, group) => (address << 16n) + BigInt(`0x${group}`), 0n)
}

function isNonPublicIpv6(hostname) {
  const address = ipv6ToBigInt(hostname)
  if (address === null) return false

  const isIpv4Mapped = address >> 32n === 0xffffn
  const isIpv4Compatible = address !== 0n && address >> 32n === 0n
  if (isIpv4Mapped || isIpv4Compatible) {
    const ipv4 = Number(address & 0xffffffffn)
    const hostname = [
      ipv4 >>> 24,
      (ipv4 >>> 16) & 255,
      (ipv4 >>> 8) & 255,
      ipv4 & 255,
    ].join('.')
    return hostname.startsWith('127.') || isPrivateOrUnspecifiedIpv4(hostname)
  }

  return address === 0n
    || address === 1n
    || address >> 121n === 0x7en // fc00::/7 unique local addresses
    || address >> 118n === 0x3fan // fe80::/10 link-local addresses
    || address >> 118n === 0x3fbn // fec0::/10 deprecated site-local addresses
    || address >> 120n === 0xffn // ff00::/8 multicast addresses
}

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
  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()
  const isLoopbackAddress = hostname === '::1' || /^127(?:\.\d{1,3}){3}$/.test(hostname)
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || isLoopbackAddress) {
    throw new Error('VITE_SITE_URL cannot use localhost.')
  }
  if (hostname.includes(':') && isNonPublicIpv6(hostname)) {
    throw new Error('VITE_SITE_URL cannot use a non-public IPv6 address.')
  }
  if (isPrivateOrUnspecifiedIpv4(hostname)) {
    throw new Error('VITE_SITE_URL cannot use a private or unspecified IP address.')
  }
  const isVercelPreviewAlias = /-git-[a-z0-9-]+\.vercel\.app$/i.test(url.hostname)
  const isVercelDeploymentPreview = /-[a-z0-9]{6,}-[a-z0-9-]+\.vercel\.app$/i.test(url.hostname)
  if (isVercelPreviewAlias || isVercelDeploymentPreview) {
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
  const descriptionTag = `<meta name="description" content="${escapeHtml(metadata.description)}" />`
  const imageTags = metadata.imageUrl ? [
    `<meta property="og:image" content="${escapeHtml(metadata.imageUrl)}" />`,
    '<meta property="og:image:type" content="image/jpeg" />',
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
  ] : []
  const twitterImageTags = metadata.imageUrl
    ? [`<meta name="twitter:image" content="${escapeHtml(metadata.imageUrl)}" />`]
    : []
  const socialTags = [
    `<link rel="canonical" href="${escapeHtml(metadata.url)}" />`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
    '<meta property="og:type" content="article" />',
    `<meta property="og:url" content="${escapeHtml(metadata.url)}" />`,
    ...imageTags,
    `<meta name="twitter:card" content="${metadata.imageUrl ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`,
    ...twitterImageTags,
  ].join('\n  ')

  const withTitle = baseHtml.includes('</title>')
    ? baseHtml.replace(/<title>[\s\S]*?<\/title>/i, titleTag)
    : baseHtml.replace(/<head(\s[^>]*)?>/i, (head) => `${head}\n  ${titleTag}`)
  const withDescription = /<meta\s+name=["']description["'][^>]*>/i.test(withTitle)
    ? withTitle.replace(/<meta\s+name=["']description["'][^>]*>/i, descriptionTag)
    : withTitle.replace(/<\/head>/i, `  ${descriptionTag}\n  </head>`)

  return withDescription.replace(/<\/head>/i, `  ${socialTags}\n  </head>`)
}

function getShareImageUrl(imageUrl) {
  if (!imageUrl) return null
  const resolved = new URL(resolveLegacyImageUrl(imageUrl))
  if (resolved.hostname === 'cdn.sanity.io') {
    resolved.searchParams.set('w', '1200')
    resolved.searchParams.set('h', '630')
    resolved.searchParams.set('fit', 'crop')
    resolved.searchParams.set('fm', 'jpg')
    resolved.searchParams.set('q', '82')
  }
  return resolved.toString()
}

export function renderPostSocialPage({ post, siteOrigin, fallbackImageUrl, baseHtml } = {}) {
  const postPath = getPostPath(post)
  if (!postPath) throw new Error('A valid dated Inspire post is required to render a social page.')

  const title = `${post.title || 'Inspire'} | Otimiza`
  const metadata = {
    title,
    description: post.description || DESCRIPTION,
    url: new URL(postPath, `${siteOrigin}/`).toString(),
    imageUrl: getShareImageUrl(post.mainImageUrl || post.contentImageUrl),
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
