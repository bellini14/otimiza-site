# Post Likes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a global like counter for blog posts, persist the liked state per browser, and animate the heart icon after a successful like.

**Architecture:** Add a small Vercel API backed by Postgres for reading and incrementing per-post like counts, then connect `PostDetail` to that API while storing browser-local liked state in `localStorage`. Keep the database logic isolated from the route handler and keep client like helpers isolated from the page component so both sides stay testable.

**Tech Stack:** React, Vite, Vercel Functions, Postgres, Vitest, Testing Library

---

### Task 1: Add route-level coverage for the like API

**Files:**
- Create: `api/posts/[slug]/likes.test.js`
- Create: `api/_lib/postLikesStore.js`
- Create: `api/posts/[slug]/likes.js`

- [ ] **Step 1: Write the failing test**

```js
it('returns count for an existing post slug', async () => {
  const req = { method: 'GET', query: { slug: 'meu-post' } }
  const res = createMockResponse()

  await handler(req, res)

  expect(res.statusCode).toBe(200)
  expect(res.jsonBody).toEqual({ slug: 'meu-post', count: 7 })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- api/posts/[slug]/likes.test.js`
Expected: FAIL because the route does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ slug, count })
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- api/posts/[slug]/likes.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/posts/[slug]/likes.test.js api/_lib/postLikesStore.js api/posts/[slug]/likes.js
git commit -m "feat: add post likes api"
```

### Task 2: Add client-side coverage for like state and interaction

**Files:**
- Modify: `src/pages/PostDetail.test.jsx`
- Create: `src/lib/postLikes.js`
- Modify: `src/pages/PostDetail.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Write the failing test**

```jsx
it('marks the post as liked after a successful click and persists it locally', async () => {
  renderPostDetail()
  const button = await screen.findByRole('button', { name: /curtir/i })

  await user.click(button)

  expect(await screen.findByRole('button', { name: /curtido/i })).toBeDisabled()
  expect(window.localStorage.getItem('post-like:post-com-imagem-inline')).toBe('true')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/pages/PostDetail.test.jsx`
Expected: FAIL because the page does not yet load or submit like state.

- [ ] **Step 3: Write minimal implementation**

```jsx
const [likeCount, setLikeCount] = useState(null)
const [liked, setLiked] = useState(readLikedState(slug))

async function handleLikeClick() {
  const data = await likePost(slug)
  setLikeCount(data.count)
  setLiked(true)
  rememberLikedPost(slug)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/pages/PostDetail.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/PostDetail.test.jsx src/lib/postLikes.js src/pages/PostDetail.jsx src/index.css
git commit -m "feat: wire post likes into article detail"
```

### Task 3: Run verification for the like feature

**Files:**
- Modify as needed: `api/posts/[slug]/likes.js`, `api/_lib/postLikesStore.js`, `src/lib/postLikes.js`, `src/pages/PostDetail.jsx`, `src/pages/PostDetail.test.jsx`, `src/index.css`

- [ ] **Step 1: Run targeted tests**

Run: `npm test -- api/posts/[slug]/likes.test.js src/pages/PostDetail.test.jsx`
Expected: PASS

- [ ] **Step 2: Run broader related tests**

Run: `npm test -- src/pages/Inspire.test.jsx`
Expected: PASS

- [ ] **Step 3: Run build verification**

Run: `npm run build`
Expected: build completes with exit code `0`

- [ ] **Step 4: Fix regressions and re-run failing commands**

Re-run the exact failing command after each fix until clean.

- [ ] **Step 5: Commit**

```bash
git add api/posts/[slug]/likes.js api/_lib/postLikesStore.js src/lib/postLikes.js src/pages/PostDetail.jsx src/pages/PostDetail.test.jsx src/index.css package.json package-lock.json
git commit -m "feat: add persistent post likes"
```
