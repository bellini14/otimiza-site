import { JSDOM } from 'jsdom'

function createKey(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function normalizeUrl(rawUrl) {
  if (!rawUrl) {
    return null
  }

  try {
    const url = new URL(rawUrl, 'https://www.otm.com.br')
    if (url.protocol === 'http:') {
      url.protocol = 'https:'
    }
    if (url.hostname === 'otm.com.br') {
      url.hostname = 'www.otm.com.br'
    }
    url.pathname = url.pathname.replace(/\/{2,}/g, '/')
    return url.toString()
  } catch {
    return null
  }
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

function createSpan(text) {
  return {
    _type: 'span',
    _key: createKey('span'),
    text,
    marks: [],
  }
}

function createBlock(text, options = {}) {
  const normalized = normalizeText(text)
  if (!normalized) {
    return null
  }

  return {
    _type: 'block',
    _key: createKey('block'),
    style: options.style || 'normal',
    markDefs: [],
    children: [createSpan(normalized)],
    ...(options.listItem ? { listItem: options.listItem } : {}),
    ...(options.level ? { level: options.level } : {}),
  }
}

function textToParagraphBlocks(text) {
  return normalizeText(text)
    .split(/\n\s*\n/g)
    .map((chunk) => createBlock(chunk))
    .filter(Boolean)
}

async function createImageBlock(node, uploadImage) {
  if (typeof uploadImage !== 'function') {
    return null
  }

  const imageUrl = normalizeUrl(node.getAttribute('src'))
  if (!imageUrl) {
    return null
  }

  const alt = normalizeText(node.getAttribute('alt') || '') || null
  const caption = normalizeText(node.getAttribute('title') || '') || null
  const uploadedImage = await uploadImage({ imageUrl, alt, caption })

  if (!uploadedImage?.asset?._ref) {
    return null
  }

  return {
    _type: 'image',
    _key: createKey('image'),
    asset: uploadedImage.asset,
    ...(alt ? { alt } : {}),
    ...(caption ? { caption } : {}),
  }
}

function textWithoutImages(node) {
  const clone = node.cloneNode(true)
  clone.querySelectorAll?.('img').forEach((image) => image.remove())
  return normalizeText(clone.textContent || '')
}

async function pushNode(node, blocks, uploadImage) {
  if (!node) {
    return
  }

  if (node.nodeType === 3) {
    blocks.push(...textToParagraphBlocks(node.textContent || ''))
    return
  }

  if (node.nodeType !== 1) {
    return
  }

  const tagName = node.tagName.toLowerCase()

  if (['script', 'style', 'iframe', 'noscript', 'svg', 'object', 'embed'].includes(tagName)) {
    return
  }

  if (tagName === 'img') {
    const imageBlock = await createImageBlock(node, uploadImage)
    if (imageBlock) {
      blocks.push(imageBlock)
    }
    return
  }

  if (/^h[1-6]$/.test(tagName)) {
    const headingBlock = createBlock(textWithoutImages(node), { style: tagName })
    if (headingBlock) {
      blocks.push(headingBlock)
    }
    return
  }

  if (tagName === 'blockquote') {
    const quoteBlock = createBlock(textWithoutImages(node), { style: 'blockquote' })
    if (quoteBlock) {
      blocks.push(quoteBlock)
    }
    return
  }

  if (tagName === 'ul' || tagName === 'ol') {
    const listItem = tagName === 'ol' ? 'number' : 'bullet'
    node.querySelectorAll(':scope > li').forEach((item) => {
      const block = createBlock(textWithoutImages(item), { listItem, level: 1 })
      if (block) {
        blocks.push(block)
      }
    })
    return
  }

  if (tagName === 'br') {
    return
  }

  const hasImageDescendant = Boolean(node.querySelector('img'))
  const isBlockContainer = ['p', 'div', 'section', 'article', 'figure', 'figcaption', 'a'].includes(tagName)

  if (isBlockContainer && !hasImageDescendant) {
    const block = createBlock(node.textContent || '')
    if (block) {
      blocks.push(block)
    }
    return
  }

  for (const childNode of node.childNodes) {
    await pushNode(childNode, blocks, uploadImage)
  }
}

export async function htmlToPortableText(html, { uploadImage } = {}) {
  if (!html) {
    return []
  }

  const fragment = JSDOM.fragment(html)
  const blocks = []

  for (const node of fragment.childNodes) {
    await pushNode(node, blocks, uploadImage)
  }

  const dedupedBlocks = []
  let lastSignature = null

  blocks.forEach((block) => {
    const signature =
      block._type === 'image'
        ? `image:${block.asset?._ref ?? ''}`
        : `${block._type}:${block.children?.map((child) => child.text).join('') ?? ''}`

    if (signature && signature !== lastSignature) {
      dedupedBlocks.push(block)
      lastSignature = signature
    }
  })

  return dedupedBlocks
}
