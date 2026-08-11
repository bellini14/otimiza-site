import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'vitest'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const emailTemplateImagePaths = [
  'wp-content/uploads/2020/10/logo-otimiza-email.png',
  'wp-content/uploads/2020/10/inspire-logo.png',
  'wp-content/uploads/2020/10/instagram.png',
  'wp-content/uploads/2020/10/linkedin.png',
  'wp-content/uploads/2020/10/Screenshot_10.png',
  'wp-content/uploads/2020/10/O-Ego-e-seu-inimigo-819x1024.png',
  'wp-content/uploads/2020/10/batalha-das-correntesd-819x1024.png',
  'wp-content/uploads/2025/05/capa-case.png',
  'wp-content/uploads/2026/05/ChatGPT-Image-27-de-mai.-de-2026-12_02_07-1024x768.png',
  'wp-content/uploads/2026/05/WhatsApp-Image-2026-05-13-at-09.43.56.jpeg',
  'wp-content/uploads/2020/10/ChatGPT-Image-27-de-abr.-de-2026-12_09_42-1024x576.png',
  'wp-content/uploads/2026/04/ChatGPT-Image-9-de-abr.-de-2026-13_28_57-1024x683.png',
]

test('ships every image referenced by the Inspire email template', () => {
  for (const mediaPath of emailTemplateImagePaths) {
    const fullPath = path.join(projectRoot, 'public', mediaPath)
    assert.match(mediaPath, /\.(?:png|jpe?g|gif|webp)$/i)
    assert.ok(fs.existsSync(fullPath), `missing email template media: /${mediaPath}`)
    assert.ok(fs.statSync(fullPath).size > 0, `empty email template media: /${mediaPath}`)
  }
})
