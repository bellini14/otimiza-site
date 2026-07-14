# O Que Fazemos Title Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar ao título “O Que Fazemos” exatamente a animação `SplitText` usada em “Quem somos”.

**Architecture:** Reutilizar o componente `SplitText` existente diretamente em `OQueFazemos.jsx`, preservando a semântica e as classes do título atual. A mudança fica restrita à página e ao seu teste.

**Tech Stack:** React, GSAP `SplitText`, Vitest, Testing Library

---

### Task 1: Animar o título principal

**Files:**
- Modify: `src/pages/OQueFazemos.test.jsx`
- Modify: `src/pages/OQueFazemos.jsx`

- [ ] **Step 1: Write the failing test**

Adicionar um teste que localize o título “O Que Fazemos” e valide `H1`, `id="oquefazemos-title"` e a classe estrutural `split-parent`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/pages/OQueFazemos.test.jsx`
Expected: FAIL porque o `h1` atual ainda não possui `split-parent`.

- [ ] **Step 3: Write minimal implementation**

Importar `SplitText` e substituir o `h1` pelo componente com `tag="h1"`, texto, id, classe atual e todos os parâmetros copiados de `QuemSomos.jsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/pages/OQueFazemos.test.jsx`
Expected: todos os testes do arquivo passam.

- [ ] **Step 5: Verify related behavior**

Run: `npm test -- src/pages/QuemSomos.test.jsx src/pages/OQueFazemos.test.jsx`
Expected: todos os testes passam.

- [ ] **Step 6: Verify production build**

Run: `npm run build`
Expected: build concluído com código de saída 0.
