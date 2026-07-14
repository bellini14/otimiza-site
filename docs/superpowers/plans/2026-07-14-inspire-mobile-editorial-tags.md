# Inspire Mobile, Editorial Filter, and Article Tags Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Editorial filter and make the Inspire feed fully contained on mobile with two deterministic filter rows, visible thumbnails, and yellow article category labels.

**Architecture:** Extend the existing filter configuration and fallback metadata without changing the data-loading architecture. Fix the root overflow at the feed/grid boundary, then use a three-column mobile filter grid and a constrained story thumbnail track. Keep the category highlight scoped to the feed kicker.

**Tech Stack:** React 19, Sanity GROQ, Vitest, Testing Library, CSS.

---

### Task 1: Editorial category behavior

**Files:**
- Modify: `src/pages/Inspire.test.jsx`
- Modify: `src/pages/Inspire.jsx`
- Modify: `src/data/blogPosts.js`

- [ ] **Step 1: Write the failing Editorial filter test**

Update the requested filter-order assertion to include `Editorial` after `Artigos`. Add a focused test that clicks `Editorial`, expects `aria-pressed="true"`, and verifies the Sanity call:

```js
expect(client.fetch).toHaveBeenLastCalledWith(
  expect.stringContaining('eyebrow == $category'),
  { category: 'Editorial', start: 0, end: 15 },
)
```

Resolve the request with an Editorial post and verify it replaces unrelated feed posts.

Extend the existing confirmed-fallback category table with `['Editorial', 'Editorial']`, so the test asserts the exact fallback title set and proves at least one local Editorial post is available.

- [ ] **Step 2: Run the test and verify RED**

Run: `npx vitest run src/pages/Inspire.test.jsx -t "filters Editorial posts" --exclude ".worktrees/**"`

Expected: FAIL because no Editorial filter button exists.

- [ ] **Step 3: Add the filter and fallback mapping**

Insert `{ key: 'editorial', label: 'Editorial', category: 'Editorial' }` after `Artigos` in `INSPIRE_FILTERS`. Change the integration fallback post's `inspireCategory` from `Artigos` to `Editorial`; preserve its existing `eyebrow`.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run the command from Step 2.

Expected: PASS.

### Task 2: Mobile containment, two filter rows, and yellow kicker

**Files:**
- Modify: `src/pages/InspireTheme.test.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Write failing CSS contract tests**

Extend `InspireTheme.test.jsx` to assert:

```js
expect(indexCss).toMatch(/\.inspire-page__feed\s*\{[^}]*min-width:\s*0;/s)
expect(indexCss).toMatch(/\.inspire-page__feed\s*\{[^}]*max-width:\s*100%;/s)
expect(indexCss).toMatch(/@media \(max-width: 720px\)[\s\S]*\.inspire-page__grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/)
expect(indexCss).toMatch(/@media \(max-width: 720px\)[\s\S]*\.inspire-page__tabs\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/)
expect(indexCss).toMatch(/\.inspire-story__kicker\s*\{[^}]*width:\s*fit-content;[^}]*background:\s*#[0-9a-f]{6};/i)
```

Also assert the mobile story uses `grid-template-columns: minmax(0, 1fr)` followed by a compact fixed image column and that `.inspire-story__thumb-link` has `min-width: 0; max-width: 100%`.

- [ ] **Step 2: Run the style test and verify RED**

Run: `npx vitest run src/pages/InspireTheme.test.jsx --exclude ".worktrees/**"`

Expected: FAIL on feed containment, the three-column mobile grid, and yellow kicker rules.

- [ ] **Step 3: Implement the minimal responsive CSS**

- Add `min-width: 0` and `max-width: 100%` to `.inspire-page__feed`.
- Set the mobile `.inspire-page__grid` track to `minmax(0, 1fr)` so the grid itself cannot retain an automatic minimum wider than the viewport.
- Keep desktop filters as a horizontal flex row.
- At `max-width: 720px`, set `.inspire-page__tabs` to `display: grid`, `grid-template-columns: repeat(3, minmax(0, 1fr))`, `overflow-x: visible`, and compact gaps.
- In the same media query, allow filter label wrapping and start alignment.
- Use `minmax(0, 1fr) 5.75rem` for mobile stories with a `0.75rem` gap.
- Constrain `.inspire-story__thumb-link` to its grid cell.
- Add content-width padding and `background: #fff176` to `.inspire-story__kicker`.

- [ ] **Step 4: Run focused regression tests**

Run:

```powershell
npx vitest run src/pages/Inspire.test.jsx src/pages/InspireTheme.test.jsx src/lib/blogFilters.test.js --exclude ".worktrees/**"
npx eslint src/pages/Inspire.jsx src/pages/Inspire.test.jsx src/pages/InspireTheme.test.jsx src/lib/blogFilters.js src/lib/blogFilters.test.js src/data/blogPosts.js
npm run build
```

Expected: all commands exit 0.

If in-app browser control is available, inspect 320px, 375px, and 720px widths and verify two filter rows plus thumbnail right-edge containment. If it is unavailable, report that limitation and rely on the automated CSS containment contract rather than substituting an external browser.

- [ ] **Step 5: Review the scoped diff**

Confirm only the intended Inspire hunks were added and no unrelated dirty-worktree changes were removed.
