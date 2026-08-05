# Silvana Production Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the approved Silvana memorial experience while leaving every other production build input unchanged and preserving every existing memorial record.

**Architecture:** Reconstruct the current production source snapshot from immutable Vercel deployment files, then replace only a strict memorial allowlist with files from the approved historical deployment. Validate the complete source delta, deploy a preview, capture record hashes, promote that exact preview, and verify production plus record integrity.

**Tech Stack:** Vercel CLI/API, PowerShell, Vite, Vitest, React, Node.js, PostgreSQL via the existing serverless API.

---

### Task 1: Reconstruct immutable deployment snapshots

**Files:**
- Read: Vercel deployment `dpl_Amq7EgJRhXtXmizyeD5EXpRqWtsu`
- Read: Vercel deployment `dpl_4bZL22jXvpRxwZgw22gWvYpPFpfT`
- Create: disposable directories under the system temporary directory

- [ ] **Step 1: Resolve and verify exact targets**

Run `npx vercel api /v13/deployments/<id>` for both IDs.

Expected: both belong to project `prj_NthW5c3oFvkvRBWmbvNvle836TYR`; the current ID is promoted production and the desired ID has source branch `codex/memorial-experience-checkup`.

- [ ] **Step 2: Create explicit temporary paths**

Use `New-Item -ItemType Directory` beneath `[System.IO.Path]::GetTempPath()` with unique GUID suffixes for `current`, `desired`, and `hybrid`. Resolve the paths and verify all three remain below the system temporary directory before any recursive copy or removal.

- [ ] **Step 3: Download immutable source trees**

Call `GET /v6/deployments/<id>/files`. Traverse the `src` node, and for each source file call `GET /v7/deployments/<id>/files/<uid>`. Decode the returned base64 `data` into the corresponding temporary path.

Expected: every reconstructed file's SHA-1 equals its Vercel `uid`.

- [ ] **Step 4: Create the hybrid base**

Copy the exact reconstructed current snapshot to `hybrid` using native PowerShell file operations.

Expected: a recursive path/SHA-1 comparison reports zero differences between `current` and `hybrid`.

### Task 2: Overlay only the memorial allowlist

**Files:**
- Modify in disposable hybrid only:
  - `api/_lib/memorialRequest.js`
  - `api/_lib/memorialStore.js`
  - `api/memorial/notes.js`
  - `api/memorial/notes/[id].js`
  - `public/memorial/silvana-poster.webp`
  - `src/components/memorial/MemorialAccessForm.jsx`
  - `src/components/memorial/MemorialBoard.jsx`
  - `src/components/memorial/MemorialDust.jsx`
  - `src/components/memorial/MemorialVideo.jsx`
  - `src/lib/memorialApi.js`
  - `src/lib/memorialPresentation.js`
  - `src/lib/memorialVideoConfig.js`
  - `src/pages/SilvanaMemorial.css`
  - `src/pages/SilvanaMemorial.jsx`
  - `src/seo/memorialMetadata.js`
- Test files copied from the desired artifact:
  - `scripts/generate-static-seo.test.js`
  - `api/_lib/memorialRequest.test.js`
  - `api/_lib/memorialStore.test.js`
  - `api/memorial/notes.test.js`
  - `api/memorial/notes/[id].test.js`
  - `src/SilvanaRoute.test.jsx`
  - `src/components/memorial/MemorialAccessForm.test.jsx`
  - `src/components/memorial/MemorialBoard.test.jsx`
  - `src/components/memorial/MemorialDust.test.jsx`
  - `src/components/memorial/MemorialVideo.test.jsx`
  - `src/lib/memorialApi.test.js`
  - `src/lib/memorialPresentation.test.js`
  - `src/pages/SilvanaMemorial.styles.test.js`
  - `src/pages/SilvanaMemorial.test.jsx`

- [ ] **Step 1: Copy runtime allowlist from desired to hybrid**

Use `Copy-Item -LiteralPath` for each exact path. Fail if any source is missing or any destination resolves outside `hybrid`.

- [ ] **Step 2: Copy focused tests from desired to hybrid**

Copy each of the fourteen exact test paths listed above. Fail if any path is missing.

- [ ] **Step 3: Prove the source boundary**

Recursively hash `current` and `hybrid`. Compare added, removed, and changed paths against the runtime and test allowlists.

Expected: added, removed, and changed paths match the two immutable manifests and remain a subset of the explicit runtime and fourteen-file test allowlists. Every allowlisted path present in the desired deployment contains its desired deployment SHA-1; no unallowlisted path differs.

