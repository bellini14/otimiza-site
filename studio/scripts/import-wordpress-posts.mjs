import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { JSDOM } from 'jsdom'
import sanityCli from 'sanity/cli'
import { htmlToPortableText, normalizeUrl } from './wordpressPortableText.mjs'

const { getCliClient } = sanityCli
const client = getCliClient({ apiVersion: '2025-03-01' })

const XML_PATH = path.resolve(
  process.cwd(),
  '..',
  'Posts Blog',
  'otimizaconsultoria.WordPress.2026-02-18.xml',
)

const DEFAULT_LIMIT = 3

function parseArgs(argv) {
  const options = {
    limit: DEFAULT_LIMIT,
    dryRun: false,
    offset: 0,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (arg === '--limit') {
      const next = argv[index + 1]
      options.limit = Number.parseInt(next, 10)
      index += 1
      continue
    }

    if (arg === '--offset') {
      const next = argv[index + 1]
      options.offset = Number.parseInt(next, 10)
      index += 1
    }
  }

  return options
}

function extractCdata(item, tagName) {
  const escapedTag = tagName.replace(':', '\\:')
  const cdataMatch = item.match(new RegExp(`<${escapedTag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${escapedTag}>`))
  if (cdataMatch) {
    return cdataMatch[1].trim()
  }

  const plainMatch = item.match(new RegExp(`<${escapedTag}>([\\s\\S]*?)<\\/${escapedTag}>`))
  return plainMatch ? plainMatch[1].trim() : null
}

function extractMetaValue(item, key) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = item.match(
    new RegExp(
      `<wp:postmeta>[\\s\\S]*?<wp:meta_key><!\\[CDATA\\[${escapedKey}\\]\\]><\\/wp:meta_key>[\\s\\S]*?<wp:meta_value><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/wp:meta_value>[\\s\\S]*?<\\/wp:postmeta>`,
    ),
  )

  return match ? match[1].trim() : null
}

function extractCategories(item) {
  return [...item.matchAll(/<category domain="([^"]+)" nicename="([^"]*)"><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g)].map(
    (match) => ({
      domain: match[1],
      nicename: match[2],
      value: match[3].trim(),
    }),
  )
}

function parseWordPressXml(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => {
    const item = match[1]

    return {
      title: extractCdata(item, 'title'),
      link: extractCdata(item, 'link'),
      contentHtml: extractCdata(item, 'content:encoded') ?? '',
      excerptHtml: extractCdata(item, 'excerpt:encoded') ?? '',
      postId: extractCdata(item, 'wp:post_id'),
      postDate: extractCdata(item, 'wp:post_date'),
      postDateGmt: extractCdata(item, 'wp:post_date_gmt'),
      postName: extractCdata(item, 'wp:post_name'),
      status: extractCdata(item, 'wp:status'),
      postType: extractCdata(item, 'wp:post_type'),
      categories: extractCategories(item),
      thumbnailId: extractMetaValue(item, '_thumbnail_id'),
    }
  })
}

