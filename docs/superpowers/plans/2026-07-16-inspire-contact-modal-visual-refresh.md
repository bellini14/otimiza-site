# Inspire Contact Modal Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refinar o modal de contato do Inspire com um cabeçalho editorial mais forte e melhor acabamento dos elementos internos.

**Architecture:** Manter toda a estrutura comportamental em `PostArticleContactPanel` e adicionar somente a marcação necessária ao ícone e subtítulo. Concentrar o refinamento em classes CSS específicas do modal, sem criar novos componentes ou tokens.

**Tech Stack:** React 19, Lucide React, CSS, Vitest, Testing Library.

---

### Task 1: Hierarquia do cabeçalho

**Files:**
- Modify: `src/pages/PostDetail.test.jsx`
- Modify: `src/components/PostArticleContactPanel.jsx`

- [ ] Escrever teste exigindo um `MessageCircle` decorativo dentro de `.post-detail__contact-heading-icon` e o texto de apoio definido na especificação.
- [ ] Rodar `npm test -- src/pages/PostDetail.test.jsx --exclude ".worktrees/**"` e confirmar falha pela marcação ausente.
- [ ] Adicionar um agrupador de ícone/título/subtítulo no cabeçalho, mantendo o `h2`, `aria-labelledby` e o botão fechar.
- [ ] Encurtar o parágrafo seguinte para “A equipe da Otimiza responderá pelo seu e-mail.”
- [ ] Rodar o teste focado e confirmar passagem.

### Task 2: Refinamento visual

**Files:**
- Modify: `src/pages/InspireTheme.test.jsx`
- Modify: `src/index.css`

- [ ] Escrever expectativas CSS para círculo do ícone com `2.75rem` e fundo `var(--inspire-button-surface)`, título `1.35rem`, subtítulo, agrupamento à esquerda e botão fechar à direita.
- [ ] Exigir no mesmo contrato o cartão contextual com `border-radius: 0.75rem`, espaçamento e contraste refinados, campos com maior espaçamento vertical, foco com sombra suave e botão com fundo `var(--inspire-text)` e texto branco.
- [ ] Rodar `npm test -- src/pages/InspireTheme.test.jsx --exclude ".worktrees/**"` e confirmar falha pelos estilos ausentes.
- [ ] Implementar os estilos usando somente valores e tokens existentes do Inspire, mantendo `max-height`, `overflow-y: auto` e o cabeçalho com ícone à esquerda/fechamento à direita.
- [ ] Ajustar mobile para ícone de `2.5rem`, título `1.2rem`, espaçamento compacto e preservar o limite de altura e rolagem interna do cartão.
- [ ] Rodar os dois testes focados e confirmar passagem.

### Task 3: Validação

**Files:**
- Verify: `src/components/PostArticleContactPanel.jsx`
- Verify: `src/index.css`
- Verify: `src/pages/PostDetail.test.jsx`
- Verify: `src/pages/InspireTheme.test.jsx`

- [ ] Rodar `npx eslint src/components/PostArticleContactPanel.jsx src/pages/PostDetail.test.jsx src/pages/InspireTheme.test.jsx`.
- [ ] Rodar `npm run build`.
- [ ] No navegador, entrar em um artigo a partir da listagem do Inspire, abrir **Contato** e inspecionar o modal renderizado em desktop: alinhamento, hierarquia, contraste, foco visível e rolagem interna.
- [ ] Repetir a inspeção com viewport mobile, confirmando que o modal fica dentro da altura disponível, continua rolável e mantém ícone, título e fechamento legíveis.
- [ ] Reexecutar os testes existentes que cobrem Escape, clique externo, focus trap, preservação do rascunho e envio.
- [ ] Rodar `git diff --check` e revisar o escopo do diff.
