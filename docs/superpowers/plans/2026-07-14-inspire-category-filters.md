# Inspire Category Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Inspire feed's `Para você`/`Em destaque` tabs with functional, single-select category filters that preserve category-aware infinite loading and static fallback behavior.

**Architecture:** Keep the feature inside the existing Inspire page. A small pure helper owns normalized local category matching; Sanity uses canonical `eyebrow` values in a category-restricted paginated query, while static fallback posts expose `inspireCategory`. Separate all-feed and category-feed state makes restoring `Tudo` deterministic, an explicit `pending | sanity | fallback` source status resolves bootstrap races, and request sequencing prevents stale category responses from replacing the newest filter selection.

**Tech Stack:** React 19, React Router, Sanity GROQ, Vitest, Testing Library, CSS.

---

## File Structure

- Modify `src/lib/blogFilters.js`: add normalized Inspire category matching for local fallback data.
- Create `src/lib/blogFilters.test.js`: cover diacritic, case, whitespace, and all-category behavior.
- Modify `src/data/blogPosts.js`: assign the approved `inspireCategory` mapping without changing existing eyebrows.
- Modify `src/pages/Inspire.jsx`: category configuration, query selection, request sequencing, reset behavior, filter controls, and empty state.
- Modify `src/pages/Inspire.test.jsx`: protect requested labels, filtering, pagination, stale response handling, fallback, search independence, and empty state.
- Modify `src/index.css`: horizontal filter overflow and empty-state presentation.

### Task 1: Pure category matching and fallback metadata

**Files:**
- Create: `src/lib/blogFilters.test.js`
- Modify: `src/lib/blogFilters.js`
- Modify: `src/data/blogPosts.js`

- [ ] **Step 1: Write the failing helper tests**

Add focused tests for the wished-for API:

```js
import { describe, expect, it } from 'vitest'
import { matchesInspireCategory } from './blogFilters'

describe('matchesInspireCategory', () => {
  it('matches local Inspire categories without case, accent, or outer-space sensitivity', () => {
    expect(matchesInspireCategory({ inspireCategory: '  Lente Analitica ' }, 'Lente Analítica')).toBe(true)
  })

  it('uses the Sanity eyebrow when no local Inspire category is present', () => {
    expect(matchesInspireCategory({ eyebrow: 'DICA DE LEITURA' }, 'Dica de leitura')).toBe(true)
  })

  it('accepts every post when no category is selected', () => {
    expect(matchesInspireCategory({ eyebrow: 'Artigos' }, null)).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- src/lib/blogFilters.test.js`

Expected: FAIL because `matchesInspireCategory` is not exported.

- [ ] **Step 3: Implement the minimal helper**

Add accent normalization and match `post.inspireCategory ?? post.eyebrow` against the selected canonical label. A null category returns `true`.

```js
export function normalizeInspireCategory(value) {
  if (!value || typeof value !== 'string') return ''
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function matchesInspireCategory(post, category) {
  if (!category) return true
  return normalizeInspireCategory(post.inspireCategory ?? post.eyebrow) === normalizeInspireCategory(category)
}
```

- [ ] **Step 4: Add the approved fallback assignments**

Add `inspireCategory` to all eleven objects exactly as specified in `docs/superpowers/specs/2026-07-14-inspire-category-filters-design.md`; do not replace `eyebrow`.

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run: `npm test -- src/lib/blogFilters.test.js`

Expected: PASS, 3 tests.

### Task 2: Replace the tabs with accessible category controls

**Files:**
- Modify: `src/pages/Inspire.test.jsx`
- Modify: `src/pages/Inspire.jsx`

- [ ] **Step 1: Write a failing control-and-filter test**

Build Sanity posts with canonical `eyebrow` values, render the page, and assert:

