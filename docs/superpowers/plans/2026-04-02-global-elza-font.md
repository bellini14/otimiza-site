# Global Elza Font Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Forcar a fonte `elza` como unica familia tipografica declarada em todo o site.

**Architecture:** A mudanca fica centralizada em `src/index.css`, usando uma regra global que faz todos os elementos herdarem `elza` a partir do `html`. Um teste em `src/pages/Home.test.jsx` protege a existencia dessa regra e impede a reintroducao de fallbacks declarados no CSS.

**Tech Stack:** React, Vite, Tailwind CSS, Vitest, Testing Library

---

### Task 1: Proteger a regra tipografica com teste

**Files:**
- Modify: `src/pages/Home.test.jsx`
- Test: `src/pages/Home.test.jsx`

- [ ] **Step 1: Escrever o teste que falha**

Adicionar uma assercao que exija uma regra global de `font-family` herdada a partir de `html` e que rejeite `Segoe UI`, `Tahoma` e `sans-serif` em `src/index.css`.

- [ ] **Step 2: Rodar o teste para confirmar a falha**

Run: `npm test -- src/pages/Home.test.jsx`
Expected: FAIL porque o CSS ainda contem fallbacks e nao possui a regra global final.

### Task 2: Aplicar a fonte global exclusiva

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Centralizar a fonte no CSS base**

Definir `html { font-family: 'elza'; }` e uma regra global para elementos e pseudo-elementos herdarem essa familia.

- [ ] **Step 2: Remover fallbacks declarados**

Apagar `Segoe UI`, `Tahoma` e `sans-serif` das regras locais existentes, deixando o projeto depender apenas de `elza` no codigo-fonte.

### Task 3: Verificar a mudanca

**Files:**
- Test: `src/pages/Home.test.jsx`

- [ ] **Step 1: Rodar o teste alvo**

Run: `npm test -- src/pages/Home.test.jsx`
Expected: PASS

- [ ] **Step 2: Rodar a build**

Run: `npm run build`
Expected: exit 0
