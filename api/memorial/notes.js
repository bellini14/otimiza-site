import { sendMemorialError } from '../_lib/memorialErrors.js'
import { rejectMemorialWrite } from '../_lib/memorialReadOnly.js'
import { getMemorialStore } from '../_lib/memorialStore.js'

export function createNotesHandler({ store: configuredStore } = {}) {
  return async function handler(req, res) {
    if (req.method !== 'GET') {
      return rejectMemorialWrite(req, res, 'GET')
    }
    try {
      const store = configuredStore || getMemorialStore()
      const notes = await store.listPublicNotes()
      return res.status(200).json({ notes, count: notes.length })
    } catch (error) {
      return sendMemorialError(res, error)
    }
  }
}

export default createNotesHandler()
