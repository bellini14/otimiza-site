const TRANSITION_ACTIVE_CLASS = 'page-transition-active'
export const PAGE_TRANSITION_COMPLETE_EVENT = 'page-transition-complete'

export function isPageTransitionActive() {
  return typeof document !== 'undefined' &&
    document.documentElement.classList.contains(TRANSITION_ACTIVE_CLASS)
}

export function startPageTransition() {
  document.documentElement.classList.add(TRANSITION_ACTIVE_CLASS)
}

export function finishPageTransition() {
  document.documentElement.classList.remove(TRANSITION_ACTIVE_CLASS)
  document.dispatchEvent(new Event(PAGE_TRANSITION_COMPLETE_EVENT))
}