function sanitizeSlug(value, fallback = 'post') {
  const cleanedValue = (value || fallback)
    .replace(/__trashed$/i, '')
    .replace(/[_\s]+/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

  return cleanedValue || fallback
}

function extractFirstImageUrl(contentHtml) {
  if (!contentHtml) {
    return null
  }

  const fragment = JSDOM.fragment(contentHtml)
  const image = fragment.querySelector('img')
  return normalizeUrl(image?.getAttribute('src') || null)
}

function normalizeText(text) {
  return (text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function deriveDescription(excerptHtml, blocks) {
  const excerptText = normalizeText(JSDOM.fragment(excerptHtml || '').textContent || '')
  const sourceText =
    excerptText ||
    blocks
      .filter((block) => block._type === 'block')
      .map((block) => block.children.map((child) => child.text).join(' '))
      .join(' ')
      .trim()

  if (!sourceText) {
    return null
  }

  if (sourceText.length <= 220) {
    return sourceText
  }

  const truncated = sourceText.slice(0, 220)
  const safeCut = truncated.lastIndexOf(' ')
  return `${truncated.slice(0, safeCut > 140 ? safeCut : 220).trim()}...`
}

function pickEyebrow(categories) {
  const ordered = categories.filter((category) => category.domain === 'category').map((category) => category.value)
  return ordered[0] || null
}

async function uploadImageAssetFromUrl(imageUrl, title, assetCache = new Map()) {
  const normalizedImageUrl = normalizeUrl(imageUrl)
  if (!normalizedImageUrl) {
    return null
  }

  if (assetCache.has(normalizedImageUrl)) {
    return assetCache.get(normalizedImageUrl)
  }

  const response = await fetch(normalizedImageUrl)
  if (!response.ok) {
    throw new Error(`Falha ao baixar imagem ${normalizedImageUrl}: ${response.status}`)
  }

  const url = new URL(normalizedImageUrl)
  const filenameFromUrl = path.basename(url.pathname) || `${sanitizeSlug(title, 'imagem')}.jpg`
  const buffer = Buffer.from(await response.arrayBuffer())
  const asset = await client.assets.upload('image', buffer, {
    filename: filenameFromUrl,
  })

  assetCache.set(normalizedImageUrl, asset)
  return asset
}

async function uploadImageFromUrl(imageUrl, title, assetCache = new Map()) {
  const asset = await uploadImageAssetFromUrl(imageUrl, title, assetCache)
  if (!asset?._id) {
    return null
  }

  return {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: asset._id,
    },
  }
}

function normalizePublishedAt(post) {
  const rawValue = post.postDateGmt || post.postDate
  if (!rawValue) {
    return null
  }

  const iso = rawValue.replace(' ', 'T')
  return `${iso}Z`
}

async function importPosts({ dryRun, limit, offset }) {
  const xml = await readFile(XML_PATH, 'utf8')
  const posts = parseWordPressXml(xml)
    .filter((post) => post.postType === 'post' && post.status === 'publish')
    .slice(offset, offset + limit)

  if (posts.length === 0) {
    console.log('Nenhum post elegivel encontrado no XML.')
    return
  }

  for (const post of posts) {
    const slug = sanitizeSlug(post.postName, sanitizeSlug(post.title, `wordpress-${post.postId}`))
    const imageUrl = extractFirstImageUrl(post.contentHtml)
    const assetCache = new Map()
    const content = await htmlToPortableText(post.contentHtml, {
      uploadImage: dryRun
        ? async ({ imageUrl: inlineImageUrl }) => ({
            asset: {
              _type: 'reference',
              _ref: `dry-run-${sanitizeSlug(path.basename(new URL(inlineImageUrl).pathname), 'image')}`,
            },
          })
        : async ({ imageUrl: inlineImageUrl }) => {
            try {
              const asset = await uploadImageAssetFromUrl(inlineImageUrl, post.title, assetCache)
              return asset?._id
                ? {
                    asset: {
                      _type: 'reference',
                      _ref: asset._id,
                    },
                  }
                : null
            } catch (error) {
              console.warn(`Imagem inline nao importada para "${post.title}": ${error.message}`)
              return null
            }
          },
    })
    const description = deriveDescription(post.excerptHtml, content)
    const eyebrow = pickEyebrow(post.categories)

    const document = {
      _id: `wordpress-post-${post.postId}`,
      _type: 'post',
      title: post.title,
      slug: {
        _type: 'slug',
        current: slug,
      },
      eyebrow,
      description,
      publishedAt: normalizePublishedAt(post),
      content,
    }

    if (dryRun) {
      console.log(
        JSON.stringify(
          {
            title: document.title,
            slug: document.slug.current,
            eyebrow: document.eyebrow,
            publishedAt: document.publishedAt,
            description: document.description,
            imageUrl,
            hasInlineImages: document.content.some((block) => block._type === 'image'),
            contentBlocks: document.content.length,
          },
          null,
          2,
        ),
      )
      continue
    }

    if (imageUrl) {
      try {
        document.mainImage = await uploadImageFromUrl(imageUrl, document.title, assetCache)
      } catch (error) {
        console.warn(`Imagem nao importada para "${document.title}": ${error.message}`)
      }
    }

    await client.createOrReplace(document)

    console.log(
      JSON.stringify(
        {
          imported: true,
          id: document._id,
          title: document.title,
          slug: document.slug.current,
          eyebrow: document.eyebrow,
          hasMainImage: Boolean(document.mainImage),
          hasInlineImages: document.content.some((block) => block._type === 'image'),
          contentBlocks: document.content.length,
        },
        null,
        2,
      ),
    )
  }
}

const options = parseArgs(process.argv.slice(2))

if (!Number.isInteger(options.limit) || options.limit <= 0) {
  throw new Error('Use um valor inteiro positivo em --limit.')
}

if (!Number.isInteger(options.offset) || options.offset < 0) {
  throw new Error('Use um valor inteiro maior ou igual a zero em --offset.')
}

importPosts(options).catch((error) => {
  console.error(error)
  process.exitCode = 1
})
