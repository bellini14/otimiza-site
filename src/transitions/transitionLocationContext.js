import { createContext, useContext } from 'react'

export const TransitionLocationContext = createContext(null)

export function useTransitionLocation() {
  return useContext(TransitionLocationContext)
}
