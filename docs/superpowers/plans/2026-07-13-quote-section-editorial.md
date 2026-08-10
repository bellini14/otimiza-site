# Quote Section Editorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a seção de encerramento da abordagem em uma composição editorial responsiva, com linha vermelha, assinatura compacta e revelação mobile no centro da tela.

**Architecture:** Extrair a marcação atual da variante `quote` para um componente local `EditorialQuoteBlock`, responsável apenas pela estrutura semântica e estado de revelação. Manter dados e roteamento em `NossaAbordagem.jsx`, estilos em `index.css` e regressões em `NossaAbordagem.test.jsx`.

**Tech Stack:** React 19, IntersectionObserver, CSS responsivo, Vitest e Testing Library.

---

### Task 1: Estrutura editorial semântica

**Files:**
- Modify: `src/pages/NossaAbordagem.test.jsx`
- Modify: `src/pages/NossaAbordagem.jsx`

- [ ] Estender o teste estrutural existente para exigir `section[data-testid="nossa-abordagem-editorial-quote"][aria-labelledby="nossa-abordagem-editorial-quote-title"]`, título com esse id, `blockquote` apenas para os índices 3 e 4, fechamento no índice 5 e `footer` para os índices 6 e 7.
- [ ] Executar `npx vitest run src/pages/NossaAbordagem.test.jsx --exclude .worktrees/**` e confirmar falha pela ausência da section.
- [ ] Criar `EditorialQuoteBlock({ block })` com grupos `.nossa-abordagem-editorial-quote__opening`, `__manifesto` e `__signature`; usar as três primeiras linhas na abertura, linhas 3 e 4 no blockquote, linha 5 como fechamento, linhas 6 e 7 no footer.
- [ ] Substituir a marcação inline de `block.variant === 'quote'` por `<EditorialQuoteBlock block={block} />`.
- [ ] Executar o teste focado e confirmar 13 testes passando.

### Task 2: Composição visual responsiva

**Files:**
- Modify: `src/pages/NossaAbordagem.test.jsx`
- Modify: `src/index.css`

- [ ] Adicionar asserções para mobile: raiz com `padding: 5rem 1.5rem`, grid com `gap: 3.5rem`, abertura com `font-size: clamp(2.25rem, 10vw, 3.25rem)` e `line-height: 0.98`, manifesto com `max-width: 32rem`, `border-left: 1px solid var(--brand-red)`, `font-size: clamp(1.1rem, 4.8vw, 1.3rem)` e `line-height: 1.55`, assinatura com `gap: 0.35rem`, nome em `1.05rem`, cargo em `0.9rem` e ambos com `line-height: 1.35`.
- [ ] Executar o teste focado e confirmar RED nos seletores ainda ausentes.
- [ ] Implementar os valores exatos em `index.css`; no desktop usar grid `0.82fr 1.18fr`, gap fluido e manifesto na coluna direita.
- [ ] Executar o teste focado e confirmar GREEN.

### Task 3: Revelação conjunta no centro da tela

**Files:**
- Modify: `src/pages/NossaAbordagem.test.jsx`
- Modify: `src/pages/NossaAbordagem.jsx`
- Modify: `src/index.css`

- [ ] Adaptar `ControlledIntersectionObserver` no teste para manter `this.elements = []`, adicionar cada alvo em `observe(element)` e remover em `unobserve(element)`, preservando `this.element` para testes antigos.
- [ ] Adicionar teste que exige a seção como único alvo e opções `{ rootMargin: '-45% 0px -45% 0px', threshold: 0 }`.
- [ ] Disparar o callback com `isIntersecting: true` e exigir a classe `nossa-abordagem-editorial-quote--visible` na seção.
- [ ] Executar teste e confirmar RED por ausência do observer.
- [ ] No componente, manter um ref da seção e estado booleano `visible`; observar a seção em todos os breakpoints e desconectar após a primeira entrada.
- [ ] Em CSS, iniciar todos os grupos com `opacity: 0` e `translateY(1.25rem)`; usar transições `700ms` e `760ms` com `cubic-bezier(0.22, 1, 0.36, 1)`; a classe visível da seção revela todos simultaneamente, sem delay.
- [ ] Em `prefers-reduced-motion`, tornar todos os grupos visíveis sem transição.
- [ ] Executar o teste focado e confirmar GREEN.

### Task 4: Validação

**Files:**
- Verify: `src/pages/NossaAbordagem.jsx`
- Verify: `src/index.css`
- Verify: `src/pages/NossaAbordagem.test.jsx`

- [ ] Executar `npx vitest run src/pages/NossaAbordagem.test.jsx --exclude .worktrees/**` e confirmar 14 testes passando.
- [ ] Iniciar `npm run dev -- --host 127.0.0.1`, abrir `/nossa-abordagem` no Browser in-app em `390 × 844`, rolar até a seção e capturar screenshot.
- [ ] Confirmar visualmente hierarquia, linha vermelha, assinatura compacta, ausência de caixas e ativação quando cada grupo cruza o centro.
- [ ] Executar `npm run build` e `git diff --check -- src/pages/NossaAbordagem.jsx src/index.css src/pages/NossaAbordagem.test.jsx`; ambos devem terminar com exit code 0.
