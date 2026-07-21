# Inspire Touch Tooltip Disablement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Disable custom Inspire tooltips on every touch-capable device while preserving mouse and keyboard tooltips on non-touch desktops.

**Architecture:** Keep the behavior centralized in `InspireCursorTooltip`. Add one small capability predicate based on `navigator.maxTouchPoints`, and return early from the component effect on touch-capable devices so no document listeners or tooltip state updates are created.

**Tech Stack:** React 19, React DOM portals, Vitest, Testing Library, jsdom

---

### Task 1: Gate Inspire tooltips by touch capability

**Files:**
- Create: `src/components/InspireCursorTooltip.test.jsx`
- Modify: `src/components/InspireCursorTooltip.jsx`

- [ ] **Step 1: Write the failing touch-device test**

Create a focused test fixture containing `.inspire-shell` and a button with `data-inspire-tooltip`. Override `navigator.maxTouchPoints` with a configurable value of `1`, render `InspireCursorTooltip`, dispatch both `mouseMove` and `focusIn` to the button, and assert `screen.queryByRole('tooltip')` remains absent. Capture the original own-property descriptor before the suite; after each test, restore it with `Object.defineProperty` when it existed, otherwise delete the configurable test override.

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- src/components/InspireCursorTooltip.test.jsx`

Expected: FAIL because the current component registers global mouse and focus listeners on touch-capable devices and renders the tooltip.

- [ ] **Step 3: Implement the minimal capability gate**

In `InspireCursorTooltip.jsx`, add an SSR-safe predicate:

```jsx
function hasTouchInput() {
  return typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
}
```

At the start of the existing `useEffect`, return `undefined` when `hasTouchInput()` is true. Leave the data attributes, desktop event handlers, portal markup, animations, and CSS unchanged.

- [ ] **Step 4: Add desktop regression tests**

Set `navigator.maxTouchPoints` to `0`. Verify a mouse move renders the expected tooltip label, then in a separate test call `fireEvent.focusIn(target)` and verify the same label renders. These assertions protect both existing desktop activation paths and ensure the keyboard event reaches the component's document-level `focusin` listener.

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run: `npm test -- src/components/InspireCursorTooltip.test.jsx`

Expected: all focused tests PASS.

- [ ] **Step 6: Run Inspire regression tests**

Run: `npm test -- src/components/InspireCursorTooltip.test.jsx src/pages/InspireNewsletter.test.jsx src/pages/Inspire.test.jsx src/pages/PostDetail.test.jsx src/pages/InspireTheme.test.jsx`

Expected: all tests PASS with no errors or warnings introduced by this change.

- [ ] **Step 7: Run lint and production build**

Run: `npm run lint`

Run: `npm run build`

Expected: both commands exit successfully.

- [ ] **Step 8: Commit the implementation**

```bash
git add src/components/InspireCursorTooltip.jsx src/components/InspireCursorTooltip.test.jsx docs/superpowers/plans/2026-07-21-inspire-disable-touch-tooltips.md
git commit -m "fix: disable inspire tooltips on touch devices"
```