```jsx
const filters = screen.getByRole('group', { name: 'Filtrar artigos por categoria' })
expect(within(filters).getAllByRole('button').map((button) => button.textContent)).toEqual([
  'Tudo',
  'Artigos',
  'Dica de leitura',
  'Dica para assistir',
  'Lente analítica',
])
expect(within(filters).getByRole('button', { name: 'Tudo' })).toHaveAttribute('aria-pressed', 'true')
expect(screen.queryByRole('tab', { name: 'Para você' })).not.toBeInTheDocument()
expect(screen.queryByRole('tab', { name: 'Em destaque' })).not.toBeInTheDocument()
```

Click `Artigos`, resolve the category request with only an article post, and verify the article is rendered, unrelated initial posts are removed, and the selected state moves to `Artigos`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/pages/Inspire.test.jsx -t "filters the Inspire feed by the requested categories"`

Expected: FAIL because the current page still exposes the two old tabs.

- [ ] **Step 3: Implement configuration and first-batch category loading**

Add immutable configuration near the query constants:

```js
const INSPIRE_FILTERS = [
  { key: 'all', label: 'Tudo', category: null },
  { key: 'articles', label: 'Artigos', category: 'Artigos' },
  { key: 'reading-tip', label: 'Dica de leitura', category: 'Dica de Leitura' },
  { key: 'watch-tip', label: 'Dica para assistir', category: 'Dica para assistir' },
  { key: 'analytical-lens', label: 'Lente analítica', category: 'Lente Analítica' },
]
```

Create a category GROQ query with `eyebrow == $category`, the same projection as the all-post query, and `$start...$end` pagination. Replace `activeTab` with `activeFilterKey`, derive `activeFilter`, and implement an async filter-change handler that:

- immediately updates the selected key;
- resets category errors and first-batch loading state;
- reads an explicit `sourceStatus` whose initial value is `pending`, rather than treating an empty cache as confirmed fallback;
- waits for bootstrap resolution when the source is still `pending`;
- restores the preserved all-feed state when `Tudo` is selected;
- filters `STATIC_FALLBACK_POSTS` with `matchesInspireCategory` when the confirmed source is `fallback`;
- otherwise fetches the first matching Sanity batch with `{ category, start: 0, end: 15 }`.

Keep the two feeds distinct:

```js
const [allFeed, setAllFeed] = useState({ posts: initialPosts, nextOffset: initialPosts.length, hasMore: initialHasMore })
const [categoryFeed, setCategoryFeed] = useState({ posts: [], nextOffset: 0, hasMore: false })
const visibleFeed = activeFilter.category ? categoryFeed : allFeed
```

The sidebar remains derived from `allFeed.posts`. Switching back to `Tudo` therefore restores the original loaded articles, offset, and `hasMore` without reconstructing them from category results.

Use a monotonically increasing request id in a ref. Only the latest id may commit category results, offset, and `hasMore`.

When the initial all-post request resolves, set `sourceStatus` first. If the current filter (read from a ref, not a stale effect closure) is `Tudo`, commit the all feed normally. If a category is already selected, preserve the all feed for later restoration and immediately resolve that category against the confirmed source. A failed bootstrap performs the same reconciliation using fallback posts.

- [ ] **Step 4: Render the new controls and empty state**

Replace the old tab markup with a group of five native buttons. Use the existing `inspire-page__tab` class and `is-active`, but expose selection with `aria-pressed`. Render `Nenhum artigo encontrado nesta categoria.` when a non-search, non-loading category response is empty.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run: `npm test -- src/pages/Inspire.test.jsx -t "filters the Inspire feed by the requested categories"`

Expected: PASS.

### Task 3: Preserve pagination, request ordering, search, and fallback behavior

**Files:**
- Modify: `src/pages/Inspire.test.jsx`
- Modify: `src/pages/Inspire.jsx`

- [ ] **Step 1: Write failing behavior tests**

Add separate tests that verify:

1. Intersecting the sentinel after selecting `Dica de leitura` requests `{ category: 'Dica de Leitura', start: 15, end: 20 }` and appends the returned posts.
2. Two deferred category requests resolved out of order leave the latest selected category visible.
3. A rejected initial Sanity request activates fallback; selecting each requested category shows only posts with that `inspireCategory` and at least one result.
4. `/inspire?q=...` hides the filter group and returns search results independently of the retained filter state.
5. A category response with no items renders the explicit empty state.
6. Clicking a category before the initial Sanity request resolves does not show fallback data; after bootstrap succeeds it issues the correct category Sanity request and displays that response.

- [ ] **Step 2: Run the new tests and verify RED**

Run: `npm test -- src/pages/Inspire.test.jsx`

Expected: the new pagination/request-order/fallback/empty assertions fail while existing tests continue to identify any regressions.

- [ ] **Step 3: Make load-more category-aware**

Refactor `loadMorePosts` so the source and destination feed are selected from current state:

- static fallback: slice the already category-filtered static collection and append to the applicable feed;
- dynamic `Tudo`: use the existing all-post query, append to `allFeed`, and continue caching merged results;
- dynamic category: use the category query, pass the canonical `category` value, append to `categoryFeed`, and never update the all-post cache.

Keep the sentinel available for every non-search filter when `hasMore` is true. Update callback/effect dependencies so switching filters cannot use a stale offset or category.

- [ ] **Step 4: Guard all asynchronous category writes**

Increment the request id on every filter change and on unmount. Check it before every state write originating from a category request. Reconcile the global initial request through `sourceStatus` and the current filter ref, preventing it from overwriting an actively selected category while still preserving its result in `allFeed` for a later return to `Tudo`.

- [ ] **Step 5: Update older tab assertions**

Replace existing assertions for `Para você` and `Em destaque` with the new group, labels, and initial `aria-pressed` state. Do not weaken unrelated Inspire shell, route, like, or sidebar assertions.

- [ ] **Step 6: Run the full Inspire test file and verify GREEN**

Run: `npm test -- src/pages/Inspire.test.jsx`

Expected: all Inspire tests PASS with no unhandled promise warnings.

### Task 4: Responsive editorial styling and final verification

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add focused source assertions for responsive filter styling**

Extend the Inspire test or an existing CSS source test to assert the filter container provides horizontal overflow and buttons do not shrink or wrap at the mobile breakpoint. This test must fail before the CSS change.

- [ ] **Step 2: Run the style assertion and verify RED**

Run the specific test identified in Step 1.

Expected: FAIL because no overflow/no-wrap rules exist.

- [ ] **Step 3: Implement restrained responsive CSS**

Retain the existing typography, divider, spacing, opacity, and underline. Add scrollbar-safe horizontal overflow to `.inspire-page__tabs`, prevent `.inspire-page__tab` from shrinking or wrapping, and style `.inspire-page__empty` as a quiet bordered editorial message. At `max-width: 720px`, reduce the inter-filter gap without changing labels.

- [ ] **Step 4: Run focused tests, full tests, lint, and build**

Run:

```powershell
npm test -- src/lib/blogFilters.test.js src/pages/Inspire.test.jsx
npm test
npm run lint
npm run build
```

Expected: all commands exit 0. If lint reports pre-existing errors unrelated to touched files, run ESLint on the touched files and report both results accurately rather than modifying unrelated user work.

- [ ] **Step 5: Browser verification**

Start the Vite app and inspect `/inspire` at desktop and mobile widths. Verify all five labels, active underline, filter results, empty state, horizontal overflow, infinite loading, and search behavior. Check the browser console for errors.

- [ ] **Step 6: Review the final diff**

Run `git diff -- src/lib/blogFilters.js src/lib/blogFilters.test.js src/data/blogPosts.js src/pages/Inspire.jsx src/pages/Inspire.test.jsx src/index.css` and confirm no unrelated local edits were removed or reformatted.
