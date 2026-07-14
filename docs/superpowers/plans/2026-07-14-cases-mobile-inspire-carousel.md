# Cases Mobile Inspire Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the selected-cases carousel match the Home Inspire carousel below 768px while preserving all case content, links, and the current desktop appearance and kinetics.

**Architecture:** Replace the duplicated drag implementation inside `CasesCarousel` with the existing shared `useDragCarousel` hook. Add a direct-touch compatibility option for the existing desktop Cases behavior, remount the track when crossing 768px, and use dedicated responsive Cases classes that mirror Inspire at 0–639px and 640–767px before returning to the existing fixed desktop geometry.

**Tech Stack:** React 19, React Router, Tailwind CSS, responsive CSS, Pointer Events, requestAnimationFrame, Vitest, Testing Library

---

### Task 1: Add explicit touch compatibility and responsive reconciliation to the shared hook

**Files:**
- Modify: `src/hooks/useDragCarousel.js`
- Create: `src/hooks/useDragCarousel.test.jsx`

- [ ] **Step 1: Write failing direct-touch compatibility tests**

Create a small harness around `useDragCarousel`. Give the shell `clientWidth: 600`, the track `scrollWidth: 900`, drag a touch pointer by `-100px`, and assert that `touchMode="direct"` produces `translateX(-96px)` with no mobile distance scaling. Spy on `setPointerCapture` and `releasePointerCapture` to prove the direct touch pointer is captured and released. Assert that the default mode retains the current scaled Inspire calculation and its pending-axis behavior.

```jsx
function Harness({ touchMode, geometryKey = 'initial', snapStep = 0, snapOnRelease = false }) {
  const carousel = useDragCarousel({ touchMode, geometryKey, snapStep, snapOnRelease })
  return (
    <div ref={carousel.shellRef} data-testid="shell">
      <div
        ref={carousel.trackRef}
        data-testid="track"
        style={{ transform: `translateX(${carousel.translateX}px)` }}
        {...carousel.trackHandlers}
      />
    </div>
  )
}
```

- [ ] **Step 2: Run the focused hook test and verify RED**

Run: `npm test -- src/hooks/useDragCarousel.test.jsx`

Expected: FAIL because `touchMode="direct"` and `geometryKey` are not supported.

- [ ] **Step 3: Add failing release-kinetics and resize-clamp tests**

For direct touch, release after a known final movement, advance mocked animation frames, and assert normal `0.18` release velocity with `0.965` friction and no snap even when the current position is between slide targets. Repeat one drag with `pointerType: 'mouse'` to protect existing mouse behavior and elastic bounds.

For geometry reconciliation, drag to `-250px`, change the mocked track width so the new minimum is `-100px`, rerender with a new `geometryKey`, advance one animation frame, and expect exactly `translateX(-100px)`. Start inertia before rerendering and spy on `cancelAnimationFrame` so the test proves reconciliation cancels the active motion before clamping after layout.

- [ ] **Step 4: Implement the hook options and clamp mechanism**

Add `touchMode = 'scaled'` to `useDragCarousel`. When `touchMode === 'direct'`, begin with the horizontal axis, use the normal `DRAG_RESPONSE` calculation, and use the normal release velocity/friction. Keep the current touch-axis locking and scaled movement as the default so Home Inspire does not change.

```js
const usesDirectTouch = dragRef.current.pointerType === 'touch' && touchMode === 'direct'
const nextTranslate = dragRef.current.pointerType === 'touch' && !usesDirectTouch
  ? getTouchDragTranslate(...)
  : dragRef.current.startTranslate + delta * DRAG_RESPONSE
```

For direct touch, call `preventDefault` and capture the pointer on pointer-down, matching the current Cases implementation. Release capture in `endDrag`.

Add `geometryKey` to the hook options and import `useLayoutEffect`. On a `geometryKey` change, cancel active inertia and schedule one animation frame so CSS layout is measured after render. Clamp with:

```js
useLayoutEffect(() => {
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current)
    animationRef.current = null
  }

  const reconciliationFrame = requestAnimationFrame(() => {
    const minTranslate = getMinTranslate()
    updateTranslate(Math.max(minTranslate, Math.min(0, translateRef.current)))
  })

  return () => cancelAnimationFrame(reconciliationFrame)
}, [geometryKey])
```

Keep the effect intentionally keyed only by the primitive `geometryKey`; do not add unstable local function identities to its dependency array. The existing unmount cleanup remains responsible for cancelling inertia when the keyed Cases child changes modes.

- [ ] **Step 5: Run the focused hook test and verify GREEN**

Run: `npm test -- src/hooks/useDragCarousel.test.jsx`

Expected: PASS for scaled touch, direct compatibility touch, pointer capture, legacy release/no-snap behavior, elastic bounds, and post-layout clamping.

- [ ] **Step 6: Run the Home Inspire regression tests**

