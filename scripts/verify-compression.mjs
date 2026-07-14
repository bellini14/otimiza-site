import path from 'node:path'
import { pathToFileURL } from 'node:url'

export function validateCompressionHeaders(headers) {
  const encoding = headers.get('content-encoding')?.toLowerCase()
  if (encoding === 'br' || encoding === 'gzip') return encoding
  throw new Error('Resposta textual sem Content-Encoding br ou gzip')
}

async function requestCompressed(url) {
  const response = await fetch(url, {
    headers: {
      'Accept-Encoding': 'br, gzip',
    },
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`${url} respondeu com HTTP ${response.status}`)
  }

  return {
    encoding: validateCompressionHeaders(response.headers),
    response,
  }
}

export async function verifyDeploymentCompression(siteUrl) {
  const origin = new URL(siteUrl)
  origin.protocol = 'https:'
  const homeUrl = new URL('/', origin).toString()
  const homeResult = await requestCompressed(homeUrl)
  const html = await homeResult.response.text()
  const assetPath = html.match(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/)?.[1]

  if (!assetPath) {
    throw new Error('Nenhum arquivo textual JS/CSS foi encontrado no HTML publicado')
  }

  const assetUrl = new URL(assetPath, origin).toString()
  const assetResult = await requestCompressed(assetUrl)

  return [
    { url: homeUrl, encoding: homeResult.encoding },
    { url: assetUrl, encoding: assetResult.encoding },
  ]
}

const invokedFile = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ''

if (import.meta.url === invokedFile) {
  const siteUrl = process.argv[2] || process.env.VITE_SITE_URL
  if (!siteUrl) {
    throw new Error('Informe o domínio: npm run verify:compression -- https://seu-dominio.com')
  }

  const results = await verifyDeploymentCompression(siteUrl)
  results.forEach(({ url, encoding }) => {
    console.log(`${encoding.toUpperCase()}: ${url}`)
  })
}
