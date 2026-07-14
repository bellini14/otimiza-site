# Contact Form Flat Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the contact form background panel and align its content with the 1320px menu surface.

**Architecture:** Keep the existing React markup and submission behavior unchanged. Restrict the change to contact CSS, with a focused source-level style contract test for the visual properties that DOM tests cannot observe in jsdom.

**Tech Stack:** React, CSS, Vitest

---

### Task 1: Flatten and align the contact form

**Files:**
- Create: `src/pages/Contato.styles.test.js`
- Modify: `src/index.css`

- [ ] **Step 1: Write the failing style contract test**

Read `src/index.css`, isolate the `.contact-shell` and `.contact-form-panel` rules, and assert that the shell uses `1320px` while the panel contains no background, border radius, box shadow, or padding.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/pages/Contato.styles.test.js`

Expected: FAIL because the shell still uses `1380px` and the form panel still defines the removed box styles.

- [ ] **Step 3: Implement the minimal CSS change**

Change the shell maximum width to `1320px` and remove `background`, `padding`, `border-radius`, and `box-shadow` from `.contact-form-panel`, including its obsolete mobile padding override.

- [ ] **Step 4: Run focused and existing contact tests**

Run: `npm test -- src/pages/Contato.styles.test.js src/pages/Contato.test.jsx`

Expected: PASS.

- [ ] **Step 5: Build and visually inspect**

Run: `npm run build`, then inspect `/contato` at desktop and mobile widths.

Expected: Build succeeds; title and fields align to the menu surface margins without a white panel.
