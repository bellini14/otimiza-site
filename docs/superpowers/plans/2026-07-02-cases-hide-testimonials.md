# Cases Hide Testimonials Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ocultar a seção de depoimentos apenas em `/cases` sem remover sua implementação.

**Architecture:** Uma flag local controla o ponto de renderização de `CaseTestimonialsSection`. O componente e seus dados permanecem disponíveis para reativação.

**Tech Stack:** React 19, Vitest, Testing Library

---

### Task 1: Controlar a visibilidade da seção

**Files:**
- Modify: `src/pages/Cases.jsx`
- Test: `src/pages/Cases.test.jsx`

- [ ] **Step 1: Escrever o teste de integração**

Alterar a expectativa da página para exigir que `cases-testimonials-section` não esteja no DOM, mantendo a verificação da seção de clientes.

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run: `npm test -- src/pages/Cases.test.jsx`
Expected: FAIL porque a seção ainda é renderizada.

- [ ] **Step 3: Implementar a flag**

Adicionar `SHOW_CASE_TESTIMONIALS = false` e condicionar somente a chamada de `CaseTestimonialsSection`.

- [ ] **Step 4: Preservar os testes isolados**

Exportar o componente de depoimentos e exercitá-lo diretamente nos testes específicos, sem depender da visibilidade definida pela página.

- [ ] **Step 5: Verificar**

Run: `npm test -- src/pages/Cases.test.jsx`
Expected: PASS.

Run: `npm run build`
Expected: exit code 0.
