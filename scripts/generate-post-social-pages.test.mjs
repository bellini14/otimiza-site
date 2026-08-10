import { describe, expect, it, vi } from 'vitest'
import {
  DESCRIPTION,
  generatePostSocialPages,
  getPostOutputPath,
  renderPostSocialPage,
  resolvePublicSiteOrigin,
} from './generate-post-social-pages.mjs'

const siteOrigin = 'https://www.otm.com.br'
const fallbackImageUrl = `${siteOrigin}/assets/hero-bw.jpg`
const post = {
  title: 'Um <post> & "especial"',
  slug: 'exemplo',
  publishedAt: '2026-07-28T12:00:00Z',
  contentImageUrl: 'https://cdn.sanity.io/images/example/post.jpg?x=1&y=2',
}

describe('post social page generation', () => {
  it('uses the legacy OTM URL for mapped Sanity social metadata', () => {
    const html = renderPostSocialPage({
      post: {
        ...post,
        mainImageUrl: 'https://cdn.sanity.io/images/igy822g7/production/0122eed8d7195fe28022797c883bcb730ac02641-856x314.png?w=1200',
      },
      siteOrigin,
      fallbackImageUrl,
    })

    expect(html).toContain('https://www.otm.com.br/wp-content/uploads/2020/10/Screenshot_11.png')
    expect(html).not.toContain('cdn.sanity.io/images/igy822g7/production/0122eed8d7195fe28022797c883bcb730ac02641')
  })

  it('renders escaped article metadata for a dated post', () => {
    const html = renderPostSocialPage({ post, siteOrigin, fallbackImageUrl })

    expect(html).toContain('<title>Um &lt;post&gt; &amp; &quot;especial&quot; | Otimiza</title>')
    expect(html).toContain('<meta property="og:title" content="Um &lt;post&gt; &amp; &quot;especial&quot; | Otimiza" />')
    expect(html).toContain(`<meta name="description" content="${DESCRIPTION}" />`)
    expect(html).toContain(`<meta property="og:description" content="${DESCRIPTION}" />`)
    expect(html).toContain('<meta property="og:type" content="article" />')
    expect(html).toContain('<link rel="canonical" href="https://www.otm.com.br/2026/07/28/exemplo" />')
    expect(html).toContain('<meta property="og:url" content="https://www.otm.com.br/2026/07/28/exemplo" />')
    expect(html).toContain('https://cdn.sanity.io/images/example/post.jpg?x=1&amp;y=2')
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />')
  })

  it('uses the fallback image when a post has no featured image', () => {
    const html = renderPostSocialPage({
      post: { ...post, contentImageUrl: null },
      siteOrigin,
      fallbackImageUrl,
    })

    expect(html).toContain(`<meta property="og:image" content="${fallbackImageUrl}" />`)
    expect(html).toContain(`<meta name="twitter:image" content="${fallbackImageUrl}" />`)
  })

  it('uses the Sanity main image before an inline content image', () => {
    const html = renderPostSocialPage({
      post: {
        ...post,
        mainImageUrl: 'https://cdn.sanity.io/images/example/featured-image.png',
        contentImageUrl: 'https://cdn.sanity.io/images/example/content-image.jpg',
      },
      siteOrigin,
      fallbackImageUrl,
    })

    expect(html).toContain('https://cdn.sanity.io/images/example/featured-image.png')
    expect(html).not.toContain('https://cdn.sanity.io/images/example/content-image.jpg')
  })

  it('derives an output path only from valid dated post values', () => {
    expect(getPostOutputPath(post)).toBe('2026/07/28/exemplo/index.html')
    expect(getPostOutputPath({ ...post, publishedAt: '2026-02-30T12:00:00Z' })).toBeNull()
    expect(getPostOutputPath({ ...post, slug: '../escape' })).toBeNull()
    expect(getPostOutputPath({ ...post, publishedAt: null })).toBeNull()
  })

  it('requires a public HTTPS production site origin', () => {
    expect(resolvePublicSiteOrigin({ VITE_SITE_URL: siteOrigin })).toBe(siteOrigin)
    expect(resolvePublicSiteOrigin({ VITE_SITE_URL: siteOrigin, VERCEL_ENV: 'preview' })).toBe(siteOrigin)
    expect(resolvePublicSiteOrigin({ VITE_SITE_URL: 'https://otimiza-site.vercel.app' })).toBe('https://otimiza-site.vercel.app')
    expect(() => resolvePublicSiteOrigin({})).toThrow('VITE_SITE_URL')
    expect(() => resolvePublicSiteOrigin({ VITE_SITE_URL: 'http://www.otm.com.br' })).toThrow('HTTPS')
    expect(() => resolvePublicSiteOrigin({ VITE_SITE_URL: 'https://localhost:5173' })).toThrow('localhost')
    expect(() => resolvePublicSiteOrigin({ VITE_SITE_URL: 'https://127.0.0.1' })).toThrow('localhost')
    expect(() => resolvePublicSiteOrigin({ VITE_SITE_URL: 'https://[::1]' })).toThrow('localhost')
    expect(() => resolvePublicSiteOrigin({ VITE_SITE_URL: 'https://[::]' })).toThrow('non-public IPv6')
    expect(() => resolvePublicSiteOrigin({ VITE_SITE_URL: 'https://[fc00::1]' })).toThrow('non-public IPv6')
    expect(() => resolvePublicSiteOrigin({ VITE_SITE_URL: 'https://[fe80::1]' })).toThrow('non-public IPv6')
    expect(() => resolvePublicSiteOrigin({ VITE_SITE_URL: 'https://[::127.0.0.1]' })).toThrow('non-public IPv6')
    expect(() => resolvePublicSiteOrigin({ VITE_SITE_URL: 'https://[::10.0.0.1]' })).toThrow('non-public IPv6')
    expect(() => resolvePublicSiteOrigin({ VITE_SITE_URL: 'https://[::ffff:127.0.0.1]' })).toThrow('non-public IPv6')
    expect(() => resolvePublicSiteOrigin({ VITE_SITE_URL: 'https://[::ffff:10.0.0.1]' })).toThrow('non-public IPv6')
    expect(() => resolvePublicSiteOrigin({ VITE_SITE_URL: 'https://10.0.0.1' })).toThrow('private')
    expect(() => resolvePublicSiteOrigin({ VITE_SITE_URL: 'https://0.0.0.0' })).toThrow('private')
    expect(() => resolvePublicSiteOrigin({ VITE_SITE_URL: 'https://otimiza-git-main.vercel.app' })).toThrow('preview')
    expect(() => resolvePublicSiteOrigin({ VITE_SITE_URL: 'https://otimiza-abc123-joao.vercel.app' })).toThrow('preview')
    expect(() => resolvePublicSiteOrigin({ VITE_SITE_URL: 'https://otimiza-abc123-minha-equipe.vercel.app' })).toThrow('preview')
  })

  it('writes only valid dated posts and fails when fetching posts fails', async () => {
    const writeFile = vi.fn()
    const result = await generatePostSocialPages({
      environment: { VITE_SITE_URL: siteOrigin },
      fallbackImageUrl,
      fetchPosts: async () => [post, { ...post, slug: '' }],
      writeFile,
    })

    expect(result).toEqual({ generated: 1, skipped: 1 })
    expect(writeFile).toHaveBeenCalledWith(
      '2026/07/28/exemplo/index.html',
      expect.stringContaining('<meta property="og:type" content="article" />'),
    )
    await expect(generatePostSocialPages({
      environment: { VITE_SITE_URL: siteOrigin },
      fallbackImageUrl,
      fetchPosts: async () => { throw new Error('Sanity unavailable') },
      writeFile,
    })).rejects.toThrow('Could not fetch Inspire posts: Sanity unavailable')
  })
})