Run: `npm test -- src/components/ui/blog-highlights.test.jsx`

Expected: PASS with unchanged mobile snapping and touch scaling.

- [ ] **Step 7: Review the hook diff without staging unrelated work**

```bash
git diff -- src/hooks/useDragCarousel.js src/hooks/useDragCarousel.test.jsx
```

`src/hooks/useDragCarousel.js` was already modified before this task. Do not stage the whole file. Keep implementation changes unstaged during execution unless the user explicitly requests a code commit; if a commit is requested, stage only reviewed task hunks with `git add -p` and inspect `git diff --cached` before committing.

### Task 2: Rebuild the Cases mobile carousel from the Inspire pattern

**Files:**
- Modify: `src/pages/Cases.test.jsx`
- Modify: `src/pages/Cases.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Add a failing multi-item content-preservation test**

Mock two selected cases with distinct IDs, logo URLs, alternative text, titles, descriptions, and slugs. Render at 390px and assert the ordered array of case articles has the same logo source/alt, heading, description, and link destination as the fixture:

```js
const cards = within(screen.getByTestId('cases-logo-section')).getAllByTestId('case-carousel-item')
expect(cards.map((card) => within(card).getByRole('heading').textContent)).toEqual([
  'Primeiro case',
  'Segundo case',
])
expect(within(cards[0]).getByRole('img', { name: 'Logo primeiro' })).toHaveAttribute('src', firstLogoUrl)
expect(within(cards[0]).getByText('Descrição primeiro')).toBeInTheDocument()
expect(within(cards[0]).getByRole('link', { name: 'Ler mais' })).toHaveAttribute('href', '/cases/primeiro')
```

Repeat the field assertions for the second card so preservation is concrete rather than inferred.

- [ ] **Step 2: Add failing mobile and desktop contract tests**

At `window.innerWidth = 390`, assert:

- the shell has `overflow-hidden` and `md:overflow-visible`;
- the track has `data-mobile-snap="true"` and `touchAction: pan-y`;
- each item has `cases-carousel-item` and `data-carousel-snap-slide="true"`;
- the edge spacers have `cases-carousel-edge-spacer`;
- fades have `cases-carousel-fade`;
- the case card fills its slide rather than carrying fixed mobile width utilities;
- the existing logo source/alt, title, description, order, and link remain unchanged.

At `window.innerWidth = 1024`, assert `data-mobile-snap="false"` and preserve the existing desktop card/spacer geometry through CSS classes.

- [ ] **Step 3: Add failing boundary and resize tests**

Reset `window.innerWidth` to its original value in `afterEach` so this suite cannot contaminate other tests. Use parameterized renders at 639, 640, 767, and 768px:

- 639 and 640: `data-mobile-snap="true"`;
- 767: `data-mobile-snap="true"`;
- 768: `data-mobile-snap="false"` and direct desktop touch behavior;
- base fade/hint rules are hidden below 640 and enabled by the `min-width: 640px` CSS block.

At 767px, start a drag and release to create an active animation. Change to 768px, dispatch `resize`, and assert that the keyed child produces a new track at `translateX(0px)` and the prior animation was cancelled during unmount. Separately resize within mobile mode after changing mocked dimensions, advance the reconciliation frame, and assert the offset clamps to the new minimum.

At 1024px, perform touch and mouse drags. Assert touch moves at direct `0.96` response, capture/release occurs, release remains non-snapping after advancing frames, and mouse retains its existing response and elastic bounds.

- [ ] **Step 4: Add failing CSS breakpoint tests**

Read `src/index.css` and assert the Cases rules mirror Inspire:

```css
.cases-carousel-fade { display: none; }
.cases-carousel-edge-spacer { width: var(--home-menu-inline); }
.cases-carousel-item { width: calc(100vw - (2 * var(--home-menu-inline))); }

@media (min-width: 640px) {
  .cases-carousel-fade { display: block; }
  .cases-carousel-edge-spacer { width: 12rem; }
  .cases-carousel-item { width: calc((min(100vw, 1380px) - 3rem - 32px) / 2); }
}

@media (min-width: 768px) {
  .cases-carousel-item { width: 20rem; }
}

@media (min-width: 1024px) {
  .cases-carousel-edge-spacer { width: 13rem; }
  .cases-carousel-item { width: 22rem; }
}
```

- [ ] **Step 5: Run the focused Cases tests and verify RED**

Run: `npm test -- src/pages/Cases.test.jsx`

Expected: FAIL because Cases still uses its duplicated drag handlers, fixed mobile card width, visible base fades, and no snap metadata.

- [ ] **Step 6: Add responsive carousel geometry helpers**

Import `useDragCarousel` from `../hooks/useDragCarousel`. In `Cases.jsx`, add SSR-safe viewport helpers and an Inspire-equivalent step calculation. Use `32px` as the existing track gap.

```js
function getViewportWidth() {
  return typeof window === 'undefined' ? 1024 : window.innerWidth
}

