import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const IMAGE_EXTENSIONS = new Set(['.avif', '.bmp', '.gif', '.ico', '.jpeg', '.jpg', '.png', '.svg', '.webp'])
const UPLOADS_PREFIX = '/wp-content/uploads/'
const OTM_HOSTS = new Set(['otm.com.br', 'www.otm.com.br'])

function argumentValue(argumentsList, name) {
  const index = argumentsList.indexOf(name)
  if (index === -1 || !argumentsList[index + 1]) {
    throw new Error(`Missing required argument: ${name}`)
  }

  return argumentsList[index + 1]
}

function decodeXmlText(value) {
  return value
    .trim()
    .replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function safeFilePath(root, relativePath) {
  const normalized = relativePath.replaceAll('\\', '/')
  const segments = normalized.split('/')
  if (!normalized || segments.some((segment) => !segment || segment === '.' || segment === '..')) {
    throw new Error(`Unsafe upload path: ${relativePath}`)
  }

  const resolvedRoot = resolve(root)
  const candidate = resolve(resolvedRoot, ...segments)
  const pathFromRoot = relative(resolvedRoot, candidate)
  if (isAbsolute(pathFromRoot) || pathFromRoot === '..' || pathFromRoot.startsWith('..\\') || pathFromRoot.startsWith('../')) {
    throw new Error(`Upload path escapes its root: ${relativePath}`)
  }

  return candidate
}

export function extractImageAttachments(xml) {
  const attachments = new Map()
  const attachmentUrlPattern = /<wp:attachment_url(?:\s[^>]*)?>([\s\S]*?)<\/wp:attachment_url>/g

  for (const match of xml.matchAll(attachmentUrlPattern)) {
    const urlText = decodeXmlText(match[1])
    const parsed = new URL(urlText)
    if (!OTM_HOSTS.has(parsed.hostname.toLowerCase()) || !parsed.pathname.startsWith(UPLOADS_PREFIX)) {
      continue
    }

    const path = decodeURIComponent(parsed.pathname.slice(UPLOADS_PREFIX.length))
    const extension = path.slice(path.lastIndexOf('.')).toLowerCase()
    if (!IMAGE_EXTENSIONS.has(extension)) {
      continue
    }

    safeFilePath('.', path)
    attachments.set(path, {
      url: `https://www.otm.com.br${UPLOADS_PREFIX}${path.split('/').map(encodeURIComponent).join('/')}`,
      path,
    })
  }

  return [...attachments.values()].sort((first, second) => first.path.localeCompare(second.path))
}

export async function materializeImageAttachments({ xmlPath, sourceRoot, publicRoot, manifestPath }) {
  const xml = await readFile(xmlPath, 'utf8')
  const attachments = extractImageAttachments(xml)

  for (const attachment of attachments) {
    const sourcePath = safeFilePath(sourceRoot, attachment.path)
    const destinationPath = safeFilePath(publicRoot, attachment.path)
    const sourceStat = await stat(sourcePath)
    if (!sourceStat.isFile()) {
      throw new Error(`Legacy image source is not a file: ${attachment.path}`)
    }

    await mkdir(dirname(destinationPath), { recursive: true })
    await copyFile(sourcePath, destinationPath)
    attachment.bytes = sourceStat.size
  }

  const manifest = {
    source: 'MIDIA.xml wp:attachment_url',
    attachmentCount: attachments.length,
    attachments,
  }
  await mkdir(dirname(resolve(manifestPath)), { recursive: true })
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  return manifest
}

async function main() {
  const xmlPath = argumentValue(process.argv, '--xml')
  const sourceRoot = argumentValue(process.argv, '--source')
  const publicRoot = argumentValue(process.argv, '--public')
  const manifestPath = argumentValue(process.argv, '--manifest')
  const manifest = await materializeImageAttachments({ xmlPath, sourceRoot, publicRoot, manifestPath })
  const bytes = manifest.attachments.reduce((total, attachment) => total + attachment.bytes, 0)
  console.log(JSON.stringify({ attachments: manifest.attachmentCount, bytes }))
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
