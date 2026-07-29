# Silvana Memorial Otimiza Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer o memorial da Silvana usar a tipografia, paleta e linguagem de interface do site Otimiza.

**Architecture:** A estrutura React e todos os fluxos permanecem inalterados. A mudança fica concentrada nos tokens e componentes visuais de `SilvanaMemorial.css`, protegidos por um teste textual de identidade e confirmados visualmente no localhost.

**Tech Stack:** React, CSS, Vitest, Testing Library, Vite.

---

### Task 1: Proteger os tokens da identidade Otimiza

**Files:**
- Create: `src/pages/SilvanaMemorial.styles.test.js`
- Modify: `src/pages/SilvanaMemorial.css`

- [ ] **Step 1: Escrever o teste que exige a identidade**

O teste deve ler `SilvanaMemorial.css` e proteger seletores memorial-scoped:
fonte Elza na raiz; `#39424c` nos títulos; `#5a6572` nos textos; `#e02020` nos
acentos e ações; `#EFEFF4`/`#E5E9F1` nas superfícies. Também deve garantir a
ausência completa de imports e usos de `Fraunces` e `Work Sans`.

- [ ] **Step 2: Confirmar que o teste falha**

Run: `npx vitest run src/pages/SilvanaMemorial.styles.test.js`

Expected: FAIL porque o memorial ainda importa e usa Fraunces/Work Sans.

- [ ] **Step 3: Substituir os tokens visuais**

Atualizar a raiz do memorial, hero, vídeo, formulário, contador e rodapé para
usar a paleta clara e a fonte Elza já carregada pelo site. Manter cortiça e
post-its com saturação reduzida e usar vermelho somente em acentos e ações.

- [ ] **Step 4: Confirmar que o teste passa**

Run: `npx vitest run src/pages/SilvanaMemorial.styles.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/SilvanaMemorial.css src/pages/SilvanaMemorial.styles.test.js
git commit -m "feat: align Silvana memorial with Otimiza identity"
```

### Task 2: Validar integração e apresentação

**Files:**
- Verify: `src/pages/SilvanaMemorial.jsx`
- Verify: `src/components/memorial/*.jsx`

- [ ] **Step 1: Executar testes do memorial**

Run: `npx vitest run src/pages/SilvanaMemorial.styles.test.js src/pages/SilvanaMemorial.test.jsx src/components/memorial/MemorialAccessForm.test.jsx src/components/memorial/MemorialBoard.test.jsx src/SilvanaRoute.test.jsx`

Expected: todos passam.

- [ ] **Step 2: Executar lint e build**

Run: `npx eslint src/pages/SilvanaMemorial.jsx src/pages/SilvanaMemorial.styles.test.js src/components/memorial`

Run: `npm run build`

Expected: ambos concluem sem erros.

- [ ] **Step 3: Iniciar o servidor local**

Run: `$env:MEMORIAL_QA_MODE='1'; npm run dev -- --host localhost --port 5173 --strictPort`

Expected: Vite imprime `http://localhost:5173`.

- [ ] **Step 4: Verificar desktop e mobile no localhost**

Abrir `http://localhost:5173/silvana-bettiol` e conferir paleta, tipografia,
contraste, foco, quadro e ausência de overflow. Em desktop e mobile, rolar a
página e confirmar que o frame do vídeo cresce. Com `convidada@example.com`,
executar o ciclo completo acesso → publicação → edição → exclusão e confirmar
que o mural retorna ao estado vazio.

- [ ] **Step 5: Encerrar a sessão de QA**

Encerrar apenas o processo Vite iniciado para a verificação, salvo quando o
usuário pediu explicitamente que o localhost permaneça publicado.

- [ ] **Step 6: Commit de correções finais**

Criar um commit somente se a revisão visual exigir ajustes adicionais.
