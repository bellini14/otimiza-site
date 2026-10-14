import { describe, expect, it, vi } from 'vitest'
import { postType } from './post'

describe('post publication requirements', () => {
  it.each(['mainImage', 'publishedAt'])('requires %s for publication', (field) => {
    const requiredRule = { required: vi.fn(() => 'required-rule') }
    expect(postType.fields.find(({ name }) => name === field).validation(requiredRule)).toBe('required-rule')
    expect(requiredRule.required).toHaveBeenCalledOnce()
  })
})
