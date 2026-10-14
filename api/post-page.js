import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getPostOutputPath, renderPostSocialPage } from '../scripts/generate-post-social-pages.mjs'

const SITE_ORIGIN = 'https://www.otm.com.br'
const SLUG = /^(?:[a-z0-9_-]|%ef%bf%bc)+$/i
const QUERY = `*[_type == "post" && !(_id in path("drafts.**")) && slug.current == $slug][0]{
  title, description, "slug": slug.current, publishedAt,
  "mainImageUrl": mainImage.asset->url,
  "contentImageUrl": content[_type == "image"][0].asset->url
}`

export async function fetchPublishedPost(slug, fetchFn = globalThis.fetch) {
  const url = new URL('https://igy822g7.api.sanity.io/v2024-03-21/data/query/production')
  url.searchParams.set('query', QUERY)
  url.searchParams.set('$slug', JSON.stringify(slug))
  const response = await fetchFn(url.toString(), { signal: AbortSignal.timeout(8000), cache: 'no-store' })
  if (!response.ok) throw new Error(`Sanity HTTP ${response.status}`)
  const body = await response.json()
  if (!Object.hasOwn(body, 'result')) throw new Error('Invalid Sanity response')
  if (body.result !== null && (
    typeof body.result !== 'object' || Array.isArray(body.result)
    || body.result.slug !== slug || typeof body.result.title !== 'string'
  )) throw new Error('Invalid Sanity post')
  return body.result
}

export function createPostPageHandler({
  fetchPost = fetchPublishedPost,
  readShell = () => readFile(path.join(process.cwd(), 'dist/post-shell.html'), 'utf8'),
} = {}) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('CDN-Cache-Control', 'no-store')
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    const finish = (status, body) => {
      res.statusCode = status
      res.end(req.method === 'HEAD' ? undefined : body)
    }
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.setHeader('Allow', 'GET, HEAD')
      return finish(405, 'Método não permitido.')
    }
    const { slug: requestSlug, date } = req.query || {}
    const slug = typeof requestSlug === 'string' ? requestSlug.replaceAll('\uFFFC', '%ef%bf%bc') : requestSlug
    if (typeof slug !== 'string' || !SLUG.test(slug)
      || date !== undefined && (typeof date !== 'string'
        || !/^\d{4}\/\d{2}\/\d{2}$/.test(date)
        || !getPostOutputPath({ slug, publishedAt: date.replaceAll('/', '-') }))) {
      return finish(404, 'Publicação não encontrada.')
    }
    try {
      const post = await fetchPost(slug)
      if (!post) return finish(404, 'Publicação não encontrada.')
      const outputPath = getPostOutputPath(post)
      if (!outputPath) throw new Error('Post missing a valid publication date')
      if (date && !outputPath.startsWith(`${date}/`)) return finish(404, 'Publicação não encontrada.')
      const html = renderPostSocialPage({
        post, siteOrigin: SITE_ORIGIN,
        fallbackImageUrl: `${SITE_ORIGIN}/inspire-newsletter-card.png`,
        baseHtml: await readShell(),
      })
      return finish(200, html)
    } catch {
      res.setHeader('Retry-After', '30')
      return finish(503, 'Publicação temporariamente indisponível. Tente novamente em instantes.')
    }
  }
}

export default createPostPageHandler()
