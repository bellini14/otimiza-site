# Inspire Search Focus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the Inspire search input focused and fully editable while automatic URL-synchronized search runs.

**Architecture:** Preserve the existing controlled input, `q` query parameter, and 300 ms search debounce. Prevent same-path query-string updates from remounting the global route tree by keying the route wrapper only by pathname; prove the behavior through an app-level interaction test that exercises the real BrowserRouter and route wrapper.

**Tech Stack:** React 19, React Router 7, Vitest, Testing Library, user-event, Vite

---

## File Structure

- Modify `src/pages/Inspire.test.jsx`: add an app-level regression test for uninterrupted multi-character typing, URL synchronization, and retained focus.
- Modify `src/App.jsx`: limit the global route wrapper key to `displayedLocation.pathname` so query changes do not remount the route.

### Task 1: Protect Continuous Inspire Search Typing

**Files:**
- Modify: `src/pages/Inspire.test.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Write the failing regression test**

Import `act`, `userEvent`, and `App`, then add this focused behavior test to the existing Inspire suite. Waiting across two animation frames forces `PageTransition` to commit the same-path query update before focus is asserted:

```jsx
it('keeps the search focused while typing and synchronizing the URL', async () => {
  client.fetch.mockResolvedValue([])
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
npx vitest run src/pages/Inspire.test.jsx -t "keeps the search focused while typing and synchronizing the URL"
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
npx vitest run src/pages/Inspire.test.jsx -t "keeps the search focused while typing and synchronizing the URL"
```

Expected: PASS with the complete term in the input and URL and the input still focused.

- [ ] **Step 5: Run affected regression suites**

Run:

```bash
npx vitest run src/pages/Inspire.test.jsx src/pages/InspireNewsletter.test.jsx src/transitions/PageTransition.test.jsx
```

Expected: all affected tests PASS.

- [ ] **Step 6: Run project verification**

Run:

```bash
npm test
npm run build
```

Expected: the complete test suite and production build both exit successfully.

- [ ] **Step 7: Review the scoped diff**

Run:

```bash
git diff --check -- src/App.jsx src/pages/Inspire.test.jsx
git diff -- src/App.jsx src/pages/Inspire.test.jsx
```

Expected: no whitespace errors and only the regression test plus the pathname-only route key correction.
