import { rejectMemorialWrite } from '../_lib/memorialReadOnly.js'

export function createAccessHandler() {
  return rejectMemorialWrite
}

export default createAccessHandler()
