import { describe, expect, it, vi } from 'vitest'
import { createPostPageHandler, fetchPublishedPost } from './post-page.js'

const post = { title: 'Novo <artigo>', slug: 'novo-artigo', publishedAt: '2026-10-14T12:00:00Z', mainImageUrl: 'https://cdn.sanity.io/images/igy822g7/production/new-1200x630.png' }
const shell = '<html lang="pt-BR"><head><title>Home</title><meta property="og:image" content="home.jpg"/><link rel="canonical" href="https://www.otm.com.br/"/></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>'
const req = (extra = {}) => ({ method: 'GET', query: { slug: post.slug, date: '2026/10/14' }, ...extra })
function response() {
  return { statusCode: 200, headers: {}, body: undefined, setHeader(k, v) { this.headers[k] = v }, end(body) { this.body = body } }
}
const handler = (fetchPost = async () => post) => createPostPageHandler({ fetchPost, readShell: async () => shell })

describe('live post HTML', () => {
  it('serves a new post with unique social metadata and the built React shell', async () => {
    const res = response()
    await handler()(req(), res)
    expect(res.statusCode).toBe(200)
    expect(res.headers['Cache-Control']).toBe('no-store')
    expect(res.body).toContain('<title>Novo &lt;artigo&gt; | Otimiza</title>')
    expect(res.body).toContain('https://www.otm.com.br/2026/10/14/novo-artigo')
    expect(res.body).toContain('new-1200x630.png?w=1200&amp;h=630')
    expect(res.body.match(/property="og:image"/g)).toHaveLength(1)
    expect(res.body.match(/rel="canonical"/g)).toHaveLength(1)
    expect(res.body).not.toContain('home.jpg')
    expect(res.body).toContain('/assets/app.js')
    expect(res.body).toContain('lang="pt-BR"')
  })
  it('reads edited images on the next request without rebuilding or a cached response', async () => {
    let current = post
    const serve = handler(async () => current)
    const first = response(); await serve(req(), first)
    current = { ...post, mainImageUrl: 'https://cdn.sanity.io/images/igy822g7/production/edited-1200x630.jpg' }
    const next = response(); await serve(req(), next)
    expect(next.body).toContain('edited-1200x630.jpg')
    expect(next.body).not.toContain('new-1200x630.png')
  })
  it('supports the Inspire alias with a dated canonical and HEAD without a body', async () => {
    const res = response(); await handler()(req({ method: 'HEAD', query: { slug: post.slug } }), res)
    expect(res.statusCode).toBe(200)
    expect(res.headers['Content-Type']).toContain('text/html')
    expect(res.body).toBeUndefined()
  })
  it('provides an Inspire card for legacy posts without any image', async () => {
    const res = response(); await handler(async () => ({ ...post, mainImageUrl: null }))(req(), res)
    expect(res.body).toContain('https://www.otm.com.br/inspire-newsletter-card.png')
    expect(res.body).toContain('image/png')
  })
  it.each([null, { ...post, publishedAt: '2026-10-13T12:00:00Z' }])('returns 404 for absent posts or a wrong permalink date', async (value) => {
    const res = response(); await handler(async () => value)(req(), res)
    expect(res.statusCode).toBe(404)
    expect(res.headers['Cache-Control']).toBe('no-store')
    expect(res.body).not.toContain('og:image')
  })
  it('returns 503 without caching the home metadata when the CMS fails', async () => {
    const res = response(); await handler(async () => { throw Error('CMS down') })(req(), res)
    expect(res.statusCode).toBe(503)
    expect(res.headers['Cache-Control']).toBe('no-store')
    expect(res.body).not.toContain('og:image')
  })
  it.each([{ slug: '../secret' }, { slug: ['a', 'b'] }, { slug: post.slug, date: '2026/02/30' }])('rejects invalid inputs before calling the CMS', async (query) => {
    const fetchPost = vi.fn(); const res = response()
    await handler(fetchPost)(req({ query }), res)
    expect(res.statusCode).toBe(404)
    expect(fetchPost).not.toHaveBeenCalled()
  })
  it('rejects methods other than GET and HEAD', async () => {
    const res = response(); await handler()(req({ method: 'POST' }), res)
    expect(res.statusCode).toBe(405)
    expect(res.headers.Allow).toBe('GET, HEAD')
  })
  it.each(['artigo__trashed', 'artigo%ef%bf%bc'])('preserves safe imported WordPress slugs: %s', async (slug) => {
    const res = response()
    await handler(async () => ({ ...post, slug }))(req({ query: { slug: decodeURIComponent(slug), date: '2026/10/14' } }), res)
    expect(res.statusCode).toBe(200)
    expect(res.body).toContain(`/2026/10/14/${slug}`)
  })
})

describe('published Sanity post lookup', () => {
  it('uses the uncached API, parameterizes the slug, excludes drafts and applies a timeout', async () => {
    const fetchFn = vi.fn(async () => ({ ok: true, json: async () => ({ result: post }) }))
    expect(await fetchPublishedPost(post.slug, fetchFn)).toEqual(post)
    const [url, options] = fetchFn.mock.calls[0]
    const parsed = new URL(url)
    expect(parsed.hostname).toBe('igy822g7.api.sanity.io')
    expect(parsed.searchParams.get('$slug')).toBe(JSON.stringify(post.slug))
    expect(parsed.searchParams.get('query')).toContain('!(_id in path("drafts.**"))')
    expect(parsed.searchParams.get('query')).toContain('slug.current == $slug')
    expect(options.signal).toBeDefined()
  })
  it('fails on non-success CMS responses', async () => {
    await expect(fetchPublishedPost(post.slug, async () => ({ ok: false, status: 503 }))).rejects.toThrow()
  })
  it.each([{}, { result: [] }, { result: { ...post, slug: 'other' } }])('rejects malformed CMS data instead of treating it as a missing post', async (body) => {
    await expect(fetchPublishedPost(post.slug, async () => ({ ok: true, json: async () => body }))).rejects.toThrow()
  })
})
