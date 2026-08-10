# Inspire Touch Tooltip Disablement Design

## Goal

Prevent the custom Inspire cursor tooltip from operating on any touch-capable device, including large tablets and hybrid laptops, while preserving its existing mouse and keyboard behavior on non-touch desktop devices.

## Scope

The change is isolated to `InspireCursorTooltip`. Existing `data-inspire-tooltip` attributes remain in place because they describe the controls and allow the desktop behavior to remain unchanged. No layout breakpoint will determine whether the tooltip is enabled.

## Behavior

At mount time, the tooltip component checks whether the browser reports touch capability through `navigator.maxTouchPoints > 0`.

- When touch capability is present, the component does not register mouse or focus listeners and never renders the custom tooltip.
- When touch capability is absent, the current pointer-following, keyboard-focus, entry animation, and exit animation behavior remains unchanged.
- Devices with both touch and mouse input are treated as touch-capable, so the custom tooltip stays disabled as requested.

The detection remains safe in test and rendering environments where `navigator` may be unavailable by treating those environments as non-touch unless touch capability is explicitly reported.

## Alternatives Considered

### CSS capability query

An `@media (any-pointer: coarse)` rule could hide the tooltip. This was rejected because the component would still install global listeners and update React state for an element that can never be seen.

### Ignore touch events only

The current tooltip listens to mouse and focus events rather than touch events. Ignoring touch events would not reliably cover hybrid devices, which can synthesize mouse events or also provide a trackpad. The requirement is device-level disablement whenever touch is available.

## Testing

Add focused component tests for `InspireCursorTooltip`:

1. Set `navigator.maxTouchPoints` to a positive value, trigger both mouse movement and focus on an Inspire tooltip target, and verify that no tooltip is rendered.
2. Set `navigator.maxTouchPoints` to zero and verify that the existing desktop mouse behavior still renders the tooltip.
3. With `navigator.maxTouchPoints` at zero, focus an Inspire tooltip target and verify that the existing desktop keyboard tooltip still renders.

Tests restore the original navigator property after each case to avoid leaking device state into other suites. The focused tests and the existing Inspire page/theme tests must pass before completion.
