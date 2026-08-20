export function parseTableFromDocument(document) {
  const table = document.querySelector('table')

  if (!table) {
    return undefined
  }

  const rows = Array.from(table.querySelectorAll('tr'))
    .map((row) => {
      const cells = Array.from(row.children)
        .filter((cell) => cell.tagName === 'TD' || cell.tagName === 'TH')
        .map((cell) => cell.textContent.trim())

      return cells.length > 0 ? { _type: 'tableRow', cells } : undefined
    })
    .filter(Boolean)

  return rows.length > 0 ? { _type: 'table', rows } : undefined
}
