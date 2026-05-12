# Post Like Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing post like interaction into a minimal circular heart toggle that supports both like and unlike with a shared count.

**Architecture:** Extend the existing likes API with a safe decrement path and expose matching client helpers. Keep `PostLikeButton` as the single reusable UI component for feed and detail, but simplify the markup and styles so the button is only the circular heart while the count stays outside.

**Tech Stack:** Vercel API routes, Postgres store helper, React, Vitest, Testing Library, CSS

---

### Task 1: Add backend toggle coverage

**Files:**
- Modify: `api/posts/[slug]/likes.test.js`
- Modify: `api/_lib/postLikesStore.js`
- Modify: `api/posts/[slug]/likes.js`

- [ ] **Step 1: Write failing tests for unlike behavior**
- [ ] **Step 2: Run `npm test -- api/posts/[slug]/likes.test.js` and confirm the new unlike assertions fail**
- [ ] **Step 3: Implement `DELETE` handling and guarded decrement support**
- [ ] **Step 4: Re-run `npm test -- api/posts/[slug]/likes.test.js` and confirm it passes**

### Task 2: Add client and component toggle coverage

**Files:**
- Modify: `src/components/PostLikeButton.test.jsx`
- Modify: `src/pages/PostDetail.test.jsx`
- Modify: `src/pages/Inspire.test.jsx`
- Modify: `src/lib/postLikes.js`
- Modify: `src/components/PostLikeButton.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Write failing tests for unlike toggling and the simplified circular button**
- [ ] **Step 2: Run `npm test -- src/components/PostLikeButton.test.jsx src/pages/PostDetail.test.jsx src/pages/Inspire.test.jsx` and confirm the new assertions fail**
- [ ] **Step 3: Implement client unlike helper, local-state removal, toggle logic, and minimal styles**
- [ ] **Step 4: Re-run `npm test -- src/components/PostLikeButton.test.jsx src/pages/PostDetail.test.jsx src/pages/Inspire.test.jsx` and confirm it passes**

### Task 3: Verify the integrated change

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test -- api/posts/[slug]/likes.test.js src/components/PostLikeButton.test.jsx src/pages/PostDetail.test.jsx src/pages/Inspire.test.jsx`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Review the diff for only the toggle-related files**
