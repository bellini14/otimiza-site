import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

function usePageTransitionNavigate() {
  const navigate = useNavigate()

  return useCallback(
    (to, options = {}) => {
      // Ignore origin, sourceElement, sourceEvent from old transition logic
      const { origin, sourceElement, sourceEvent, ...navigateOptions } = options
      navigate(to, navigateOptions)
    },
    [navigate],
  )
}

export default usePageTransitionNavigate
