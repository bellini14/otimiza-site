const KEY = 'silvana-memorial:ownership'

export function readMemorialOwnership(storage = window.localStorage) {
  try {
    const value = JSON.parse(storage.getItem(KEY))
    return value?.noteId && value?.receipt
      ? { noteId: value.noteId, receipt: value.receipt }
      : null
  } catch {
    return null
  }
}

export function writeMemorialOwnership(value, storage = window.localStorage) {
  storage.setItem(KEY, JSON.stringify({ noteId: value.noteId, receipt: value.receipt }))
}

export function clearMemorialOwnership(storage = window.localStorage) {
  storage.removeItem(KEY)
}
