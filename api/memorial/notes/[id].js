import { rejectMemorialWrite } from '../../_lib/memorialReadOnly.js'

export function createNoteMutationHandler() {
  return rejectMemorialWrite
}

export default createNoteMutationHandler()
