import { describe, expect, it } from 'vitest'
import { schemaTypes } from './index'

describe('postType', () => {
  it('allows inline images inside post content with editorial metadata', () => {
    const postType = schemaTypes.find((schemaType) => schemaType.name === 'post')

    expect(postType).toBeDefined()
    expect(postType.title).toBe('Post')

    const fieldsByName = Object.fromEntries(postType.fields.map((field) => [field.name, field]))
    const contentField = fieldsByName.content

    expect(contentField.type).toBe('array')
    expect(contentField.of).toHaveLength(2)
    expect(contentField.of.map((entry) => entry.type)).toEqual(['block', 'image'])

    const imageField = contentField.of.find((entry) => entry.type === 'image')

    expect(imageField.options.hotspot).toBe(true)
    expect(imageField.fields.map((field) => field.name)).toEqual(['alt', 'caption'])
    expect(imageField.fields.find((field) => field.name === 'alt').type).toBe('string')
    expect(imageField.fields.find((field) => field.name === 'caption').type).toBe('string')
  })
})
