# Recuperação segura da página Silvana em produção

## Objetivo

Restaurar em `/silvana-bettiol` a experiência publicada no deployment de 4 de agosto de 2026 às 23:38, sem reverter nenhuma outra página do deployment atual e sem apagar ou recriar as mensagens já registradas.

## Evidências

- O domínio de produção aponta para `dpl_Amq7EgJRhXtXmizyeD5EXpRqWtsu`, criado em 5 de agosto às 10:32 a partir da raiz local, commit `96fd3f2`, com alterações locais.
- A revisão correta do memorial é `dpl_4bZL22jXvpRxwZgw22gWvYpPFpfT`, criado em 4 de agosto às 23:38 a partir da worktree local `.worktrees/memorial-experience-checkup`, branch `codex/memorial-experience-checkup`, commit `4367a23`, também com alterações locais.
- As mensagens são persistidas na tabela PostgreSQL `memorial_notes`; o deployment não contém nem recria os dados.
- Antes da correção, a API pública informa sete mensagens.

## Estratégia

Usar a API oficial de arquivos de deployment da Vercel para recuperar a árvore imutável de fontes e o conteúdo identificado por SHA-1 de cada arquivo. Criar o staging a partir dos arquivos de build do deployment atual (`src`, `api`, `public`, `scripts`, manifests e configurações na raiz), reconciliando qualquer cópia local por hash e baixando do artefato todo arquivo ausente ou divergente. Arquivos locais extras não presentes no artefato atual não entram no staging.

Sobrepor no staging somente a allowlist abaixo, baixada diretamente do artefato imutável do deployment correto do memorial:

- `api/_lib/memorialRequest.js`
- `api/_lib/memorialStore.js`
- `api/memorial/notes.js`
- `api/memorial/notes/[id].js`
- `public/memorial/silvana-poster.webp`
- `src/components/memorial/MemorialAccessForm.jsx`
- `src/components/memorial/MemorialBoard.jsx`
- `src/components/memorial/MemorialDust.jsx`
- `src/components/memorial/MemorialVideo.jsx`
- `src/lib/memorialApi.js`
- `src/lib/memorialPresentation.js`
- `src/lib/memorialVideoConfig.js`
- `src/pages/SilvanaMemorial.css`
- `src/pages/SilvanaMemorial.jsx`
- `src/seo/memorialMetadata.js`

Os testes correspondentes podem ser recuperados do mesmo artefato somente para validação local; não ampliam a fronteira de runtime. `vercel.json`, geração geral de SEO, outras rotas, componentes compartilhados e mídias idênticas permanecem exatamente no artefato atual.

Antes do preview, comparar os SHA-1 publicados pela Vercel com os arquivos reconstruídos e comparar o snapshot-base com o staging. O delta permitido deve ser exatamente a allowlist de runtime acima e os testes homônimos explicitamente recuperados. A origem não depende do estado atual das worktrees locais.

Não promover o deployment antigo inteiro, pois ele poderia reverter mudanças recentes em outras páginas. A alteração automática de `message` de `VARCHAR(280)` para `TEXT`, presente na revisão correta, é aditiva e preserva valores existentes. Não executar exclusões, recriação de tabela nem qualquer escrita manual na API ou no banco.

## Validação

1. Executar os testes focados do memorial e o build completo no staging.
2. Publicar um deployment de preview.
3. Validar que o delta completo do snapshot de fontes está restrito à allowlist. Como o aplicativo gera um bundle único, diferenças de hash no bundle compilado são esperadas; a fronteira verificável é o conjunto completo de fontes de entrada.
4. Fazer smoke test das rotas públicas e comparar conteúdo essencial do preview com a produção atual, além de validar especificamente o memorial, seus metadados e a API.
5. Promover o mesmo artefato validado para produção.
6. Imediatamente antes da promoção, capturar pela API somente leitura um hash determinístico de cada registro público, incluindo identificador e todos os campos retornados. Depois da promoção, confirmar que todos os registros pré-existentes continuam presentes com o mesmo hash, aceitando novos registros legítimos que possam chegar durante a troca.

## Reversão

Se a validação pós-promoção falhar, promover novamente o deployment atual `dpl_Amq7EgJRhXtXmizyeD5EXpRqWtsu`. Essa reversão troca apenas aliases e não altera o banco.
