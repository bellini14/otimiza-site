import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { legacyImageManifest } from '../src/data/legacyImageManifest.js'

export function isSafeManifestPath(candidate) {
  const prefix = 'wp-content/uploads/'
  if (typeof candidate !== 'string' || !candidate.startsWith(prefix)) return false
  const relativePath = candidate.slice(prefix.length)
  return relativePath.length > 0
    && !relativePath.includes('\\')
    && !relativePath.includes(':')
    && relativePath.split('/').every((segment) => segment !== '' && segment !== '.' && segment !== '..')
}

export async function validateLegacyMedia(manifest, { publicRoot, fileSystem = fs }) {
  const root = publicRoot instanceof URL ? fileURLToPath(publicRoot) : path.resolve(publicRoot)
  const realRoot = await fileSystem.realpath(root)
  const errors = []

  for (const assetId of Object.keys(manifest).sort()) {
    const legacyPath = manifest[assetId]
    if (!isSafeManifestPath(legacyPath)) {
      errors.push({ assetId, path: legacyPath, reason: 'unsafe path' })
      continue
    }

    const target = path.resolve(root, ...legacyPath.split('/'))
    const relative = path.relative(root, target)
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      errors.push({ assetId, path: legacyPath, reason: 'unsafe path' })
      continue
    }

    try {
      const realTarget = await fileSystem.realpath(target)
      const realRelative = path.relative(realRoot, realTarget)
      if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) {
        errors.push({ assetId, path: legacyPath, reason: 'symlink escape' })
        continue
      }

      const stats = await fileSystem.stat(realTarget)
      if (!stats.isFile()) errors.push({ assetId, path: legacyPath, reason: 'not a file' })
    } catch (error) {
      if (error.code === 'ENOENT') errors.push({ assetId, path: legacyPath, reason: 'file does not exist' })
      else throw error
    }
  }

  return { valid: errors.length === 0, errors }
}

async function main() {
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const result = await validateLegacyMedia(legacyImageManifest, {
    publicRoot: path.join(repositoryRoot, 'public'),
  })
  if (!result.valid) {
    for (const error of result.errors) console.error(`${error.assetId}: ${error.reason} (${error.path})`)
    process.exitCode = 1
    return
  }
  console.log(`Verified ${Object.keys(legacyImageManifest).length} legacy media files.`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
