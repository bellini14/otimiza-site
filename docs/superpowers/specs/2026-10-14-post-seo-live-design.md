# Metadados atuais para posts Inspire

O usuário aprovou corrigir a causa e publicar após comprovar preservação dos commits em produção.

## Evidência
Produção e origin/main estão em cf88af980777dece95d41c53e2da32e4d0659040. Posts de 25/09, 28/09 e 06/10 têm imagens públicas válidas, mas recebem HTML idêntico ao da home. Posts de 22/09 têm HTML específico. O build gera uma fotografia dos posts existentes; o React consulta conteúdo atual no navegador.

## Solução
Uma função Vercel serve o shell React com metadados de um post publicado consultado no endpoint Sanity sem CDN. Atende URLs datadas e /inspire/:slug, preserva o canonical datado, aceita GET/HEAD e mantém os assets do build. Não armazena HTML em cache, eliminando a necessidade de webhook de invalidação. Remover geração estática de posts para impedir precedência de arquivos antigos. Continuar geração das demais páginas e sitemap.

Imagem: destacada, primeira imagem do conteúdo e, para legado sem imagem, cartão Inspire. Novas publicações exigem imagem destacada e data no Studio. Ausência de post retorna 404; erro do CMS retorna 503 sem metadados da home e sem cache. Validar slug e data e excluir drafts.

## Segurança da publicação
Trabalhar em worktree criado de origin/main; não incluir alterações locais de outros trabalhos. Antes da integração, consultar produção novamente e comprovar que seu SHA e a main remota são ancestrais da branch. PR com check obrigatório, sem force push; verificar deployment e metadados em produção após merge.