function getHomeInlinePx(viewportWidth) {
  if (viewportWidth >= 1024) return 40
  if (viewportWidth >= 640) return 32
  return 24
}

function getCasesSlideStep(viewportWidth) {
  if (viewportWidth < 640) {
    return viewportWidth - getHomeInlinePx(viewportWidth) * 2 + 32
  }
  return ((Math.min(viewportWidth, 1380) - 48 - 32) / 2) + 32
}
```

Track `viewportWidth` with `useState(getViewportWidth)`. Add an effect that updates it from `window.innerWidth` on `resize` and removes the listener on cleanup. Derive `isMobileCarousel = viewportWidth < 768`.

- [ ] **Step 7: Replace only the selected-cases drag state with the shared hook**

Create `CasesCarouselTrack({ caseLogos, isMobileCarousel, viewportWidth })`. This child—not the outer wrapper—must own `useDragCarousel`, so changing its key destroys the hook state and cancels its animation frames. Render it from `CasesCarousel` exactly as:

```jsx
<CasesCarouselTrack
  key={isMobileCarousel ? 'mobile' : 'desktop'}
  caseLogos={caseLogos}
  isMobileCarousel={isMobileCarousel}
  viewportWidth={viewportWidth}
/>
```

Configure the child hook as follows:

```js
useDragCarousel({
  snapStep: isMobileCarousel ? getCasesSlideStep(viewportWidth) : 0,
  snapOnRelease: isMobileCarousel,
  touchMode: isMobileCarousel ? 'scaled' : 'direct',
  geometryKey: viewportWidth,
})
```

Keep the current markup, test IDs, reveal timing, content mapping, link guard, grab cursor, hint, and fades. Remove only `CasesCarousel`'s local drag refs, state, inertia functions, and pointer handlers made redundant by the hook. Retain the file-level `CAROUSEL_*` constants and `getElasticTranslateX`: `ClientLogosCarousel` still uses them.

- [ ] **Step 8: Apply Inspire-equivalent responsive classes**

Add the CSS from Step 2. Update the shell to `overflow-hidden md:overflow-visible`, apply the dedicated fade/spacer/item classes, make the case card `w-full`, and add `data-mobile-snap` plus measured-slide metadata to the track/items.

- [ ] **Step 9: Confirm both resize paths**

Within one mode, `viewportWidth` changes `geometryKey`; the hook cancels inertia and clamps after the responsive layout frame. Crossing 768px changes the key of the component that owns the hook, so unmount cleanup cancels old inertia and the new child begins at translation zero.

- [ ] **Step 10: Run focused tests and verify GREEN**

Run: `npm test -- src/hooks/useDragCarousel.test.jsx src/pages/Cases.test.jsx src/components/ui/blog-highlights.test.jsx`

Expected: PASS, including the 639/640px and 767/768px boundary assertions and desktop touch compatibility.

- [ ] **Step 11: Review scoped diffs without staging unrelated work**

```bash
git diff -- src/pages/Cases.jsx src/pages/Cases.test.jsx src/index.css src/hooks/useDragCarousel.js src/hooks/useDragCarousel.test.jsx
```

All existing modified files in this command were dirty before this task. Preserve their unrelated changes. Do not use whole-file `git add`. Keep code changes unstaged unless the user requests a commit; then use `git add -p`, reject unrelated hunks, and verify `git diff --cached` before committing.

### Task 3: Regression and production verification

**Files:**
- Modify only if a scoped defect is exposed by verification.

- [ ] **Step 1: Run related page tests**

Run: `npm test -- src/pages/Home.test.jsx src/pages/Cases.test.jsx src/components/ui/blog-highlights.test.jsx src/hooks/useDragCarousel.test.jsx`

Expected: PASS.

- [ ] **Step 2: Run the full test suite**

Run: `npm test`

Expected: PASS.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: no new lint errors caused by this change; document unrelated pre-existing errors separately if present.

- [ ] **Step 4: Build production assets**

Run: `npm run build`

Expected: successful Vite build and static SEO/sitemap generation.

- [ ] **Step 5: Verify in the browser**

Inspect `/cases` at 390px, 639px, 640px, 767px, 768px, and 1024px. Confirm matching Inspire geometry below 768px, smooth horizontal touch intent and snapping, uninterrupted vertical scrolling, clickable links, preserved content/order, hidden mobile fades below 640px, unchanged desktop appearance, and no horizontal page overflow.

- [ ] **Step 6: Review any verification-only fix**

If verification required a scoped correction, review only the affected file diff and preserve all pre-existing hunks. Do not commit or stage code unless the user requests it; if requested, use hunk-only staging and inspect the cached diff. Never create an empty commit.
