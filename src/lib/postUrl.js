const ISO_DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})/
export function buildWordPressPostPath({ publishedAt, slug }) {
  const dateMatch = publishedAt?.match(ISO_DATE_PREFIX)
  if (!dateMatch || !slug) return `/inspire/${slug ?? ''}`
  const [, year, month, day] = dateMatch
  return `/${year}/${month}/${day}/${slug}`
}
export function isWordPressPostPath(pathname = '') {
  return /^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/?$/.test(pathname)
}
