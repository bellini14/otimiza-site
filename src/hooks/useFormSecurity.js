import { useCallback, useRef, useState } from 'react'

export function useFormSecurity() {
  const [token, setToken] = useState('')
  const challengeRef = useRef(null)
  const reset = useCallback(() => {
    setToken('')
    challengeRef.current?.reset()
  }, [])
  return { token, setToken, challengeRef, reset }
}

