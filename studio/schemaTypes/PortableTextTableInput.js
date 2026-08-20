import { parseTableFromDocument } from './portableTextTablePaste'

export function PortableTextTableInput(props) {
  return props.renderDefault({
    ...props,
    onPaste: (data) => {
      const html = data.event.clipboardData?.getData('text/html')

      if (html && typeof DOMParser !== 'undefined') {
        const document = new DOMParser().parseFromString(html, 'text/html')
        const table = parseTableFromDocument(document)

        if (table) {
          return { insert: [table] }
        }
      }

      return props.onPaste?.(data)
    },
  })
}
