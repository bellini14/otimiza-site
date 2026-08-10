# Global Page Transition Design

The site currently swaps routes immediately, which makes navigation feel abrupt across both the institutional shell and the Inspire editorial shell.

This change introduces one global transition system at the router level so every route change uses the same page-to-page animation:

- the transition covers all internal routes, including institutional pages, `/inspire`, newsletter, post detail, and navigation between those areas
- click-driven navigation captures the click origin and starts the animation near that point
- browser back/forward and programmatic navigation still animate, but fall back to a consistent default origin
- `prefers-reduced-motion` degrades the effect to a short fade/scale transition instead of the full sweep

The chosen visual direction is the diagonal sweep (`B`):

- a light veil enters quickly
- the Otimiza icon grows from the click origin and drives the reveal diagonally across the viewport
- once the old page is covered, the router swaps the displayed location
- the same shape continues opening to reveal the next page

The implementation should keep the transition orchestration separate from page content:

- a transition provider owns the animation state machine and the last navigation origin
- a route shell renders routes from a delayed `displayedLocation` so the old route can stay mounted during the cover phase
- transition-aware links and navigation helpers capture pointer origin without forcing each page to know about animation details

Success means navigation feels unified across the whole site, the icon-based reveal is visible but not heavy-handed, reduced-motion users get an accessible fallback, and the router remains testable with focused integration tests.
