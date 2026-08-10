import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { expect, test } from 'vitest'

const verifier = resolve('scripts/verify-xml-legacy-media.mjs')

test('rejects a manifest image that is absent from the public directory', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'otm-xml-verify-'))
  t.onTestFinished(() => rm(root, { recursive: true, force: true }))
  const manifestPath = join(root, 'manifest.json')
  const publicRoot = join(root, 'public')

  await mkdir(publicRoot)
  await writeFile(manifestPath, JSON.stringify({
    attachmentCount: 1,
    attachments: [{ url: 'https://www.otm.com.br/wp-content/uploads/2020/10/missing.png', path: '2020/10/missing.png', bytes: 1 }],
  }))

  const result = spawnSync(process.execPath, [verifier, '--manifest', manifestPath, '--public', publicRoot], { encoding: 'utf8' })

  expect(result.status).toBe(1)
  expect(result.stderr).toContain('Missing legacy XML media: 2020/10/missing.png')
})

test('rejects XML that is not an SVG image', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'otm-xml-verify-'))
  t.onTestFinished(() => rm(root, { recursive: true, force: true }))
  const manifestPath = join(root, 'manifest.json')
  const publicRoot = join(root, 'public')
  const relativePath = '2020/10/not-an-image.svg'
  const contents = '<?xml version="1.0"?><html><body>not an image</body></html>'
  const imagePath = join(publicRoot, relativePath)

  await mkdir(dirname(imagePath), { recursive: true })
  await writeFile(imagePath, contents)
  await writeFile(manifestPath, JSON.stringify({
    attachmentCount: 1,
    attachments: [{ url: 'https://www.otm.com.br/wp-content/uploads/2020/10/not-an-image.svg', path: relativePath, bytes: Buffer.byteLength(contents) }],
  }))

  const result = spawnSync(process.execPath, [verifier, '--manifest', manifestPath, '--public', publicRoot], { encoding: 'utf8' })

  expect(result.status).toBe(1)
  expect(result.stderr).toContain(`Legacy XML media is not an image: ${relativePath}`)
})
