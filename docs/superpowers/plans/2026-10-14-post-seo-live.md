# Post SEO live implementation plan

**Goal:** Todo post publicado entrega imagem de SEO no HTML sem novo build.
**Architecture:** Função Node Vercel consulta Sanity em cada GET/HEAD e usa renderer existente com shell Vite incluído no bundle. Sem cache de HTML; fallback editorial para legado e validação no Studio.
**Tech Stack:** Node, Vercel, Sanity, Vitest.

- [ ] Criar testes de endpoint: post novo, edição de imagem sem deploy, HTML único, canonical, GET/HEAD, 404, 503, drafts e entrada inválida; executar e confirmar falha.
- [ ] Implementar api/post-page.js com dependências injetáveis, consulta parametrizada, timeout, shell dist/post-shell.html e renderer compartilhado.
- [ ] Testar build sem HTML estático datado, com shell de assets; remover geração estática de posts e ajustar rewrite /inspire/:slug e rota datada antes do fallback. Incluir shell na função via includeFiles.
- [ ] Testar e adicionar validação de imagem/data no Studio. Garantir fallback Inspire para legado sem imagem e remover tags antigas antes de renderizar.
- [ ] Executar testes focados, build e comparação com baseline para falhas gerais; revisar diff e endpoint em preview Vercel, incluindo post inexistente.
- [ ] Comprovar ancestry da main e deployment ativo; criar PR, aguardar check obrigatório e integrar sem reescrever histórico. Publicar Studio e verificar produção.
