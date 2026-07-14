# Disable Dark Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remover o controle de modo escuro e garantir que o site sempre use o tema claro.

**Architecture:** Simplificar o `Header`, eliminando estado, alternância e persistência do tema. Um efeito de montagem limpa preferências antigas sem remover o CSS escuro, preservando a possibilidade de reativação futura.

**Tech Stack:** React 19, Testing Library, Vitest

---

### Task 1: Fixar o cabeçalho no tema claro

**Files:**
- Modify: `src/components/Header.test.jsx`
- Modify: `src/components/Header.jsx`

- [ ] **Step 1: Escrever o teste regressivo**

Substituir os testes de alternância e restauração por um teste que pré-carrega `theme=dark`, adiciona a classe `dark`, renderiza o cabeçalho e espera que o botão não exista, a classe seja removida e a preferência seja apagada.

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run: `npm test -- src/components/Header.test.jsx`

Expected: FAIL porque o controle ainda existe e o tema escuro ainda é restaurado.

- [ ] **Step 3: Implementar a alteração mínima**

Remover `getInitialTheme`, `ThemeToggle`, o estado `theme`, `isDarkTheme`, `toggleTheme` e a renderização do controle. Adicionar um efeito de montagem que remova `dark` de `document.documentElement` e apague `theme` do `localStorage`.

- [ ] **Step 4: Executar as verificações**

Run: `npm test -- src/components/Header.test.jsx`

Expected: PASS.

Run: `npm run build`

Expected: exit code 0.
