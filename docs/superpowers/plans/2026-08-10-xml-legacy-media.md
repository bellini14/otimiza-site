# XML Legacy Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish every legacy image attachment listed in `C:\Users\Joao\Desktop\MIDIA.xml` at its original `https://www.otm.com.br/wp-content/uploads/...` path.

**Architecture:** A generator parses only the WordPress `wp:attachment_url` nodes, filters image extensions, and materializes the matching source file into `public/wp-content/uploads`. It writes a sorted manifest used by a verification script, ensuring future changes can prove that every XML-listed image remains present without committing the XML export itself.

**Tech Stack:** Node.js ESM, Node test runner, Vite static public directory, Vercel Git deployment.

---

### Task 1: Generator and parser regression test

**Files:**
- Create: `scripts/generate-xml-legacy-media.mjs`
- Create: `scripts/generate-xml-legacy-media.test.mjs`

- [ ] Write a failing test proving that the generator retains image attachment URLs and rejects non-image attachment URLs.
- [ ] Run the test and confirm it fails because the generator does not exist.
- [ ] Implement the minimal XML parser and image filter.
- [ ] Run the focused test and confirm it passes.

### Task 2: Materialize and verify XML attachments

**Files:**
- Create: `scripts/xml-legacy-media-manifest.json`
- Create: `scripts/verify-xml-legacy-media.mjs`
- Create: `scripts/verify-xml-legacy-media.test.mjs`
- Create: `public/wp-content/uploads/**` (only the image attachment paths from the XML)

- [ ] Write a failing test proving that the verifier rejects an absent manifest asset.
- [ ] Run the test and confirm it fails.
- [ ] Generate the manifest from `MIDIA.xml`, copy its 1,190 source images, and implement the verifier.
- [ ] Run focused tests plus the full verifier; confirm every listed path is an image file.

### Task 3: Build and production validation

**Files:**
- Modify: generated static assets only

- [ ] Run the production build using `https://www.otm.com.br` as the site URL.
- [ ] Commit and push the isolated branch.
- [ ] Validate the Vercel preview, merge, and confirm production responses have image MIME types for the full manifest.
