import { readFile, realpath, stat } from 'node:fs/promises'
import { isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

function argumentValue(argumentsList, name) {
  const index = argumentsList.indexOf(name)
  if (index === -1 || !argumentsList[index + 1]) {
    throw new Error(`Missing required argument: ${name}`)
  }

  return argumentsList[index + 1]
}

function safeFilePath(root, relativePath) {
  const normalized = relativePath.replaceAll('\\', '/')
  const segments = normalized.split('/')
  if (!normalized || segments.some((segment) => !segment || segment === '.' || segment === '..')) {
    throw new Error(`Unsafe manifest path: ${relativePath}`)
  }

  const resolvedRoot = resolve(root)
  const candidate = resolve(resolvedRoot, ...segments)
  const pathFromRoot = relative(resolvedRoot, candidate)
  if (isAbsolute(pathFromRoot) || pathFromRoot === '..' || pathFromRoot.startsWith('..\\') || pathFromRoot.startsWith('../')) {
    throw new Error(`Manifest path escapes the public directory: ${relativePath}`)
  }

  return candidate
}

function isImage(contents) {
  const text = contents.subarray(0, 256).toString('utf8').trimStart().toLowerCase()
  const svgRoot = text
    .replace(/^<\?xml\s+[^?]*\?>\s*/i, '')
    .replace(/^(?:<!--[\s\S]*?-->\s*)*/i, '')
  return (
    contents.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ||
    (contents[0] === 0xff && contents[1] === 0xd8 && contents[2] === 0xff) ||
    contents.subarray(0, 6).toString('ascii') === 'GIF87a' ||
    contents.subarray(0, 6).toString('ascii') === 'GIF89a' ||
    (contents.subarray(0, 4).toString('ascii') === 'RIFF' && contents.subarray(8, 12).toString('ascii') === 'WEBP') ||
    (contents[0] === 0 && contents[1] === 0 && contents[2] === 1 && contents[3] === 0) ||
    contents.subarray(0, 2).toString('ascii') === 'BM' ||
    (contents.subarray(4, 8).toString('ascii') === 'ftyp' && contents.subarray(8, 12).toString('ascii').toLowerCase().includes('avif')) ||
    /^<svg(?:\s|>)/i.test(svgRoot)
  )
}

export async function verifyLegacyXmlMedia({ manifestPath, publicRoot }) {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  if (!Array.isArray(manifest.attachments) || manifest.attachmentCount !== manifest.attachments.length) {
    throw new Error('Invalid XML legacy media manifest')
  }

  const rootRealPath = await realpath(publicRoot)
  const errors = []
  for (const attachment of manifest.attachments) {
    try {
      const filePath = safeFilePath(publicRoot, attachment.path)
      const fileStat = await stat(filePath)
      if (!fileStat.isFile()) {
        throw new Error(`Legacy XML media is not a file: ${attachment.path}`)
      }
      if (attachment.bytes !== fileStat.size) {
        throw new Error(`Legacy XML media size mismatch: ${attachment.path}`)
      }

      const fileRealPath = await realpath(filePath)
      const pathFromRoot = relative(rootRealPath, fileRealPath)
      if (isAbsolute(pathFromRoot) || pathFromRoot === '..' || pathFromRoot.startsWith('..\\') || pathFromRoot.startsWith('../')) {
        throw new Error(`Legacy XML media escapes public directory: ${attachment.path}`)
      }
      if (!isImage(await readFile(filePath))) {
        throw new Error(`Legacy XML media is not an image: ${attachment.path}`)
      }
    } catch (error) {
      if (error?.code === 'ENOENT') {
        errors.push(`Missing legacy XML media: ${attachment.path}`)
      } else {
        errors.push(error.message)
      }
    }
  }

  if (errors.length) {
    throw new Error(errors.join('\n'))
  }
  return manifest.attachments.length
}

async function main() {
  const verified = await verifyLegacyXmlMedia({
    manifestPath: argumentValue(process.argv, '--manifest'),
    publicRoot: argumentValue(process.argv, '--public'),
  })
  console.log(JSON.stringify({ verified }))
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
