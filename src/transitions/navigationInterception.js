export function getInternalNavigationTarget(anchor, currentUrl) {
  if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) {
    return null
  }

  const current = new URL(currentUrl)
  const target = new URL(anchor.href, current)

  if (target.origin !== current.origin || target.pathname === current.pathname) {
    return null
  }

  return {
    href: `${target.pathname}${target.search}${target.hash}`,
    location: {
      pathname: target.pathname,
      search: target.search,
      hash: target.hash,
      state: null,
      key: `transition-${Date.now()}`,
    },
  }
}
