# Home Hero Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar apenas o background da hero da home por um veu liquido animado em SVG inspirado na referencia enviada pelo usuario.

**Architecture:** A implementacao permanece concentrada em `src/pages/Home.jsx` e `src/index.css`. `Home.jsx` passa a renderizar um componente SVG absoluto com bandas verticais filtradas, enquanto `index.css` controla o drift autonomo dessas bandas, o scrim de contraste e o fallback de reduced motion.

**Tech Stack:** React 19, React Router, Tailwind CSS, Vitest, Testing Library

---

### Task 1: Cobrir a nova estrutura visual da hero

**Files:**
- Modify: `src/pages/Home.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
expect(screen.getByTestId('hero-veil-svg')).toBeInTheDocument()
expect(screen.getByTestId('hero-veil-scrim')).toBeInTheDocument()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/pages/Home.test.jsx`
Expected: FAIL because the SVG veil layer does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add the SVG veil background and scrim to `src/pages/Home.jsx` without changing the existing hero copy or CTA links.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/pages/Home.test.jsx`
Expected: PASS

### Task 2: Rebuild the hero background system

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace the old hero background styles**

Remove the crosshair/grid aesthetic and replace it with SVG veil motion, scrim layering and reduced-motion-safe CSS.

- [ ] **Step 2: Keep motion accessible**

Drive the effect with autonomous CSS animation and preserve reduced-motion safeguards.

- [ ] **Step 3: Run verification**

Run: `npm test -- src/pages/Home.test.jsx`
Expected: PASS

Run: `npm run build`
Expected: Vite production build succeeds without CSS or JSX errors.
