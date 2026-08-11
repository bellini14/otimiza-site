# Email Template Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure every image URL in the current Inspire email template is a real image file on `www.otm.com.br`.

**Architecture:** A focused regression test owns the twelve paths embedded in the supplied template. The deployment materializes those exact paths from the local legacy archive, using original files as aliases where the template asks for a WordPress thumbnail filename that was not preserved.

**Tech Stack:** Node.js ESM, Vitest, Vite public assets, Vercel static hosting.

---

### Task 1: Materialize email-template assets

**Files:**
- Create: `scripts/email-template-media.test.mjs`
- Add: `public/wp-content/uploads/**` for twelve template paths

- [ ] Write a failing test that checks every template path exists under `public`, has an image extension, and has non-zero bytes.
- [ ] Run the test and confirm the missing template assets cause the failure.
- [ ] Copy the seven exact legacy files and create five thumbnail-name aliases from their corresponding original legacy images.
- [ ] Re-run the test, production build, and HTTP content-type verification after deployment.
- [ ] Commit only the test and the twelve email assets.
