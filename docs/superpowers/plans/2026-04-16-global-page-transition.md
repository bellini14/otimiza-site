# Global Page Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one global Otimiza icon page transition that covers all internal routes, including back/forward navigation.

**Architecture:** Add a router-level transition provider that tracks navigation intent, delays the displayed route during the cover phase, and renders a fixed overlay responsible for the diagonal icon reveal. Keep route content unchanged where possible by introducing transition-aware navigation primitives and a small route shell instead of duplicating logic inside every page.

**Tech Stack:** React 19, React Router 7, Motion, Vitest, Testing Library, CSS

---

### Task 1: Add transition coverage tests

**Files:**
- Create: `src/transitions/PageTransitionProvider.test.jsx`
- Modify: `src/test/setup.js`

- [ ] **Step 1: Write failing tests for click-origin navigation, default-origin back navigation, and reduced-motion fallback state**
- [ ] **Step 2: Run `npm test -- src/transitions/PageTransitionProvider.test.jsx` and confirm the new assertions fail for the missing transition system**
- [ ] **Step 3: Add any missing test environment stubs needed by the transition code**
- [ ] **Step 4: Re-run `npm test -- src/transitions/PageTransitionProvider.test.jsx` and confirm the test now fails only on missing implementation**

### Task 2: Build the transition system

**Files:**
- Create: `src/transitions/PageTransitionProvider.jsx`
- Create: `src/transitions/TransitionOverlay.jsx`
- Create: `src/transitions/TransitionLink.jsx`
- Create: `src/transitions/usePageTransitionNavigate.js`
- Modify: `src/App.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Implement the transition state machine and delayed displayed-location routing**
- [ ] **Step 2: Implement the fixed overlay with the Otimiza icon sweep and reduced-motion fallback classes**
- [ ] **Step 3: Implement transition-aware link and imperative navigation helpers**
- [ ] **Step 4: Wire the provider into `src/App.jsx` so all routes render through the shared transition shell**
- [ ] **Step 5: Run `npm test -- src/transitions/PageTransitionProvider.test.jsx` and confirm the new transition system passes**

### Task 3: Adopt transition-aware navigation entry points

**Files:**
- Modify: `src/components/Header.jsx`
- Modify: `src/components/Footer.jsx`
- Modify: `src/components/InspireLayout.jsx`
- Modify: `src/components/FeaturesSection.jsx`
- Modify: `src/components/TechnologySection.jsx`
- Modify: `src/components/ui/blog-highlights.jsx`
- Modify: `src/components/ui/featured-hero.jsx`
- Modify: `src/components/ui/project-card.jsx`
- Modify: `src/components/ui/stagger-testimonials.jsx`
- Modify: `src/pages/Inspire.jsx`
- Modify: `src/pages/PostDetail.jsx`

- [ ] **Step 1: Replace internal `Link` usage at shared navigation entry points with the transition-aware link component**
- [ ] **Step 2: Update imperative `navigate()` calls to capture transition origins before navigation**
- [ ] **Step 3: Re-run focused page tests that cover Inspire and post navigation**

### Task 4: Verify integrated behavior

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test -- src/transitions/PageTransitionProvider.test.jsx src/pages/Inspire.test.jsx src/pages/PostDetail.test.jsx`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Review the diff for only the transition-related files and confirm unrelated local changes were not reverted**
