# Contact Details Row Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore Otimiza contact details between the map hero and form in one neutral horizontal row.

**Architecture:** Keep contact content in `Contato.jsx` and add isolated responsive styles in `index.css`. Use semantic links for email, phone, and verified social profiles, with Lucide icons and no red visual accents.

**Tech Stack:** React, Lucide React, CSS, Vitest

---

### Task 1: Add the contact details row

**Files:**
- Modify: `src/pages/Contato.jsx`
- Modify: `src/pages/Contato.test.jsx`
- Modify: `src/index.css`
- Modify: `src/pages/Contato.styles.test.js`

- [ ] Add failing tests for email, phone, social links, horizontal layout, and neutral colors.
- [ ] Render the semantic contact row between `contact-hero` and `contact-main`.
- [ ] Add responsive desktop and mobile styles using the existing `contact-shell`.
- [ ] Run contact tests and the production build.
- [ ] Verify the row visually at desktop and mobile widths.
