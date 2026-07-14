# Contact Map Mobile Zoom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use zoom 17 for the contact map below 640px while preserving zoom 18 at 640px and above.

**Architecture:** Keep responsive zoom behavior inside `ContactMap`. A small helper reads the existing `sm` breakpoint through `matchMedia`, and the component updates the Leaflet instance when that query changes.

**Tech Stack:** React 19, Leaflet, Vitest, Testing Library

---

### Task 1: Add mobile initial zoom

**Files:**
- Modify: `src/components/ContactMap.jsx`
- Test: `src/components/ContactMap.test.jsx`

- [ ] **Step 1: Add an isolated matchMedia test helper**

In `ContactMap.test.jsx`, extend the hoisted Leaflet map mock with `setZoom`. Add a helper that stubs and exposes the exact media query:

```jsx
function stubMobileQuery(initialMatches) {
  const listeners = new Set()
  const mediaQuery = {
    matches: initialMatches,
    media: '(max-width: 639px)',
    addEventListener: vi.fn((type, listener) => {
      if (type === 'change') listeners.add(listener)
    }),
    removeEventListener: vi.fn((type, listener) => {
      if (type === 'change') listeners.delete(listener)
    }),
    dispatch(matches) {
      mediaQuery.matches = matches
      listeners.forEach((listener) => listener({ matches, media: mediaQuery.media }))
    },
  }

  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))
  return mediaQuery
}
```

Add `vi.unstubAllGlobals()` to `afterEach` so the global cannot leak between tests.

- [ ] **Step 2: Write the failing mobile initialization test**

```jsx
it('starts one zoom level lower below 640px', async () => {
  stubMobileQuery(true)
  render(<ContactMap />)

  await waitFor(() => {
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 639px)')
    expect(setView).toHaveBeenCalledWith([-29.146183, -51.188804], 17)
  })
})
```

- [ ] **Step 3: Run the focused test to verify it fails**

Run: `npm test -- src/components/ContactMap.test.jsx`

Expected: FAIL because `ContactMap` still always calls `setView(..., 18)`.

- [ ] **Step 4: Implement only the responsive initial value**

In `ContactMap.jsx`, define `MOBILE_MAP_QUERY = '(max-width: 639px)'`, create the media-query list inside the effect, and call `map.setView(OTIMIZA_POSITION, mobileQuery.matches ? 17 : 18)`.

- [ ] **Step 5: Verify mobile and existing desktop initialization pass**

Run: `npm test -- src/components/ContactMap.test.jsx`

Expected: PASS.

The existing assertion `setView(..., 18)` proves the non-mobile behavior; initialize its test with `stubMobileQuery(false)`.

### Task 2: Update zoom when the breakpoint changes

**Files:**
- Modify: `src/components/ContactMap.jsx`
- Test: `src/components/ContactMap.test.jsx`

- [ ] **Step 1: Write failing tests for both breakpoint directions**

```jsx
it.each([
  { initialMatches: false, nextMatches: true, expectedZoom: 17 },
  { initialMatches: true, nextMatches: false, expectedZoom: 18 },
])('updates zoom when mobile match changes', async ({ initialMatches, nextMatches, expectedZoom }) => {
  const mediaQuery = stubMobileQuery(initialMatches)
  render(<ContactMap />)
  await waitFor(() => expect(setView).toHaveBeenCalled())

  mediaQuery.dispatch(nextMatches)

  expect(setZoom).toHaveBeenCalledWith(expectedZoom)
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/components/ContactMap.test.jsx`

Expected: FAIL because no `change` listener calls `map.setZoom`.

- [ ] **Step 3: Add the minimal breakpoint listener**

Register one `change` handler on the media-query list. The handler calls `map.setZoom(event.matches ? 17 : 18)`.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- src/components/ContactMap.test.jsx`

Expected: PASS.

### Task 3: Clean up and verify regressions

**Files:**
- Modify: `src/components/ContactMap.jsx`
- Test: `src/components/ContactMap.test.jsx`

- [ ] **Step 1: Write the failing cleanup test**

```jsx
it('removes the responsive zoom listener on unmount', async () => {
  const mediaQuery = stubMobileQuery(false)
  const { unmount } = render(<ContactMap />)
  await waitFor(() => expect(mediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function)))
  const handler = mediaQuery.addEventListener.mock.calls[0][1]

  unmount()

  expect(mediaQuery.removeEventListener).toHaveBeenCalledWith('change', handler)
  expect(remove).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/components/ContactMap.test.jsx`

Expected: FAIL because the media-query listener is not removed yet.

- [ ] **Step 3: Add listener cleanup**

Remove the exact `change` handler before the existing `map.remove()` call in the effect cleanup.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- src/components/ContactMap.test.jsx`

Expected: PASS.

- [ ] **Step 5: Preserve map-layer, marker, and controls coverage**

In the existing render test, keep the marker and custom-control assertions and add:

```jsx
expect(addTileLayer).toHaveBeenCalledWith(expect.anything())
```

This proves the fallback rendered layer is still attached to the Leaflet map; the existing `getMapLayerConfig` test preserves MapTiler selection and options.

- [ ] **Step 6: Run focused regression checks**

Run: `npm test -- src/pages/Contato.test.jsx src/components/ContactMap.test.jsx`

Expected: all contact-page tests PASS.

- [ ] **Step 7: Run the full verification suite**

Run: `npm test`

Expected: all tests PASS with no errors.

Run: `npm run lint`

Expected: lint exits successfully with no new errors.

- [ ] **Step 8: Commit**

Stage only `src/components/ContactMap.jsx`, `src/components/ContactMap.test.jsx`, and this plan, then commit with `fix: reduce contact map zoom on mobile`.
