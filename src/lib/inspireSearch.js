const DIACRITIC_MARKS_PATTERN = /\p{Diacritic}/gu
const ACCENTABLE_CHARACTER_PATTERN = /[aeiouc]/g
const REPEATED_WILDCARDS_PATTERN = /\*+/g
const NON_SEARCH_CHARACTER_PATTERN = /[^\p{Letter}\p{Number}]+/gu

export function normalizeInspireSearchText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(DIACRITIC_MARKS_PATTERN, '')
    .toLocaleLowerCase('pt-BR')
    .replace(NON_SEARCH_CHARACTER_PATTERN, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export function buildInspireSearchPattern(value = '') {
  return normalizeInspireSearchText(value)
    .replace(ACCENTABLE_CHARACTER_PATTERN, '*')
    .replace(REPEATED_WILDCARDS_PATTERN, '*')
}

export function buildInspireBroadPattern(value = '') {
  return normalizeInspireSearchText(value)
    .split(' ')
    .filter(Boolean)
    .map((term) => {
      const anchors = [...term].filter((character) => !/[aeiouc]/.test(character)).slice(0, 3)

      if (anchors.length === 0) return '*'

      const leadingWildcard = term.startsWith(anchors[0]) ? '' : '*'
      return `${leadingWildcard}${anchors.join('*')}*`
    })
    .join(' ')
}

function getWordVariants(word) {
  const variants = new Set([word])

  if (word.length > 4 && word.endsWith('s')) {
    variants.add(word.slice(0, -1))
  }

  if (word.endsWith('oes')) {
    variants.add(`${word.slice(0, -3)}ao`)
  }

  return [...variants]
}

function getEditDistance(firstValue, secondValue) {
  const previousRow = Array.from({ length: secondValue.length + 1 }, (_, index) => index)

  for (let firstIndex = 1; firstIndex <= firstValue.length; firstIndex += 1) {
    const currentRow = [firstIndex]

    for (let secondIndex = 1; secondIndex <= secondValue.length; secondIndex += 1) {
      const substitutionCost = firstValue[firstIndex - 1] === secondValue[secondIndex - 1] ? 0 : 1
      currentRow[secondIndex] = Math.min(
        currentRow[secondIndex - 1] + 1,
        previousRow[secondIndex] + 1,
        previousRow[secondIndex - 1] + substitutionCost,
      )
    }

    previousRow.splice(0, previousRow.length, ...currentRow)
  }

  return previousRow[secondValue.length]
}

function getApproximateWordScore(queryWord, candidateWord) {
  let bestDistance = Number.POSITIVE_INFINITY

  for (const queryVariant of getWordVariants(queryWord)) {
    for (const candidateVariant of getWordVariants(candidateWord)) {
      if (queryVariant === candidateVariant) return 0
      if (candidateVariant.startsWith(queryVariant) && queryVariant.length >= 3) return 0.25

      bestDistance = Math.min(bestDistance, getEditDistance(queryVariant, candidateVariant))
    }
  }

  const longestLength = Math.max(queryWord.length, candidateWord.length)
  const allowedDistance = longestLength <= 3 ? 0 : longestLength <= 5 ? 1 : 2
  return bestDistance <= allowedDistance ? bestDistance : null
}

function getInspireSearchScore(post, query) {
  const normalizedQuery = normalizeInspireSearchText(query)

  if (!normalizedQuery) return 0

  const queryTerms = normalizedQuery.split(' ')
  const searchableFields = [post?.title, post?.description, post?.eyebrow]
    .filter(Boolean)
    .map(normalizeInspireSearchText)

  let bestScore = Number.POSITIVE_INFINITY

  searchableFields.forEach((field, fieldIndex) => {
    if (field.includes(normalizedQuery)) {
      bestScore = Math.min(bestScore, fieldIndex)
      return
    }

    const fieldWords = field.split(' ')
    let fieldScore = fieldIndex

    for (const queryTerm of queryTerms) {
      const wordScores = fieldWords
        .map((fieldWord) => getApproximateWordScore(queryTerm, fieldWord))
        .filter((score) => score !== null)

      if (wordScores.length === 0) return
      fieldScore += Math.min(...wordScores) * 10
    }

    bestScore = Math.min(bestScore, fieldScore)
  })

  return Number.isFinite(bestScore) ? bestScore : null
}

export function matchesInspireSearch(post, query) {
  return getInspireSearchScore(post, query) !== null
}

export function rankInspireSearchResults(posts, query) {
  return (posts || [])
    .map((post, index) => ({ index, post, score: getInspireSearchScore(post, query) }))
    .filter(({ score }) => score !== null)
    .sort((first, second) => first.score - second.score || first.index - second.index)
    .map(({ post }) => post)
}