### Task 3: Verify behavior before deployment

**Files:**
- Test: focused memorial tests in the disposable hybrid
- Build: disposable `hybrid/dist`

- [ ] **Step 1: Install exact locked dependencies**

Run `npm ci` in `hybrid`.

Expected: exit code 0 with no lockfile mutation.

- [ ] **Step 2: Run focused tests**

Run Vitest for the copied memorial API, component, route, page, and style tests.

Expected: all focused tests pass.

- [ ] **Step 3: Run complete tests**

Run `npm test`.

Expected: exit code 0.

- [ ] **Step 4: Build production artifact**

Run `npm run build`.

Expected: exit code 0; `dist/silvana-bettiol.html` exists and contains the approved memorial metadata.

### Task 4: Preview and non-destructive validation

**Files:**
- Create: Vercel preview deployment from disposable `hybrid`

- [ ] **Step 1: Link the disposable hybrid to the existing project**

Copy only `.vercel/project.json` from the workspace link into `hybrid/.vercel/project.json`; verify its project and org IDs.

- [ ] **Step 2: Remove validation-only test overlays**

For each of the fourteen test paths, restore the file from the reconstructed current snapshot if it existed there; otherwise remove only that exact file from `hybrid` after verifying the resolved target remains below `hybrid`.

Expected: no desired-deployment test file remains in the upload delta, including tests under `api/` that Vercel would otherwise expose as serverless functions.

- [ ] **Step 3: Re-prove the source boundary immediately before upload**

Recalculate the recursive current-versus-hybrid path/SHA-1 delta after install, tests, build, linking, and test restoration. Exclude only `.vercel`, `node_modules`, and `dist` from both sides.

Expected: the remaining delta is restricted exactly to runtime allowlist paths that differ between the two immutable deployments. Fail before upload if any test or other build input changed.

- [ ] **Step 4: Deploy preview**

Run `npx vercel deploy --yes` from `hybrid`.

Expected: a unique preview URL with status `READY`; production aliases remain unchanged.

- [ ] **Step 5: Smoke-test public routes**

Request `/`, `/quem-somos`, `/nossa-abordagem`, `/o-que-fazemos`, `/cases`, `/tecnologia`, `/academia-otimiza`, `/contato`, `/inspire`, and `/silvana-bettiol` on preview.

Expected: HTTP 200 for all. Non-memorial pages retain their current headings and metadata; the memorial uses the desired full name, scroll cue, board behavior, and social metadata.

- [ ] **Step 6: Validate preview API without writes**

GET `/api/memorial/notes` on preview.

Expected: success with the same persistent database records; do not call POST, PATCH, or DELETE.

### Task 5: Promote the validated artifact and verify integrity

**Files:**
- Update: Vercel production alias only
- Read: memorial records through GET before and after promotion

- [ ] **Step 1: Capture the pre-promotion record snapshot**

GET production `/api/memorial/notes`. Sort object keys and records by ID, then calculate a SHA-256 for each complete returned record. Store only IDs and hashes in memory or the temporary directory.

- [ ] **Step 2: Promote the exact preview**

Run `npx vercel promote <preview-url> --yes`.

Expected: the same preview deployment becomes production without rebuilding.

- [ ] **Step 3: Verify production routes and memorial**

Repeat all route smoke tests against `https://otimiza-site.vercel.app` and inspect the production deployment ID.

Expected: HTTP 200, desired memorial behavior, and production now references the promoted preview ID.

- [ ] **Step 4: Prove record preservation**

GET production `/api/memorial/notes` again and recalculate per-record hashes.

Expected: every pre-promotion ID is present with the same hash; additional IDs are allowed.

- [ ] **Step 5: Scan post-deploy errors**

Run `npx vercel logs <production-deployment-url> --level error --since 1h` or the closest supported bounded equivalent.

Expected: no new memorial-related errors.

### Task 6: Recovery fallback and cleanup

- [ ] **Step 1: Roll back only if a production verification fails**

Run `npx vercel promote otimiza-site-nsqk6ljfb-joaos-projects-d59362fd.vercel.app --yes`.

Expected: current deployment `dpl_Amq7EgJRhXtXmizyeD5EXpRqWtsu` regains production aliases; database remains untouched.

- [ ] **Step 2: Clean disposable directories**

Resolve each temporary directory again, verify it remains under the system temporary root and has the expected unique recovery prefix, then remove only those directories recursively.

- [ ] **Step 3: Record the result**

Report preview/production URLs, promoted deployment ID, tests, route checks, error scan, and record-integrity result without exposing message text or secrets.
