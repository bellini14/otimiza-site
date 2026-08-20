import { JSDOM } from 'jsdom'
import { describe, expect, it, vi } from 'vitest'
import { PortableTextTableInput } from './PortableTextTableInput'
import { parseTableFromDocument } from './portableTextTablePaste'

describe('parseTableFromDocument', () => {
  it('converts the first HTML table into a Sanity table value', () => {
    const document = new JSDOM(`
      <table>
        <thead><tr><th> Produto </th><th> Preço </th></tr></thead>
        <tbody>
          <tr><td> Plano <strong>Essencial</strong> </td><td> R$ 99 </td></tr>
          <tr></tr>
        </tbody>
      </table>
      <table><tr><td>Ignorada</td></tr></table>
    `).window.document

    expect(parseTableFromDocument(document)).toEqual({
      _type: 'table',
      rows: [
        { _type: 'tableRow', cells: ['Produto', 'Preço'] },
        { _type: 'tableRow', cells: ['Plano Essencial', 'R$ 99'] },
      ],
    })
  })

  it('returns undefined when the HTML does not contain a table', () => {
    const document = new JSDOM('<p>Conteúdo comum</p>').window.document

    expect(parseTableFromDocument(document)).toBeUndefined()
  })

  it('reads table HTML from the real PasteData event shape', () => {
    const inputProps = {
      renderDefault: vi.fn(),
    }
    const pasteData = {
      event: {
        clipboardData: {
          getData: vi.fn(() => '<table><tr><td>Colado</td></tr></table>'),
        },
      },
    }
    const originalDOMParser = globalThis.DOMParser

    globalThis.DOMParser = new JSDOM('').window.DOMParser
    PortableTextTableInput(inputProps)
    const renderedInputProps = inputProps.renderDefault.mock.calls[0][0]
    const result = renderedInputProps.onPaste(pasteData)
    globalThis.DOMParser = originalDOMParser

    expect(result).toEqual({
      insert: [{ _type: 'table', rows: [{ _type: 'tableRow', cells: ['Colado'] }] }],
    })
  })
})
