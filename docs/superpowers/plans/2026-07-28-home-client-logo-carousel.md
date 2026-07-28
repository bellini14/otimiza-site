# Home client logo carousel implementation plan

**Goal:** Publish exactly the 27 approved, optically normalized client logos on
the home page and store their sectors and assets in Sanity.

**Architecture:** A manifest is the single source of truth for the approved
records. A Node script validates and normalizes the reviewed source images,
uploads them to Sanity, reuses unambiguous existing documents, disables
`showOnHome` for all non-approved documents, and verifies the final dataset.
The home fallback mirrors the manifest's ordered brand list and uses the same
normalized CDN assets after synchronization.

**Tech stack:** React, Vitest, Sharp, Sanity HTTP API/CLI authentication, Vite,
Vercel.

---

## Task 1: Lock the approved fallback behavior with a failing test

**Files:**
- Modify: `src/pages/HomeClientLogos.test.jsx`

1. Add a fallback test that rejects the Sanity request.
2. Assert all 27 approved accessible image names appear.
3. Assert old non-approved fallback brands do not appear.
4. Run `npx vitest run src/pages/HomeClientLogos.test.jsx` and confirm failure.

## Task 2: Create and validate the logo manifest

**Files:**
- Create: `scripts/home-client-logos/manifest.mjs`
- Create: `scripts/home-client-logos/manifest.test.mjs`

1. Encode the 27 ordered records, sectors, source paths, alt text, aliases and
   verified websites.
2. Test exact count, unique IDs/names/order, valid schema sectors and existing
   source files.
3. Run the manifest test and confirm it passes.

## Task 3: Normalize approved assets

**Files:**
- Create: `scripts/home-client-logos/normalize.mjs`
- Create: `scripts/home-client-logos/normalize.test.mjs`
- Create: `public/client-logos/home/*.png`

1. Add failing tests for lossless PNG output, transparent padding, maximum long
   edge and visible bounding-box occupancy.
2. Implement SVG/raster ingestion, near-white border trimming, restricted
   white-only recoloring and 8% transparent padding.
3. Generate all 27 normalized assets and a review contact sheet.
4. Compare the sheet against the approved source preview.
5. Run the normalization tests and confirm they pass.

## Task 4: Update the home fallback

**Files:**
- Modify: `src/pages/Home.jsx`

1. Replace the old fallback list with the ordered 27-record manifest output.
2. Keep the existing two-row marquee, display bounds and hover treatment.
3. Run the focused home tests and confirm they pass.

## Task 5: Synchronize and verify Sanity

**Files:**
- Create: `scripts/home-client-logos/sync-sanity.mjs`

1. Resolve authenticated Sanity access without exposing credentials.
2. Query existing `clientLogo` documents and reject ambiguous alias matches.
3. Upload each normalized PNG.
4. Upsert the 27 records while preserving unrelated case fields.
5. Set `showOnHome: false` on every non-approved client document.
6. Query the public dataset and verify exact count, order, uniqueness, sectors
   and defined asset references.
7. Replace local fallback asset URLs with the resulting Sanity CDN URLs.

## Task 6: Verify and publish

1. Run focused tests, then `npm test`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Start a local production preview and visually inspect the home carousel at
   desktop and mobile widths.
5. Deploy the current verified workspace to the linked Vercel production
   project.
6. Open production, verify the deployment is healthy and confirm the carousel
   contains the 27 approved brands without old extras or duplicates.

