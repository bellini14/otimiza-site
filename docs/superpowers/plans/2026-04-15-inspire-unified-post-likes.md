# Inspire Unified Post Likes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reuse one post like interaction in both the Inspire feed and the article detail page with the same persistence, animation, count source, and visual treatment.

**Architecture:** Extract the existing detail-page like behavior into a focused `PostLikeButton` component that owns count loading, local liked state, submission, and animation. Keep `src/lib/postLikes.js` as the shared client API/storage layer and wire both `PostDetail` and `Inspire` to the new component with small presentation variants only where spacing differs.

**Tech Stack:** React, React Router, Vitest, Testing Library, Vercel Functions, localStorage

---

### Task 1: Add failing coverage for the shared like interaction

**Files:**
- Create: `src/components/PostLikeButton.test.jsx`
- Modify: `src/pages/PostDetail.test.jsx`
- Modify: `src/pages/Inspire.test.jsx`

- [ ] **Step 1: Write the failing tests**

```jsx
it('renders the fetched count as the button label and disables after a successful like', async () => {
  render(<PostLikeButton slug="post-com-imagem-inline" />)
  expect(await screen.findByRole('button', { name: '7' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/PostLikeButton.test.jsx src/pages/PostDetail.test.jsx src/pages/Inspire.test.jsx`
Expected: FAIL because no reusable component exists yet and pages still rely on page-local/static like UI.

- [ ] **Step 3: Keep the failing expectations focused**

Cover:
- shared component fetches and shows the numeric count
- shared component reads `localStorage` and renders active immediately
- shared component increments on success and does not persist false likes on failure
- `PostDetail` consumes the shared component
- `Inspire` no longer renders a static `Curtir` action

- [ ] **Step 4: Re-run the targeted tests until the failures are for the missing component behavior only**

Run: `npm test -- src/components/PostLikeButton.test.jsx src/pages/PostDetail.test.jsx src/pages/Inspire.test.jsx`
Expected: FAIL on missing shared like behavior, not on unrelated route or layout issues.

### Task 2: Implement the reusable post like button

**Files:**
- Create: `src/components/PostLikeButton.jsx`
- Modify: `src/pages/PostDetail.jsx`
- Modify: `src/pages/Inspire.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Write the minimal shared component**

```jsx
function PostLikeButton({ slug, className, variant = 'default' }) {
  // load likes, read localStorage, submit POST, animate icon, render count label
}
```

- [ ] **Step 2: Replace page-local/static like UI with the shared component**

Use:
- `PostDetail`: replace inline like state, handler, and button markup
- `Inspire`: replace the feed `Curtir` action button in each story card

- [ ] **Step 3: Keep API/storage helpers unchanged unless a small shared helper improves reuse**

Only touch `src/lib/postLikes.js` if the component needs a narrow helper that belongs in the shared client layer.

- [ ] **Step 4: Run the targeted tests to verify they pass**

Run: `npm test -- src/components/PostLikeButton.test.jsx src/pages/PostDetail.test.jsx src/pages/Inspire.test.jsx`
Expected: PASS

### Task 3: Verify the unified experience

**Files:**
- Modify as needed: `src/components/PostLikeButton.jsx`, `src/pages/PostDetail.jsx`, `src/pages/Inspire.jsx`, `src/index.css`, related tests

- [ ] **Step 1: Run related API and page tests**

Run: `npm test -- api/posts/[slug]/likes.test.js src/components/PostLikeButton.test.jsx src/pages/PostDetail.test.jsx src/pages/Inspire.test.jsx`
Expected: PASS

- [ ] **Step 2: Run build verification**

Run: `npm run build`
Expected: build completes with exit code `0`

- [ ] **Step 3: Fix regressions and re-run the exact failing command**

Repeat until all targeted checks are clean.
