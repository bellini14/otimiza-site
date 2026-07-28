import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-03-21' })
const isDryRun = process.argv.includes('--dry-run')
const isVerifyOnly = process.argv.includes('--verify-only')
const scriptDirectory = path.dirname(path.resolve(process.argv[1]))
const repositoryRoot = path.resolve(scriptDirectory, '../..')
const resultPath = path.join(repositoryRoot, 'scripts/home-client-logos/sanity-result.json')
const manifestPath = path.join(repositoryRoot, 'scripts/home-client-logos/sanity-manifest.json')
const homeClientLogos = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

function normalize(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function assertPublishedRecords(records) {
  if (records.length !== homeClientLogos.length) {
    throw new Error(`Expected 27 home logos, found ${records.length}`)
  }

  const ids = new Set(records.map(({ _id }) => _id))
  const brands = new Set(records.map(({ logoAlt, name }) => normalize(logoAlt || name)))
  if (ids.size !== 27 || brands.size !== 27) {
    throw new Error('Published home logos contain duplicate IDs or public-brand names')
  }

  homeClientLogos.forEach((expected, index) => {
    const actual = records[index]
    const mismatches = [
      actual.name !== expected.name && `name=${actual.name}`,
      actual.logoAlt !== expected.logoAlt && `logoAlt=${actual.logoAlt}`,
      actual.sector !== expected.sector && `sector=${actual.sector}`,
      actual.sortOrder !== expected.sortOrder && `sortOrder=${actual.sortOrder}`,
      !actual.assetId && 'asset missing',
    ].filter(Boolean)

    if (mismatches.length > 0) {
      throw new Error(`${expected.name}: ${mismatches.join(', ')}`)
    }
  })
}

async function fetchPublishedRecords() {
  return client.fetch(`*[
    _type == "clientLogo"
    && isVisible != false
    && showOnHome == true
    && defined(logo.asset)
  ] | order(sortOrder asc) {
    _id,
    name,
    logoAlt,
    sector,
    sortOrder,
    "assetId": logo.asset->_id,
    "logoUrl": logo.asset->url
  }`)
}

async function main() {
  if (isVerifyOnly) {
    const published = await fetchPublishedRecords()
    assertPublishedRecords(published)
    fs.writeFileSync(resultPath, `${JSON.stringify(published, null, 2)}\n`)
    console.log(`Verified ${published.length} published home logos`)
    return
  }

  const existingDocuments = await client.fetch(`*[_type == "clientLogo"] {
    _id,
    name,
    logoAlt,
    website,
    showOnHome
  }`)
  const claimedDocumentIds = new Set()
  const resolutions = homeClientLogos.map((logo) => {
    const aliases = new Set(logo.aliases.map(normalize))
    const matches = existingDocuments.filter((document) => (
      aliases.has(normalize(document.name)) || aliases.has(normalize(document.logoAlt))
    ))

    if (matches.length > 1) {
      throw new Error(`${logo.name} matched multiple documents: ${matches.map(({ _id }) => _id).join(', ')}`)
    }

    const documentId = matches[0]?._id || logo.id
    if (claimedDocumentIds.has(documentId)) {
      throw new Error(`Document ${documentId} matched more than one approved brand`)
    }
    claimedDocumentIds.add(documentId)

    return {
      logo,
      documentId,
      existingWebsite: matches[0]?.website || null,
      matchedName: matches[0]?.name || null,
    }
  })

  console.table(resolutions.map(({ logo, documentId, matchedName }) => ({
    order: logo.sortOrder,
    name: logo.name,
    documentId,
    reuse: matchedName || 'new',
  })))

  const disableIds = existingDocuments
    .filter(({ _id }) => !claimedDocumentIds.has(_id))
    .map(({ _id }) => _id)

  if (isDryRun) {
    console.log(`Dry run: ${resolutions.length} approved records; ${disableIds.length} other home flags will be disabled`)
    return
  }

  for (const { logo, documentId, existingWebsite } of resolutions) {
    const normalizedPath = path.join(
      repositoryRoot,
      'scripts/home-client-logos/normalized',
      logo.outputFile,
    )
    const asset = await client.assets.upload('image', fs.createReadStream(normalizedPath), {
      filename: logo.outputFile,
      title: `Logo ${logo.logoAlt} — home`,
    })

    await client.createIfNotExists({
      _id: documentId,
      _type: 'clientLogo',
      name: logo.name,
      sector: logo.sector,
      logo: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
      },
    })
    await client.patch(documentId).set({
      name: logo.name,
      sector: logo.sector,
      logoAlt: logo.logoAlt,
      website: existingWebsite || logo.website,
      sortOrder: logo.sortOrder,
      isVisible: true,
      showOnHome: true,
      logo: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
      },
    }).commit()
  }

  for (const documentId of disableIds) {
    await client.patch(documentId).set({ showOnHome: false }).commit()
  }

  const published = await fetchPublishedRecords()
  assertPublishedRecords(published)
  fs.writeFileSync(resultPath, `${JSON.stringify(published, null, 2)}\n`)
  console.log(`Published and verified ${published.length} home logos`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
