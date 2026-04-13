# Insights Blog Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the `Insights e Blog` page so it shows a stronger editorial hierarchy, month/category filters with immediate updates, and fewer grid posts at once with `Carregar mais`.

**Architecture:** Keep `src/pages/InsightsBlog.jsx` as the page coordinator, but move the sorting and filtering rules into a small pure helper module so the behavioral logic can be covered independently from the UI. The page will fetch the full lightweight post archive from Sanity, derive featured posts and filter options from that result, and continue using `ProjectCard` only for the lower grid feed.

**Tech Stack:** React 19, Vite, Vitest, Testing Library, Tailwind utility classes, Sanity client

---

## File Map

- Modify: `src/pages/InsightsBlog.jsx`
  Purpose: Fetch listing data, hold filter state, reset visible count on filter changes, render featured area, filter bar, grid, empty state, and `Carregar mais`.
- Create: `src/pages/insightsBlogFeed.js`
  Purpose: Pure helpers for post normalization, date sorting, month/category option derivation, filtering, and featured/grid splitting.
- Create: `src/pages/insightsBlogFeed.test.js`
  Purpose: Unit coverage for the filtering and splitting rules.
- Create: `src/pages/InsightsBlog.test.jsx`
  Purpose: Integration coverage for the page UI with mocked Sanity responses.
- Modify: `src/data/blogPosts.js`
  Purpose: Add `publishedAt` fallback values so the redesigned page keeps meaningful filters if the Sanity fetch fails.

### Task 1: Cover the feed rules with failing unit tests

**Files:**
- Create: `src/pages/insightsBlogFeed.js`
- Create: `src/pages/insightsBlogFeed.test.js`

- [ ] **Step 1: Write the failing test**

Using `@test-driven-development`, add unit tests that assert:
- dated posts sort newest-first
- undated posts sort after dated posts
- month options derive from `publishedAt` values in newest-first order
- category options include `Sem categoria` when a post has no `eyebrow`
- category filtering matches by `OR`
- month plus category filtering combines with `AND`
- featured splitting returns `1` primary feature, up to `3` secondary features, and the remaining grid posts

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/pages/insightsBlogFeed.test.js`
Expected: FAIL because the helper module does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create `src/pages/insightsBlogFeed.js` with narrowly scoped helpers:
- `normalizeInsightsPost(post)`
- `sortInsightsPosts(posts)`
- `getMonthOptions(posts)`
- `getCategoryOptions(posts)`
- `filterInsightsPosts(posts, filters)`
- `splitInsightsPosts(posts)`

Implementation rules:
- use a stable month key such as `YYYY-MM`
- format month labels for `pt-BR`
- keep undated posts visible only under `Todos os períodos`
- keep undated posts behind dated posts in the sorted output
- prevent undated posts from becoming featured while dated filtered posts still exist

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/pages/insightsBlogFeed.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/insightsBlogFeed.js src/pages/insightsBlogFeed.test.js docs/superpowers/plans/2026-04-13-insights-blog-layout.md
git commit -m "test: cover insights blog feed rules"
```

### Task 2: Cover the editorial layout and `Carregar mais` with a failing page test

**Files:**
- Create: `src/pages/InsightsBlog.test.jsx`
- Modify: `src/pages/InsightsBlog.jsx`

- [ ] **Step 1: Write the failing test**

Mock `client.fetch` with a dataset of at least 24 dated posts and assert that the page:
- requests post listings including `publishedAt`
- does not keep the old `[0...50]` Sanity slice in the query
- shows a stable loading treatment before the fetched archive resolves
- renders `1` primary featured story
- renders `3` secondary featured stories
- renders exactly `10` grid posts below the featured area on first load
- reveals `10` more grid posts when `Carregar mais` is clicked

Use explicit selectors or `data-testid` values for:
- the primary feature wrapper
- the secondary feature list
- the grid container

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/pages/InsightsBlog.test.jsx`
Expected: FAIL because the page still renders one flat grid and keeps the old limited query.

- [ ] **Step 3: Write minimal implementation**

Update `src/pages/InsightsBlog.jsx` to:
- fetch the full lightweight archive with `publishedAt`
- use the new helper module to sort and split posts
- render a stable page-level loading treatment before the fetch resolves
- render the approved featured layout
- keep `ProjectCard` only in the lower grid
- initialize grid visibility at `10`
- increase the visible grid count by `10` per click

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/pages/InsightsBlog.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/InsightsBlog.jsx src/pages/InsightsBlog.test.jsx
git commit -m "feat: add editorial insights blog layout"
```

### Task 3: Cover reactive filters, empty state, and fallback data

**Files:**
- Modify: `src/pages/InsightsBlog.test.jsx`
- Modify: `src/pages/InsightsBlog.jsx`
- Modify: `src/data/blogPosts.js`

- [ ] **Step 1: Write the failing test**

Extend `src/pages/InsightsBlog.test.jsx` so it asserts:
- changing the month filter updates results immediately
- toggling multiple category chips updates results immediately
- multiple active categories match by `OR`
- month plus categories match by `AND`
- after clicking `Carregar mais`, changing any filter resets the visible grid back to `10`
- no-result combinations show the empty state
- clicking `Limpar filtros` restores the default listing
- when `client.fetch` rejects, fallback `staticBlogPosts` still produce a usable featured area and filter controls

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/pages/InsightsBlog.test.jsx`
Expected: FAIL because the page still lacks reactive filter controls, empty-state handling, and dated fallback content.

- [ ] **Step 3: Write minimal implementation**

Update `src/pages/InsightsBlog.jsx` and `src/data/blogPosts.js` to:
- derive month options from loaded posts
- render a `Todos os períodos` control plus concrete month options
- render category chips with active/inactive styling
- update filters immediately on interaction
- reset visible grid count to `10` whenever filters change
- show `Limpar filtros` only when filters are active or no results are found
- add realistic `publishedAt` values to `staticBlogPosts` so fallback filtering stays meaningful

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/pages/InsightsBlog.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/InsightsBlog.jsx src/pages/InsightsBlog.test.jsx src/data/blogPosts.js
git commit -m "feat: add reactive insights blog filters"
```

### Task 4: Verify the integrated behavior

**Files:**
- Modify: `src/pages/InsightsBlog.jsx`
- Modify: `src/pages/insightsBlogFeed.js`
- Modify: `src/pages/InsightsBlog.test.jsx`
- Modify: `src/pages/insightsBlogFeed.test.js`
- Modify: `src/data/blogPosts.js`

- [ ] **Step 1: Run focused verification**

Run: `npm test -- --run src/pages/insightsBlogFeed.test.js src/pages/InsightsBlog.test.jsx`
Expected: PASS

- [ ] **Step 2: Run a final sanity check for the blog detail page**

Run: `npm test -- --run src/pages/PostDetail.test.jsx`
Expected: PASS

- [ ] **Step 3: Review the page manually in the browser**

Run: `npm run dev`
Verify:
- the featured area collapses cleanly on mobile
- the month filter and category chips respond immediately
- `Carregar mais` expands only the filtered grid
- empty state and `Limpar filtros` feel consistent with the rest of the page
