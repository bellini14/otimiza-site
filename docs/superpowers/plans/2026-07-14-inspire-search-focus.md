# Inspire Search Focus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the Inspire search input focused and fully editable while automatic URL-synchronized search runs.

**Architecture:** Preserve the existing controlled input, `q` query parameter, and 300 ms search debounce. Prevent same-path query-string updates from remounting the global route tree by keying the route wrapper only by pathname, and tag local query writes with ordered component-scoped navigation IDs so delayed echoes cannot overwrite newer input or mask genuine history navigation.

**Tech Stack:** React 19, React Router 7, Vitest, Testing Library, user-event, Vite

---

## File Structure

- Create `src/App.test.jsx`: add isolated app-level regression tests for uninterrupted multi-character typing, URL synchronization, retained focus, initial hydration, and external query navigation.
- Modify `src/App.jsx`: limit the global route wrapper key to `displayedLocation.pathname` so query changes do not remount the route.
- Modify `src/components/InspireLayout.jsx`: identify delayed URL echoes with ordered component-scoped navigation metadata so they cannot overwrite newer keystrokes or mask browser history.

### Task 1: Protect Continuous Inspire Search Typing

**Files:**
- Create: `src/App.test.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/InspireLayout.jsx`

- [ ] **Step 1: Write the failing regression test**

Create an isolated App test that mocks only the Inspire article feed. Import `act`, `userEvent`, and `App`, then add the focused behavior test. Waiting across two animation frames forces `PageTransition` to commit the same-path query update before focus is asserted:

```jsx
it('keeps the search focused while typing and synchronizing the URL', async () => {
  const originalUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`

  try {
    window.history.pushState({}, '', '/inspire')
    const user = userEvent.setup()

    render(<App />)

    const searchInput = await screen.findByRole('textbox', { name: 'Pesquisar no Inspire' })
    await user.click(searchInput)
    await user.type(searchInput, 'g')

    await act(async () => {
      await new Promise((resolve) => {
        window.requestAnimationFrame(() => window.requestAnimationFrame(resolve))
      })
    })

    expect(screen.getByRole('textbox', { name: 'Pesquisar no Inspire' })).toBe(searchInput)
    expect(searchInput).toHaveFocus()

    await user.type(searchInput, 'estao')

    expect(searchInput).toHaveValue('gestao')
    expect(searchInput).toHaveFocus()
    expect(new URLSearchParams(window.location.search).get('q')).toBe('gestao')
  } finally {
    window.history.replaceState({}, '', originalUrl)
  }
})
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
npx vitest run src/App.test.jsx -t "keeps the search focused while typing and synchronizing the URL"
```

Expected: FAIL after the forced animation frames because the first `q` update changes the route wrapper key, remounts the search input, and loses its element identity and focus.

- [ ] **Step 3: Implement the minimal route-key correction**

In `src/App.jsx`, change only the wrapper key:

```jsx
<div className="page-transition-route" key={displayedLocation.pathname}>
```

Do not change input state, URL synchronization, debounce timing, or search fetching.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
npx vitest run src/App.test.jsx -t "keeps the search focused while typing and synchronizing the URL"
```

Expected after the pathname-only key change: the input keeps its identity and focus, but the test may still expose delayed internal URL echoes overwriting newer keystrokes.

- [ ] **Step 5: Protect newer local input from delayed internal URL echoes**

Add failing tests showing that a genuine external same-path `q` navigation updates the input even while focused and that type-clear-Back restores the retained query. Give every local URL write a unique component-scoped ID and monotonic sequence in router state. When the synchronization effect observes a pending internal ID, retire it and all older superseded IDs; unmatched external navigation must clear pending metadata and update local state.

- [ ] **Step 6: Run the App tests and verify GREEN**

Run:

```bash
npx vitest run src/App.test.jsx
```

Expected: all App search tests PASS, covering initial hydration, continuous typing, and external navigation.

- [ ] **Step 7: Run affected regression suites**

Run:

```bash
npx vitest run src/App.test.jsx src/pages/Inspire.test.jsx src/pages/InspireNewsletter.test.jsx src/transitions/PageTransition.test.jsx
```

Expected: all affected tests PASS.

- [ ] **Step 8: Run project verification**

Run:

```bash
npm test
npm run build
```

Expected: the complete test suite and production build both exit successfully.

- [ ] **Step 9: Review the scoped diff**

Run:

```bash
git diff --check -- src/App.jsx src/components/InspireLayout.jsx src/App.test.jsx
git diff -- src/App.jsx src/components/InspireLayout.jsx src/App.test.jsx
```

Expected: no whitespace errors and only the regression tests, pathname-only route key correction, and internal query-echo tracking.
