# Inspire Contact Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Abrir o formulário contextual dos artigos Inspire em um modal central acessível, sem alterar seu envio ou conteúdo.

**Architecture:** `PostArticleContactPanel` manterá o estado e o envio existentes, mas renderizará o formulário por portal somente quando aberto. O componente controlará Escape, contenção e restauração de foco e bloqueio de scroll; `src/index.css` fornecerá o backdrop, cartão responsivo e animações alinhados ao modal de compartilhamento.

**Tech Stack:** React 19, React DOM portal, Testing Library, Vitest, CSS.

---

## Estrutura de arquivos

- `src/components/PostArticleContactPanel.jsx`: gatilho, ciclo de vida acessível do diálogo, portal e envio do formulário.
- `src/pages/PostDetail.test.jsx`: integração do modal com a página, acessibilidade e regressão do envio.
- `src/pages/InspireTheme.test.jsx`: contrato dos estilos do modal.
- `src/index.css`: backdrop, cartão, cabeçalho, responsividade, rolagem e movimento reduzido.

### Task 1: Contrato comportamental do diálogo

**Files:**
- Modify: `src/pages/PostDetail.test.jsx`
- Modify: `src/components/PostArticleContactPanel.jsx`

- [ ] **Step 1: Escrever testes que falham para abertura em portal e semântica modal**

Atualizar o teste do formulário para esperar `role="dialog"`, `aria-modal="true"`, o diálogo como descendente de `document.body` e fora de `.post-detail__sidebar`, além de `aria-haspopup="dialog"` e alternância de `aria-expanded` no gatilho.

- [ ] **Step 2: Escrever testes que falham para fechamento e foco**

Testar separadamente o botão X, Escape, clique direto no backdrop, ausência de fechamento por clique no cartão, restauração do foco e ciclo de Tab/Shift+Tab entre o primeiro e o último controle.

Também fechar e reabrir após preencher os campos para comprovar que valores e status não são descartados.

- [ ] **Step 3: Rodar o teste focado e confirmar a falha pelo painel atual**

Run: `npm test -- src/pages/PostDetail.test.jsx`

Expected: FAIL porque o formulário ainda usa `role="region"`, permanece na sidebar e não possui os controles do modal.

- [ ] **Step 4: Implementar o mínimo para abrir e fechar o diálogo**

Em `PostArticleContactPanel.jsx`, importar `useEffect`, `useRef`, `createPortal` e `X`; trocar o toggle expansível por funções explícitas `openDialog`/`closeDialog`; renderizar condicionalmente `post-detail__contact-screen` e `post-detail__contact-dialog` em `document.body`; associar título e botão de fechar; fechar somente quando `event.target === event.currentTarget` no backdrop. Manter email, mensagem e honeypot em estado controlado para sobreviver ao fechamento; limpar os valores somente depois de envio bem-sucedido.

- [ ] **Step 5: Implementar o ciclo de foco e scroll**

Enquanto aberto, salvar e aplicar `document.documentElement.style.overflow = 'hidden'`, restaurar o valor anterior no cleanup, focar o botão X, ouvir Escape e Tab, obter controles focáveis dentro do diálogo e circular foco nas duas extremidades. Ao fechar, devolver foco ao gatilho.

- [ ] **Step 6: Rodar o teste focado até passar**

Run: `npm test -- src/pages/PostDetail.test.jsx`

Expected: PASS.

### Task 2: Layout visual da caixa

**Files:**
- Modify: `src/pages/InspireTheme.test.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Substituir expectativas do painel expansível por expectativas do modal**

Exigir backdrop fixo ocupando a viewport, centralização, `z-index`, cartão com largura limitada, altura máxima e `overflow-y: auto`, cabeçalho e botão de fechar. Exigir breakpoint mobile e desativação das animações em `prefers-reduced-motion`.

- [ ] **Step 2: Rodar o teste de estilos e confirmar a falha**

Run: `npm test -- src/pages/InspireTheme.test.jsx`

Expected: FAIL porque as classes do modal de contato ainda não existem.

- [ ] **Step 3: Substituir CSS do painel pelo modal**

Remover `post-detail__contact-panel-shell` e estados open/closed. Criar `post-detail__contact-screen`, `post-detail__contact-dialog`, `post-detail__contact-dialog-header` e `post-detail__contact-dialog-close`; manter as regras existentes de contexto, formulário, rodapé e status ajustando margens/paddings que dependiam da sidebar. Usar dimensões responsivas e rolagem interna.

- [ ] **Step 4: Adicionar animação e fallback mobile**

Criar entrada curta de backdrop/cartão, desativá-la em movimento reduzido e ajustar padding, alinhamento e altura máxima em telas estreitas.

- [ ] **Step 5: Rodar testes de estilos e integração**

Run: `npm test -- src/pages/InspireTheme.test.jsx src/pages/PostDetail.test.jsx`

Expected: PASS.

### Task 3: Regressão e validação

**Files:**
- Verify: `src/components/PostArticleContactPanel.jsx`
- Verify: `src/pages/PostDetail.test.jsx`
- Verify: `src/pages/InspireTheme.test.jsx`
- Verify: `src/index.css`

- [ ] **Step 1: Rodar a suíte completa**

Run: `npm test`

Expected: todos os testes passam, sem falhas.

- [ ] **Step 2: Rodar lint**

Run: `npm run lint`

Expected: exit code 0.

- [ ] **Step 3: Rodar build de produção**

Run: `npm run build`

Expected: exit code 0 e arquivos gerados em `dist`.

- [ ] **Step 4: Revisar o diff e confirmar o escopo**

Run: `git diff --check && git status --short`

Expected: sem erros de whitespace; alterações limitadas ao componente, testes, CSS e documentação do modal.
