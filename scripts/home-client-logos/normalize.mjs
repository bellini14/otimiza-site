import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { homeClientLogos } from './manifest.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
export const normalizedDirectory = path.join(scriptDirectory, 'normalized')
const contactSheetPath = path.join(scriptDirectory, 'normalized-contact-sheet.png')
const sanityManifestPath = path.join(scriptDirectory, 'sanity-manifest.json')
const darkNeutral = { r: 36, g: 43, b: 51 }

function removeWhiteBackground(data, info) {
  const corners = [
    0,
    (info.width - 1) * info.channels,
    (info.height - 1) * info.width * info.channels,
    ((info.height * info.width) - 1) * info.channels,
  ]
  const hasOpaqueWhiteCorners = corners.every((offset) => (
    data[offset] >= 242
    && data[offset + 1] >= 242
    && data[offset + 2] >= 242
    && data[offset + 3] >= 240
  ))

  if (!hasOpaqueWhiteCorners) return data

  for (let index = 0; index < data.length; index += 4) {
    const r = data[index]
    const g = data[index + 1]
    const b = data[index + 2]
    const originalAlpha = data[index + 3] / 255
    const whiteContribution = Math.min(r, g, b) / 255
    const alpha = (1 - whiteContribution) * originalAlpha

    if (alpha <= 0.02) {
      data[index + 3] = 0
      continue
    }

    data[index] = Math.round((r / 255 - whiteContribution) / (1 - whiteContribution) * 255)
    data[index + 1] = Math.round((g / 255 - whiteContribution) / (1 - whiteContribution) * 255)
    data[index + 2] = Math.round((b / 255 - whiteContribution) / (1 - whiteContribution) * 255)
    data[index + 3] = Math.round(alpha * 255)
  }

  return data
}

function recolorNearWhite(data) {
  for (let index = 0; index < data.length; index += 4) {
    if (
      data[index + 3] > 8
      && data[index] >= 225
      && data[index + 1] >= 225
      && data[index + 2] >= 225
    ) {
      data[index] = darkNeutral.r
      data[index + 1] = darkNeutral.g
      data[index + 2] = darkNeutral.b
    }
  }
  return data
}

async function normalizeLogo(logo) {
  const input = sharp(logo.sourcePath, { density: 360 })
  const { data, info } = await input.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const pixels = removeWhiteBackground(data, info)
  if (logo.recolorWhite) recolorNearWhite(pixels)

  const trimmed = sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 })

  const { data: trimmedPixels, info: trimmedInfo } = await trimmed
    .raw()
    .toBuffer({ resolveWithObject: true })
  const paddingX = Math.max(2, Math.round(trimmedInfo.width * 0.08))
  const paddingY = Math.max(2, Math.round(trimmedInfo.height * 0.08))
  const paddedWidth = trimmedInfo.width + paddingX * 2
  const paddedHeight = trimmedInfo.height + paddingY * 2
  const scale = Math.min(1, 1196 / Math.max(paddedWidth, paddedHeight))
  const outputPaddingX = Math.max(1, Math.round(paddingX * scale))
  const outputPaddingY = Math.max(1, Math.round(paddingY * scale))

  await fs.mkdir(normalizedDirectory, { recursive: true })
  await sharp(trimmedPixels, {
    raw: { width: trimmedInfo.width, height: trimmedInfo.height, channels: 4 },
  })
    .resize({
      width: Math.max(1, Math.round(trimmedInfo.width * scale)),
      height: Math.max(1, Math.round(trimmedInfo.height * scale)),
      fit: 'fill',
    })
    .extend({
      top: outputPaddingY,
      bottom: outputPaddingY,
      left: outputPaddingX,
      right: outputPaddingX,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, palette: false })
    .toFile(path.join(normalizedDirectory, logo.outputFile))
}

async function createContactSheet() {
  const cellWidth = 420
  const cellHeight = 180
  const columns = 3
  const rows = Math.ceil(homeClientLogos.length / columns)
  const composites = []

  for (const [index, logo] of homeClientLogos.entries()) {
    const renderedLogo = await sharp(path.join(normalizedDirectory, logo.outputFile))
      .resize({ width: 300, height: 90, fit: 'inside', withoutEnlargement: true })
      .png()
      .toBuffer()
    const label = Buffer.from(
      `<svg width="${cellWidth}" height="36"><text x="16" y="25" font-family="Arial" font-size="15" fill="#27313b">${index + 1}. ${logo.logoAlt.replaceAll('&', '&amp;')}</text></svg>`,
    )
    const left = (index % columns) * cellWidth
    const top = Math.floor(index / columns) * cellHeight
    composites.push({ input: renderedLogo, left: left + 60, top: top + 24 })
    composites.push({ input: label, left, top: top + 126 })
  }

  await sharp({
    create: {
      width: columns * cellWidth,
      height: rows * cellHeight,
      channels: 4,
      background: { r: 244, g: 246, b: 248, alpha: 1 },
    },
  }).composite(composites).png().toFile(contactSheetPath)
}

export async function normalizeAllLogos() {
  await fs.mkdir(normalizedDirectory, { recursive: true })
  await Promise.all(homeClientLogos.map(normalizeLogo))
  await createContactSheet()
  await fs.writeFile(
    sanityManifestPath,
    `${JSON.stringify(homeClientLogos.map(({ sourcePath: _sourcePath, ...logo }) => logo), null, 2)}\n`,
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await normalizeAllLogos()
  console.log(`Normalized ${homeClientLogos.length} logos into ${normalizedDirectory}`)
  console.log(`Contact sheet: ${contactSheetPath}`)
}
