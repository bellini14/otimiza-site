# Blog Carousel Design

## Context

The homepage blog section uses a custom carousel in `src/components/ui/blog-highlights.jsx`.
The current implementation swaps between grid and flex layouts during navigation and coordinates motion through both `requestAnimationFrame` and `setTimeout`.
This creates unstable button behavior and animation stalls because the visible layout and the animated layout do not share the same rendering model.

## Approved Behavior

- Advance one card per click.
- Stop at the first and last available positions.
- Keep previous/next buttons disabled when the carousel is already at an edge.
- Make next/previous interactions feel immediate, smooth, and responsive on repeated clicks.
- Preserve the responsive layout:
  - 1 card on small screens
  - 2 cards on medium screens
  - 3 cards on large screens

## Proposed Design

Replace the dual-mode carousel with a single horizontal track that is always rendered as a flex row.
Each card width is derived from the current `slidesPerView`, and the track position is controlled only by `transform: translate3d(...)`.

The component will keep:

- `displayIndex` as the first visible card
- `slidesPerView` derived from viewport width

The component will remove:

- the temporary `transition` state
- the `requestAnimationFrame` coordination
- the `setTimeout`-driven animation completion logic
- the temporary stage rendering that injects an extra slide during motion

## Interaction Model

On next:

- increment `displayIndex` by 1 immediately on click
- clamp to `maxIndex`

On previous:

- decrement `displayIndex` by 1 immediately on click
- clamp to `0`

On resize:

- recompute `slidesPerView`
- clamp `displayIndex` so the current position remains valid

Buttons should react without waiting for timeout-driven state transitions.
The next visual position must be derived directly from the current index so the UI stays responsive even during quick sequential navigation.

## Animation Model

The track will always exist in the DOM and will animate through CSS `transition` on `transform`.
This keeps the motion path deterministic and removes the need to rebuild layout structure while the animation is running.

To improve perceived smoothness:

- use a shorter, direct transform transition tuned for quick interaction
- keep animation on compositor-friendly properties only
- avoid any extra staging DOM or delayed commit step between click and motion start

For users with reduced motion preferences, the transition should be disabled.

## Testing

Add or update tests to verify:

- the carousel renders the expected number of visible cards per breakpoint
- next/previous buttons move the window by one card
- the buttons disable correctly at the beginning and end
- the track transform updates consistently after navigation
- resize keeps the carousel within valid bounds
