# Home Inspire Drag Carousel Design

## Goal

Make the Inspire carousel on the home page use the same direct-drag interaction as the selected cases carousel, without changing the existing Inspire cards or their content.

## Scope

- Preserve the current Inspire posts, card markup, card styling, card dimensions, section copy, counter, and “Explorar Inspire” link.
- Replace the arrow-controlled slide navigation with pointer dragging.
- Match the Cases carousel behavior: grab/grabbing cursors, inertial release, elastic resistance at both limits, spring return, pointer-following “Arrastar” hint, directional arrow, and lateral fades.
- Preserve vertical touch scrolling with `touch-action: pan-y`.
- Keep card links usable and prevent drag gestures from causing accidental navigation.
- Keep responsive card counts and widths already used by Inspire.

## Architecture

Extract the drag physics and pointer state used by `CasesCarousel` into a small shared hook. Both Cases and Inspire will consume that hook so their drag response, inertia, resistance, hint movement, and edge settling remain behaviorally identical.

The hook will own the track translation and pointer lifecycle. Each carousel remains responsible for its own markup, visual styling, content, and width calculations. This keeps the Inspire cards unchanged and avoids coupling the two visual designs.

## Inspire Integration

The existing Inspire track continues to render every current `ProjectCard` with its existing props and responsive width calculation. The track becomes a `w-max` draggable row inside a full-width clipped shell. Its translation comes from the shared drag hook rather than the current index and arrow buttons.

The section header retains its existing copy. The arrow controls are removed because navigation becomes direct manipulation. The bottom counter continues to reflect the visible range based on the current translation. The “Explorar Inspire” CTA remains unchanged.

## Interaction and Accessibility

- Pointer down on empty card/track space starts dragging and captures the pointer.
- Pointer movement updates translation with the same response coefficient used by Cases.
- Pointer release applies the same inertia and edge spring used by Cases.
- Interactive descendants remain directly clickable.
- The cursor switches between `grab` and `grabbing`.
- The hint follows the pointer and changes arrow direction with drag direction.
- Motion preference continues to be respected for nonessential reveal animation; direct pointer movement remains available.

## Testing

Component tests will first establish the desired failing behavior:

- Inspire retains the existing posts and `ProjectCard` content.
- The track exposes grab/grabbing behavior.
- Drag movement changes the track translation using the Cases response.
- Release applies inertia and elastic bounds.
- Interactive links do not initiate dragging.
- The hint and directional arrow follow the Cases behavior.
- Responsive card widths remain unchanged.

After implementation, run the focused component tests, the related Home and Cases tests, the full test suite, and a production build. Finally, verify desktop and mobile behavior in the browser.
