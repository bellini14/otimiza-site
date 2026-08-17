# WhatsApp Production Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an accessible, responsive WhatsApp support widget to the current production site without changing existing page content.

**Architecture:** A single `WhatsAppSupportWidget` component owns the open state, Escape handling, current time display, and outbound WhatsApp URL. It is mounted once in `AppShell`, outside route layouts, so the same widget is available across the production experience. Component-scoped CSS in `index.css` provides the visual treatment and responsive layout.

**Tech Stack:** React 19, lucide-react, Vitest, Testing Library, CSS.

---

### Task 1: Specify widget behavior

**Files:**
- Create: `src/components/WhatsAppSupportWidget.test.jsx`

- [ ] **Step 1: Write failing tests** for the closed state, open/close button behavior, Escape dismissal, and secure WhatsApp link.
- [ ] **Step 2: Run the focused test** and confirm it fails because the widget does not exist.

### Task 2: Implement the reusable widget

**Files:**
- Create: `src/components/WhatsAppSupportWidget.jsx`
- Modify: `src/index.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Implement the minimal accessible component** with the fixed trigger, support card, status, encoded WhatsApp URL, and Escape listener.
- [ ] **Step 2: Add scoped responsive CSS** matching the specified production design.
- [ ] **Step 3: Mount the widget once in `AppShell`** so it does not disturb existing layouts.
- [ ] **Step 4: Run focused tests** and confirm they pass.

### Task 3: Verify and publish safely

**Files:**
- Modify: `docs/superpowers/plans/2026-08-13-whatsapp-production-widget.md`

- [ ] **Step 1: Run lint, tests, and production build.**
- [ ] **Step 2: Review the diff against commit `7633412`.**
- [ ] **Step 3: Commit and push the production-based branch.**
- [ ] **Step 4: Deploy the exact clean commit to Vercel production and check the live site.**
