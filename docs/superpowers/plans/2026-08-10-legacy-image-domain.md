# Legacy Image Domain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve matched WordPress-era images from `www.otm.com.br/wp-content/uploads` while retaining Sanity URLs for every unmatched asset.

**Architecture:** A generated manifest maps immutable Sanity asset IDs to checked-in legacy-media paths. `src/lib/legacyImageUrl.js` resolves a URL through that manifest without guessing; render boundaries invoke it for all image URLs. A Node generator and verification test make the mapping reproducible and prevent missing deployment files.

**Tech Stack:** Vite, React 19, Vitest, Node.js ESM, public Sanity GROQ API, Vercel static `public/` output.

---

### Task 1: Add the pure URL resolver

**Files:**
- Create: `src/data/legacyImageManifest.js`
- Create: `src/lib/legacyImageUrl.js`
- Create: `src/lib/legacyImageUrl.test.js`

- [ ] **Step 1: Write failing resolver tests**

```js
expect(resolveLegacyImageUrl('https://cdn.sanity.io/images/igy822g7/production/hash-300x200.jpg'))
  .toBe('https://www.otm.com.br/wp-content/uploads/2020/09/example.jpg')
expect(resolveLegacyImageUrl('https://cdn.sanity.io/images/igy822g7/production/new-hash-300x200.jpg'))
  .toBe('https://cdn.sanity.io/images/igy822g7/production/new-hash-300x200.jpg')
```

- [ ] **Step 2: Run test and verify it fails because the resolver is absent**

Run: `npm test -- src/lib/legacyImageUrl.test.js`

- [ ] **Step 3: Implement the minimal contract**

```js
export function resolveLegacyImageUrl(url) {
  const assetId = getSanityAssetId(url)
  const path = legacyImageManifest[assetId]
  return path ? `https://www.otm.com.br/${path}` : url
}
```

Only accept Sanity production URLs for this project. Preserve unmapped and non-Sanity URLs unchanged.

- [ ] **Step 4: Run the resolver test and verify it passes**

Run: `npm test -- src/lib/legacyImageUrl.test.js`

- [ ] **Step 5: Commit**

```bash
git add src/data/legacyImageManifest.js src/lib/legacyImageUrl.js src/lib/legacyImageUrl.test.js
git commit -m "feat: resolve legacy images on the OTM domain"
```

### Task 2: Generate and verify the legacy manifest

**Files:**
- Create: `scripts/generate-legacy-image-manifest.mjs`
- Create: `scripts/generate-legacy-image-manifest.test.mjs`
- Create: `scripts/verify-legacy-media.mjs`
- Create: `scripts/verify-legacy-media.test.mjs`
- Modify: `src/data/legacyImageManifest.js`
- Add selectively: `public/wp-content/uploads/**` files referenced by the manifest

- [ ] **Step 1: Write failing generator and verifier tests**

Use a fixture with an exact match, duplicate filename, and missing filename. Assert that only the exact match becomes a manifest entry, duplicate/missing assets are reported, and a manifest path outside `wp-content/uploads` fails verification.

- [ ] **Step 2: Run tests and verify the missing-script failure**

Run: `npm test -- scripts/generate-legacy-image-manifest.test.mjs scripts/verify-legacy-media.test.mjs`

- [ ] **Step 3: Implement deterministic generation**

The generator accepts `--legacy-root <directory>` and fetches Sanity asset `_id`, `originalFilename`, dimensions, and URL from the public API. It indexes the supplied archive, accepts only one safe match, writes sorted asset-ID keys, and emits a report for missing or ambiguous candidates. The verifier checks every manifest target is a relative `wp-content/uploads/` path and exists under `public/`.

- [ ] **Step 4: Generate the real manifest and materialize only referenced files**

Run the generator against `C:\Users\Joao\Desktop\Site otimiza\public\wp-content\uploads`, copy only mapped files into this worktree's `public/wp-content/uploads`, then run the verifier. Unmatched and ambiguous assets intentionally remain on Sanity.

- [ ] **Step 5: Run tests and verifier**

Run: `npm test -- scripts/generate-legacy-image-manifest.test.mjs scripts/verify-legacy-media.test.mjs && node scripts/verify-legacy-media.mjs`

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-legacy-image-manifest.mjs scripts/generate-legacy-image-manifest.test.mjs scripts/verify-legacy-media.mjs scripts/verify-legacy-media.test.mjs src/data/legacyImageManifest.js public/wp-content/uploads
git commit -m "feat: add legacy WordPress image manifest"
```

### Task 3: Apply the resolver at image-rendering boundaries

**Files:**
- Modify: `src/pages/Inspire.jsx`, `src/pages/PostDetail.jsx`, `src/pages/Home.jsx`, `src/pages/Cases.jsx`, `src/pages/QuemSomos.jsx`, `src/pages/NossaAbordagem.jsx`
- Modify: `src/components/InspireLayout.jsx`, `src/components/ui/blog-highlights.jsx`
- Modify: `scripts/generate-post-social-pages.mjs`
- Modify: their focused tests

- [ ] **Step 1: Write failing integration tests**

Add a mapped Sanity URL to an Inspire/PostDetail fixture and static social-page fixture. Assert rendered `img.src` and generated `og:image` use the OTM URL; retain an assertion that an unmapped asset stays on Sanity.

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `npm test -- src/pages/Inspire.test.jsx src/pages/PostDetail.test.jsx scripts/generate-post-social-pages.test.mjs`

- [ ] **Step 3: Resolve only final image URLs**

Call `resolveLegacyImageUrl` after GROQ `asset->url` data is received and after every `urlFor(...).url()` result. Do not mutate Sanity content or static/local paths. Use the same resolver for social metadata.

- [ ] **Step 4: Run integration tests**

Run: `npm test -- src/pages/Inspire.test.jsx src/pages/PostDetail.test.jsx src/components/InspireLayout.test.jsx src/pages/Home.test.jsx src/pages/Cases.test.jsx src/pages/QuemSomos.test.jsx src/pages/NossaAbordagem.test.jsx scripts/generate-post-social-pages.test.mjs`

- [ ] **Step 5: Commit**

```bash
git add src/pages src/components scripts/generate-post-social-pages.mjs
git commit -m "feat: serve matched legacy images from OTM"
```

### Task 4: Verify release readiness

**Files:**
- Modify: `package.json` only if a `verify:legacy-media` script is necessary

- [ ] **Step 1: Run focused tests, media verification, and production build**

```bash
npm test -- src/lib/legacyImageUrl.test.js scripts/generate-legacy-image-manifest.test.mjs scripts/verify-legacy-media.test.mjs scripts/generate-post-social-pages.test.mjs
node scripts/verify-legacy-media.mjs
$env:VITE_SITE_URL='https://www.otm.com.br'; npm run build
```

- [ ] **Step 2: Inspect scope and commit remaining verification wiring**

Run: `git diff --check && git status --short`
