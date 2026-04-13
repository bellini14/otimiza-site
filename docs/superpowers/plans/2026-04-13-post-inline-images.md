# Post Inline Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow editors to insert images inside blog post body content and render those images correctly on the site, including future WordPress imports.

**Architecture:** Expand the Sanity `post.content` schema from text-only Portable Text to a mixed array of text blocks and image blocks. Keep `mainImage` for the post hero while teaching the frontend detail page and WordPress importer to understand inline body images.

**Tech Stack:** Sanity Studio 3, Portable Text, React 19, Vite, Vitest, Testing Library

---

### Task 1: Cover the schema change with a failing test

**Files:**
- Create: `studio/schemaTypes/post.test.js`
- Modify: `studio/schemaTypes/index.js`

- [ ] **Step 1: Write the failing test**

Assert that:
- the `post` schema is registered
- `content` remains an array
- `content.of` accepts both `block` and `image`
- the image entry exposes `alt` and `caption`

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run studio/schemaTypes/post.test.js`
Expected: FAIL because `content` currently accepts only `block`.

- [ ] **Step 3: Write minimal implementation**

Update `studio/schemaTypes/post.js` so `content` accepts:
- `{ type: 'block' }`
- an image definition with `hotspot`, `alt`, and `caption`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run studio/schemaTypes/post.test.js`
Expected: PASS

### Task 2: Cover inline image rendering with a failing test

**Files:**
- Create: `src/pages/PostDetail.test.jsx`
- Modify: `src/pages/PostDetail.jsx`

- [ ] **Step 1: Write the failing test**

Assert that a fetched post containing an inline image block:
- renders the article title
- renders the body image
- uses the block `alt`
- renders the optional caption

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/pages/PostDetail.test.jsx`
Expected: FAIL because `PortableText` does not yet render custom image blocks.

- [ ] **Step 3: Write minimal implementation**

Add `PortableText` custom components for body images in `src/pages/PostDetail.jsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/pages/PostDetail.test.jsx`
Expected: PASS

### Task 3: Preserve inline images during WordPress import

**Files:**
- Modify: `studio/scripts/import-wordpress-posts.mjs`

- [ ] **Step 1: Update the HTML conversion path**

Convert `<img>` elements into Portable Text image blocks instead of stripping them.

- [ ] **Step 2: Keep import resilient**

Continue importing text when image download fails, but include body images whenever the source asset is reachable.

- [ ] **Step 3: Run a focused import verification**

Run the import script for a known post with body images and verify the stored `content` contains image blocks.

### Task 4: Verify the integrated behavior

**Files:**
- Modify: `studio/schemaTypes/post.js`
- Modify: `src/pages/PostDetail.jsx`
- Modify: `studio/scripts/import-wordpress-posts.mjs`

- [ ] **Step 1: Run focused tests**

Run: `npm test -- --run studio/schemaTypes/post.test.js src/pages/PostDetail.test.jsx`
Expected: PASS

- [ ] **Step 2: Verify imported content in Sanity**

Query one imported post and confirm `content` includes image objects mixed with text blocks.
