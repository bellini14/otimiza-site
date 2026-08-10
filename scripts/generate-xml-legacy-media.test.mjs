import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { expect, test } from 'vitest'

const generator = resolve('scripts/generate-xml-legacy-media.mjs')

test('materializes only image attachment URLs from a WordPress XML export', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'otm-xml-media-'))
  t.onTestFinished(() => rm(root, { recursive: true, force: true }))

  const sourceRoot = join(root, 'source')
  const publicRoot = join(root, 'public')
  const manifestPath = join(root, 'manifest.json')
  const xmlPath = join(root, 'media.xml')
  const firstImage = '2020/10/legacy-image.png'
  const secondImage = 'revslider/slider-1/slide.jpg'

  for (const [relativePath, contents] of [[firstImage, 'first'], [secondImage, 'second']]) {
    const target = join(sourceRoot, relativePath)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, contents)
  }

  await writeFile(xmlPath, `<?xml version="1.0" encoding="UTF-8"?>
    <rss xmlns:wp="http://wordpress.org/export/1.2/"><channel>
      <item><wp:attachment_url><![CDATA[https://www.otm.com.br/wp-content/uploads/${firstImage}]]></wp:attachment_url></item>
      <item><wp:attachment_url>https://www.otm.com.br/wp-content/uploads/${secondImage}</wp:attachment_url></item>
      <item><wp:attachment_url><![CDATA[https://www.otm.com.br/wp-content/uploads/2020/10/audio.mp3]]></wp:attachment_url></item>
    </channel></rss>`)

  const result = spawnSync(process.execPath, [generator, '--xml', xmlPath, '--source', sourceRoot, '--public', publicRoot, '--manifest', manifestPath], { encoding: 'utf8' })

  expect(result.status, result.stderr).toBe(0)
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  expect(manifest.attachments.map(({ path }) => path)).toEqual([firstImage, secondImage])
  expect(await readFile(join(publicRoot, firstImage), 'utf8')).toBe('first')
  expect(await readFile(join(publicRoot, secondImage), 'utf8')).toBe('second')
  await expect(readFile(join(publicRoot, '2020/10/audio.mp3'))).rejects.toThrow()
})
