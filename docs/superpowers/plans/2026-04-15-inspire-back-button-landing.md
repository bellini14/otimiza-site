# Inspire Back Button Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Inspire topbar back button go to `/` on the `/inspire` landing page, while preserving history back behavior on other Inspire routes.

**Architecture:** Keep the behavior isolated inside `src/components/InspireLayout.jsx`, where the topbar button already lives. Cover the landing-page exception and the normal history-back flow with focused router tests in `src/pages/Inspire.test.jsx`.

**Tech Stack:** React, React Router, Vitest, Testing Library

---

### Task 1: Cover the new landing-page exception

**Files:**
- Modify: `src/pages/Inspire.test.jsx`
- Test: `src/pages/Inspire.test.jsx`

- [ ] **Step 1: Write a failing test for the landing page behavior**

```jsx
it('returns to the home page when the back button is used on the Inspire landing page', async () => {
  // render /inspire and assert click navigates to /
})
```

- [ ] **Step 2: Run the targeted tests to verify the new assertion fails**

Run: `npm test -- src/pages/Inspire.test.jsx src/pages/InspireNewsletter.test.jsx`
Expected: FAIL because `/inspire` still uses `navigate(-1)`

- [ ] **Step 3: Keep the existing history-back test for non-landing Inspire routes**

```jsx
it('returns to the previous page on non-landing Inspire routes', async () => {
  // render /contato -> /inspire/newsletter and assert click returns to /contato
})
```

- [ ] **Step 4: Re-run the targeted tests after implementation**

Run: `npm test -- src/pages/Inspire.test.jsx src/pages/InspireNewsletter.test.jsx`
Expected: PASS

### Task 2: Implement the route-aware back button

**Files:**
- Modify: `src/components/InspireLayout.jsx`
- Test: `src/pages/Inspire.test.jsx`

- [ ] **Step 1: Add a landing-page branch in the back button handler**

```jsx
const handleBackClick = () => {
  if (isLandingPage) {
    navigate('/')
    return
  }

  navigate(-1)
}
```

- [ ] **Step 2: Wire the button to the new handler without changing its visual structure**

```jsx
<button type="button" onClick={handleBackClick} ...>
```

- [ ] **Step 3: Run the targeted tests and confirm both flows pass**

Run: `npm test -- src/pages/Inspire.test.jsx src/pages/InspireNewsletter.test.jsx`
Expected: PASS
