# Home Cases Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir os depoimentos fictícios da Home por 10 cases reais com logo, resumo, empresa e setor, além de atualizar a prova social para mais de mil clientes.

**Architecture:** Centralizar os fallbacks e a normalização em `src/data/homeCases.js`, buscar na Home os mesmos documentos `clientLogo` exibidos em Cases e manter o motor do carrossel existente. O componente passa a aceitar `cases` e renderiza conteúdo editorial de case sem linguagem de depoimento.

**Tech Stack:** React 19, Vite, Tailwind CSS, Vitest e Testing Library.

---

### Task 1: Modelar os 10 cases da Home

**Files:**
- Create: `src/data/homeCases.js`
- Create: `src/data/homeCases.test.js`

- [ ] Escrever testes que exijam exatamente 10 fallbacks — Banco Moneo, Bontempo, Cinex, Hospital Bruno Born, Masterpower Turbo, Neobus, Santa Clara, Sulmaq, Tabone e Unicasa — com nome, setor, resumo editorial, logo e slug.
- [ ] Rodar `npm test -- src/data/homeCases.test.js` e confirmar falha por módulo ausente.
- [ ] Implementar os 10 cases com as URLs de logo publicadas no Sanity e resumos curtos derivados dos resultados em `caseStudies.js`: contratos automatizados (Moneo), produtividade e entregas (Bontempo), integração entre distribuição e fábrica (Cinex), segurança da medicação (Hospital Bruno Born), gestão integrada e estoques (Masterpower), engenharia integrada e mais rápida (Neobus), escritório de processos e produtividade (Santa Clara), orçamento centralizado no ERP (Sulmaq), processamento fabril automatizado (Tabone) e Quick Wins com automações (Unicasa).
- [ ] Implementar a normalização para combinar cada registro do CMS com o resumo editorial pelo nome/slug, rejeitar itens sem empresa, setor ou logo, preservar a ordem recebida, selecionar 10 itens e completar lacunas sem duplicação com os fallbacks.
- [ ] Rodar o teste focado e confirmar aprovação.

### Task 2: Converter o componente visual

**Files:**
- Modify: `src/components/ui/stagger-testimonials.jsx`
- Modify: `src/components/ui/stagger-testimonials.test.jsx`

- [ ] Atualizar os testes para exigir logo com `alt` da empresa, resumo, empresa, setor, identificação semântica do case, ausência de aspas/autoria e o texto “Mais de mil clientes”. Preservar os testes existentes de arraste, loop, responsividade, fades e CTA.
- [ ] Rodar `npm test -- src/components/ui/stagger-testimonials.test.jsx` e confirmar falha esperada.
- [ ] Substituir a normalização e a apresentação de depoimento pela apresentação de case, preservando o motor do carrossel.
- [ ] Rodar os testes focados e confirmar aprovação.

### Task 3: Alimentar a Home com os cases

**Files:**
- Modify: `src/pages/Home.jsx`
- Modify: `src/pages/Home.test.jsx`

- [ ] Escrever teste que valide a consulta `clientLogo` com `showOnCases == true`, mesma ordenação da página Cases e projeção de `_id`, nome, setor, descrição, slug e URL do logo; validar também sua passagem ao carrossel.
- [ ] Rodar `npm test -- src/pages/Home.test.jsx` e confirmar falha esperada.
- [ ] Trocar a consulta de depoimentos pela consulta dos `clientLogo` visíveis de Cases, ordenada por `sortOrder` e nome como em `Cases.jsx`, normalizar o resultado e limitar a 10 cards somente depois de remover incompletos; usar fallback local em erro, resposta vazia ou lacunas.
- [ ] Rodar os testes focados e confirmar aprovação.

### Task 4: Verificação

**Files:**
- Verify only.

- [ ] Rodar `npm test -- src/data/homeCases.test.js src/components/ui/stagger-testimonials.test.jsx src/pages/Home.test.jsx`.
- [ ] Rodar `npm test`.
- [ ] Rodar `npm run lint`.
- [ ] Rodar `npm run build`.
- [ ] Revisar o diff para garantir que apenas o escopo do carrossel foi alterado.
