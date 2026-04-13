/**
 * Pure helper functions for filtering, sorting, and deriving
 * filter options from the list of blog posts.
 */

/**
 * Normalise an eyebrow string for stable matching.
 * @param {string|null|undefined} eyebrow
 * @returns {string}
 */
export function normalizeCategory(eyebrow) {
  if (!eyebrow || typeof eyebrow !== 'string' || eyebrow.trim() === '') {
    return ''
  }
  return eyebrow.trim().toLowerCase()
}

/**
 * Derive unique month/year options from post dates, newest first.
 * Each option is { key: 'YYYY-MM', label: 'Abr 2026' }.
 * @param {Array} posts
 * @returns {Array<{ key: string, label: string }>}
 */
export function deriveMonthOptions(posts) {
  const seen = new Map()

  for (const post of posts) {
    if (!post.publishedAt) continue
    const d = new Date(post.publishedAt)
    if (Number.isNaN(d.getTime())) continue

    const year = d.getUTCFullYear()
    const month = d.getUTCMonth() // 0-based
    const key = `${year}-${String(month + 1).padStart(2, '0')}`

    if (!seen.has(key)) {
      const label = d
        .toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' })
        .replace('.', '')
        // Capitalise first letter
        .replace(/^./, (c) => c.toUpperCase())
      seen.set(key, { key, label, _sort: year * 100 + month })
    }
  }

  return [...seen.values()].sort((a, b) => b._sort - a._sort)
}

/**
 * Derive unique category options from posts.
 * Returns { normalized, label } pairs, sorted alphabetically.
 * Posts without an eyebrow produce the "Sem categoria" entry.
 * @param {Array} posts
 * @returns {Array<{ normalized: string, label: string }>}
 */
export function deriveCategoryOptions(posts) {
  const map = new Map()
  let hasUncategorized = false

  for (const post of posts) {
    const norm = normalizeCategory(post.eyebrow)
    if (norm === '') {
      hasUncategorized = true
    } else if (!map.has(norm)) {
      map.set(norm, post.eyebrow.trim())
    }
  }

  const options = [...map.entries()]
    .map(([normalized, label]) => ({ normalized, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))

  if (hasUncategorized) {
    options.push({ normalized: '', label: 'Sem categoria' })
  }

  return options
}

/**
 * Sort posts by publishedAt desc. Posts without a date sort last.
 * @param {Array} posts
 * @returns {Array}
 */
export function sortByDate(posts) {
  return [...posts].sort((a, b) => {
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : -Infinity
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : -Infinity
    return db - da
  })
}

/**
 * Filter posts by active month key and active categories.
 *
 * @param {Array} posts – full sorted list
 * @param {string|null} activeMonth – 'YYYY-MM' or null for all
 * @param {Set<string>} activeCategories – set of normalised category strings
 * @returns {Array}
 */
export function filterPosts(posts, activeMonth, activeCategories) {
  return posts.filter((post) => {
    // Month filter
    if (activeMonth) {
      if (!post.publishedAt) return false
      const d = new Date(post.publishedAt)
      if (Number.isNaN(d.getTime())) return false
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
      if (key !== activeMonth) return false
    }

    // Category filter (OR when multiple are selected)
    if (activeCategories.size > 0) {
      const norm = normalizeCategory(post.eyebrow)
      if (!activeCategories.has(norm)) return false
    }

    return true
  })
}

/**
 * Split the filtered list into featured posts and grid posts.
 *
 * Featured slots prefer dated posts. Un-dated posts only fill featured
 * slots when no dated filtered posts exist.
 *
 * @param {Array} filtered – already filtered & sorted list
 * @returns {{ featured: Array, grid: Array }}
 */
export function splitFeaturedAndGrid(filtered) {
  const dated = filtered.filter((p) => !!p.publishedAt)
  const undated = filtered.filter((p) => !p.publishedAt)

  let featured
  let rest

  if (dated.length >= 4) {
    featured = dated.slice(0, 4)
    rest = [...dated.slice(4), ...undated]
  } else if (dated.length > 0) {
    featured = dated.slice(0, 4)
    rest = undated
  } else {
    // Only undated posts (or no posts at all)
    featured = undated.slice(0, 4)
    rest = undated.slice(4)
  }

  return { featured, grid: rest }
}
