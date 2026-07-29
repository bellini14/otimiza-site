import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearMemorialOwnership,
  readMemorialOwnership,
  writeMemorialOwnership,
} from './memorialOwnership.js'

describe('memorial ownership', () => {
  beforeEach(() => localStorage.clear())
  it('stores only note id and opaque receipt', () => {
    writeMemorialOwnership({ noteId: 'one', receipt: 'one.secret' })
    expect(readMemorialOwnership()).toEqual({ noteId: 'one', receipt: 'one.secret' })
    expect(localStorage.getItem('silvana-memorial:ownership')).not.toContain('@')
    clearMemorialOwnership()
    expect(readMemorialOwnership()).toBeNull()
  })
})
