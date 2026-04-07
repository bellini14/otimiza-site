# Home Hero And Header Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recriar a hero da home com composicao centralizada inspirada no print e inserir a identidade visual da Otimiza no header mantendo a navegacao atual.

**Architecture:** A implementacao fica concentrada em `src/pages/Home.jsx`, `src/components/Header.jsx`, `src/index.css` e `index.html`, com um novo asset SVG em `src/assets`. A hero reutiliza `GradientBlinds` e muda apenas a composicao visual e a paleta; o header preserva comportamento e troca a marca textual pelo logotipo, ajustando o container para estado boxed.

**Tech Stack:** React 19, React Router, Tailwind CSS, Vitest, Testing Library, Vite

---

### Task 1: Cobrir a nova hero com testes

**Files:**
- Modify: `src/pages/Home.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
expect(screen.getByRole('heading', { name: /criar o atemporal/i })).toBeInTheDocument()
expect(screen.getByPlaceholderText(/seu email/i)).toBeInTheDocument()
expect(screen.getByRole('button', { name: /quero fazer parte/i })).toBeInTheDocument()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/pages/Home.test.jsx`
Expected: FAIL because the current hero still renders the old structure.

- [ ] **Step 3: Write minimal implementation**

Refazer a hero em `src/pages/Home.jsx` para centralizar a composicao, manter o `GradientBlinds` como fundo e trocar os textos e CTAs para a nova estrutura.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/pages/Home.test.jsx`
Expected: PASS

### Task 2: Cobrir a nova identidade do header com testes

**Files:**
- Modify: `src/components/Header.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
expect(screen.getByRole('link', { name: /otimiza home/i })).toBeInTheDocument()
expect(screen.getByAltText(/otimiza/i)).toBeInTheDocument()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/Header.test.jsx`
Expected: FAIL because the current header still uses text instead of the logo asset.

- [ ] **Step 3: Write minimal implementation**

Importar o SVG da marca no header, aplicar o novo container boxed e ajustar os controles para a paleta aprovada.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/Header.test.jsx`
Expected: PASS

### Task 3: Instalar tipografia e recalibrar o sistema visual

**Files:**
- Modify: `index.html`
- Modify: `src/index.css`
- Create: `src/assets/logo-otimiza.svg`

- [ ] **Step 1: Add the Typekit stylesheet**

Inserir o `link` da Typekit no `head` de `index.html`.

- [ ] **Step 2: Rebuild visual tokens and hero/header styles**

Atualizar `src/index.css` para introduzir a nova tipografia, o header boxed, a paleta `#434b54` e o tratamento luminoso do background da hero.

- [ ] **Step 3: Keep interaction and responsiveness intact**

Preservar interacao do `GradientBlinds`, dropdowns, tema e responsividade do header e da hero.

### Task 4: Final verification

**Files:**
- Modify: `src/pages/Home.jsx`
- Modify: `src/components/Header.jsx`
- Modify: `src/index.css`
- Modify: `src/pages/Home.test.jsx`
- Modify: `src/components/Header.test.jsx`

- [ ] **Step 1: Run focused tests**

Run: `npm test -- src/pages/Home.test.jsx src/components/Header.test.jsx`
Expected: PASS

- [ ] **Step 2: Run full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: PASS
