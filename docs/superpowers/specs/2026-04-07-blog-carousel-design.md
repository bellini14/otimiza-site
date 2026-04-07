# Blog Carousel Design

## Context

The homepage blog section uses a custom carousel in `src/components/ui/blog-highlights.jsx`.
The current implementation swaps between grid and flex layouts during navigation and coordinates motion through both `requestAnimationFrame` and `setTimeout`.
This creates unstable button behavior and animation stalls because the visible layout and the animated layout do not share the same rendering model.

## Approved Behavior

- Advance one card per click.
- Stop at the first and last available positions.
- Keep previous/next buttons disabled when the carousel is already at an edge.
- Keep previous/next buttons disabled while the track is animating.
- Make next/previous interactions feel immediate and smooth, without allowing extra clicks in the middle of a transition.
- Preserve the responsive layout:
  - 1 card on small screens
  - 2 cards on medium screens
  - 3 cards on large screens

## Proposed Design

Replace the current dual-mode carousel with a new single-track carousel model.
The component will always render one horizontal flex track with all cards in order.
Each card width is derived from the current `slidesPerView`, and the track position is controlled only by `transform: translate3d(...)`.
Animation state is controlled explicitly, instead of being inferred from staged DOM swaps.

The component will keep:

- `displayIndex` as the first visible card
- `slidesPerView` derived from viewport width
- `isAnimating` as the interaction lock for the active transition

The component will remove:

- the temporary `transition` state
- the `requestAnimationFrame` coordination
- the `setTimeout`-driven animation completion logic
- the temporary stage rendering that injects an extra slide during motion
- the layout switch between static grid mode and animated flex mode

## Interaction Model

On next:

- if `isAnimating` is `true`, ignore the click
- otherwise set `isAnimating` to `true`
- increment `displayIndex` by 1
- clamp to `maxIndex`

On previous:

- if `isAnimating` is `true`, ignore the click
- otherwise set `isAnimating` to `true`
- decrement `displayIndex` by 1
- clamp to `0`

On resize:

- recompute `slidesPerView`
- clamp `displayIndex` so the current position remains valid

On transition end:

- clear `isAnimating`
- re-enable buttons if the carousel is not at an edge

Buttons should react without timeout-driven coordination.
The next visual position must be derived directly from the current index, and interaction lock must be released from the real transition lifecycle instead of an arbitrary delay.

## Animation Model

The track will always exist in the DOM and will animate through CSS `transition` on `transform`.
This keeps the motion path deterministic and removes the need to rebuild layout structure while the animation is running.

To improve perceived smoothness:

- use a shorter, direct transform transition tuned for quick interaction
- keep animation on compositor-friendly properties only
- avoid any extra staging DOM or delayed commit step between click and motion start
- release the interaction lock from `transitionend`, with a safe fallback only if the event does not fire

For users with reduced motion preferences, the transition should be disabled.

## Testing

Add or update tests to verify:

- the carousel renders the expected number of visible cards per breakpoint
- next/previous buttons move the window by one card
- the buttons disable correctly at the beginning and end
- the buttons cannot trigger another navigation during an active animation
- the track transform updates consistently after navigation
- resize keeps the carousel within valid bounds
