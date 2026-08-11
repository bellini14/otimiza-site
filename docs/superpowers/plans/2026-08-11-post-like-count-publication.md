# Post Like Count Publication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar com segurança o botão rotulado no formato `♡ 0 Curtir`, preservando os commits e as alterações locais não relacionadas.

**Architecture:** A alteração necessária já está presente e não requer nova lógica: `PostLikeButton` renderiza, para a variante rotulada, o ícone, o contador e o rótulo nessa ordem. O deploy será isolado em um worktree criado a partir de `origin/publish/2026-04-15-inspire-like-updates`, para incluir os quatro commits remotos e somente o commit de curtidas; o diretório de trabalho atual continuará intocado.

**Tech Stack:** React 19, Vite 8, Vitest, Testing Library, Git, Vercel CLI

---

### Task 1: Preservar e comprovar a alteração de curtidas já presente

**Files:**
- Modify: `src/components/PostLikeButton.jsx:161-192`
- Test: `src/components/PostLikeButton.test.jsx:59-75`

- [ ] **Step 1: Confirmar o teste de regressão da ordem desejada**

O teste precisa afirmar a estrutura abaixo, na variante `showLabel`:

```jsx
<span className="post-like-button__icon-shell">…</span>
<span className="post-like-button__count">{likeCount}</span>
<span className="post-like-button__label">Curtir</span>
```

- [ ] **Step 2: Executar o teste focado contra a alteração local**

Run: `npm test -- src/components/PostLikeButton.test.jsx`

Expected: PASS, incluindo a asserção de que o contador está dentro do botão, depois do coração e antes de “Curtir”.

- [ ] **Step 3: Conferir o diff para manter o escopo mínimo**

Run: `git diff --check -- src/components/PostLikeButton.jsx src/components/PostLikeButton.test.jsx`

Expected: nenhum erro de whitespace; somente a inserção de `visibleLikeCount`, a renderização condicional dentro/fora do botão e o teste de ordem.

- [ ] **Step 4: Revisar o conteúdo preparado e fazer stage seletivo**

Run:

```bash
git diff -- src/components/PostLikeButton.jsx src/components/PostLikeButton.test.jsx
git add -p -- src/components/PostLikeButton.jsx src/components/PostLikeButton.test.jsx
git diff --cached --check
git diff --cached --name-only
git diff --cached -- src/components/PostLikeButton.jsx src/components/PostLikeButton.test.jsx
```

Expected: o stage contém somente os trechos que criam `visibleLikeCount`, o colocam entre o coração e o rótulo da variante `showLabel`, e adicionam o teste dessa ordem. Se qualquer trecho não relacionado aparecer, removê-lo do stage com `git restore --staged -p` e repetir a revisão.

- [ ] **Step 5: Criar um commit exclusivo da alteração de curtidas**

Run:

```bash
git diff --cached --check
git diff --cached --name-only
git commit -m "fix: place post like count inside labeled button"
```

Expected: o commit inclui somente os hunks revisados dos dois arquivos e deixa todas as demais alterações locais sem stage.

### Task 2: Preparar uma cópia segura baseada no estado remoto atual

**Files:**
- No production files modified; create an isolated Git worktree.

- [ ] **Step 1: Atualizar referências e registrar a divergência**

Run:

```bash
git fetch origin --prune
git log --left-right --graph --oneline HEAD...origin/publish/2026-04-15-inspire-like-updates
```

Expected: os quatro commits remotos permanecem presentes na base de publicação.

- [ ] **Step 2: Criar um worktree em uma branch nova baseada no remoto**

Run:

```bash
git worktree add -b codex/post-like-count-production ..\\site-otimiza-post-like-production origin/publish/2026-04-15-inspire-like-updates
```

Expected: diretório atual e suas alterações não rastreadas continuam intactos; o worktree novo inicia no tip remoto.

- [ ] **Step 3: Aplicar apenas o commit de curtidas ao worktree isolado**

Run in `..\\site-otimiza-post-like-production`:

```bash
git cherry-pick <like-count-commit>
git diff origin/publish/2026-04-15-inspire-like-updates...HEAD --check
git diff --name-only origin/publish/2026-04-15-inspire-like-updates...HEAD
```

Expected: somente `PostLikeButton.jsx` e seu teste diferem da branch remota; nenhum commit remoto é descartado ou reescrito.

Se o cherry-pick parar por conflito, inspecionar `git status`, resolver apenas os conflitos em `PostLikeButton.jsx` e `PostLikeButton.test.jsx`, executar `git add -- <arquivo-resolvido>` e `git cherry-pick --continue`. Em seguida, repetir os dois comandos de diff acima. Se aparecer outro arquivo no diff, interromper com `git cherry-pick --abort` e investigar antes de publicar.

### Task 3: Verificar e publicar a cópia isolada

**Files:**
- Verify: `src/components/PostLikeButton.test.jsx`
- Verify: repository test suite and production build

- [ ] **Step 1: Executar a regressão de curtidas e a suíte completa no worktree**

Run from `..\\site-otimiza-post-like-production`:

```bash
npm test -- src/components/PostLikeButton.test.jsx
npm test
```

Expected: ambos retornam código 0, sem falhas.

- [ ] **Step 2: Executar lint e build de produção**

Run from `..\\site-otimiza-post-like-production`:

```bash
npm run lint
npm run build
```

Expected: ambos retornam código 0; o build conclui a geração do site estático.

- [ ] **Step 3: Verificar o destino Vercel antes da publicação**

Run from `..\\site-otimiza-post-like-production`:

```bash
vercel whoami
Get-Content -Raw .vercel/project.json
```

Expected: o worktree está vinculado ao projeto `otimiza-site` da conta esperada. Se necessário, copiar apenas `.vercel/project.json` ignorado do diretório original para o worktree; nunca copiar `.env.production.local` ou segredos.

- [ ] **Step 4: Publicar a build validada em produção**

Run from `..\\site-otimiza-post-like-production`:

```bash
vercel build --prod
vercel deploy --prebuilt --prod
```

Expected: a CLI retorna a URL de produção para o projeto vinculado; nenhum push forçado ou alteração do histórico remoto ocorre.

- [ ] **Step 5: Verificar a publicação**

Run:

```bash
vercel inspect <deployment-url>
vercel curl / --deployment <deployment-url>
```

Expected: deployment `Ready` e resposta HTTP bem-sucedida. Inspecionar a página de um post no navegador para confirmar a ordem `♡ 0 Curtir`.
