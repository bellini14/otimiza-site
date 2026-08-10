# Contact Map Mobile Zoom Design

## Goal

Reduce the initial contact-page map zoom by exactly one level on mobile screens without changing the tablet or desktop presentation.

## Behavior

- Viewports below `640px` use Leaflet zoom `17`.
- Viewports at or above `640px` keep Leaflet zoom `18`.
- The map remains centered on the existing Otimiza coordinates.
- The marker, map layer, interaction settings, and custom zoom controls remain unchanged.
- If the viewport crosses the `640px` breakpoint while the page is open, the map updates to the corresponding zoom level.

## Implementation

`ContactMap` will derive its zoom from `window.matchMedia('(max-width: 639px)')`. It will use that value when setting the initial view and subscribe to media-query changes so orientation changes and responsive resizing stay consistent with the active layout. The listener will be removed during component cleanup.

## Testing

Component tests will verify:

- zoom `17` below `640px`;
- zoom `18` from `640px` upward;
- crossing the breakpoint updates the existing map to the expected zoom;
- existing marker, layer, and custom zoom-control behavior remains intact.
