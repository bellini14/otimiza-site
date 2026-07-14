import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { staticPageMetadata, buildCanonicalUrl } from '../src/seo/siteMetadata.js'
import { caseStudies } from '../src/data/caseStudies.js'
import { staticBlogPosts } from '../src/data/blogPosts.js'
import { resolveSiteOrigin } from './generate-static-seo.mjs'

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export function renderSitemapXml(routes, siteOrigin) {
  const locations = [...new Set(routes)]
    .map((route) => buildCanonicalUrl(route, siteOrigin))
    .map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`)
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    locations,
    '</urlset>',
    '',
  ].join('\n')
}

export function renderRobotsTxt(siteOrigin) {
  const sitemapUrl = buildCanonicalUrl('/sitemap.xml', siteOrigin)
  return `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`
}

export function getIndexableRoutes() {
  return [
    ...Object.keys(staticPageMetadata),
    ...Object.keys(caseStudies).map((slug) => `/cases/${slug}`),
    ...staticBlogPosts.map((post) => `/inspire/${post.slug}`),
  ]
}

export function generateSitemapFiles(distDirectory) {
  const siteOrigin = resolveSiteOrigin()
  fs.writeFileSync(
    path.join(distDirectory, 'sitemap.xml'),
    renderSitemapXml(getIndexableRoutes(), siteOrigin),
  )
  fs.writeFileSync(
    path.join(distDirectory, 'robots.txt'),
    renderRobotsTxt(siteOrigin),
  )
}

const invokedFile = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ''

if (import.meta.url === invokedFile) {
  generateSitemapFiles(path.resolve('dist'))
}
