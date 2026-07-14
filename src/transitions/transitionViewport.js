const PAGE_TRANSITION_DESKTOP_MIN_WIDTH = 770

export function shouldAnimatePageTransition(viewport = window) {
  return viewport.innerWidth >= PAGE_TRANSITION_DESKTOP_MIN_WIDTH
}

export function scrollToLocationTarget(location) {
  const hash = location.hash?.slice(1)

  if (hash) {
    const target = document.getElementById(decodeURIComponent(hash))

    if (target) {
      target.scrollIntoView({ block: 'start', behavior: 'smooth' })
      return
    }
  }

  window.scrollTo({ top: 0, behavior: 'instant' })
}
