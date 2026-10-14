# Verificação da correção de SEO Inspire

## Base preservada
- Produção consultada pela API Vercel em 14/10/2026: dpl_CGvH1h7b6X1u9bV5UrfJDBoxZAAN, READY, commit cf88af980777dece95d41c53e2da32e4d0659040.
- origin/main contém exatamente esse commit. Worktree criado dessa base; `git merge-base --is-ancestor origin/main HEAD` retorna 0. Sem mudanças em src, index.html, dependências ou APIs existentes.

## Evidência funcional
- Testes focados: 81 passando, incluindo API, renderer, build de HTML, rewrites, Studio, PostDetail, SeoHead e idioma.
- Build de site e build do Studio: exit 0. ESLint dos arquivos de código alterados: exit 0.
- Preview final: https://otimiza-site-eqt262qas-joaos-projects-d59362fd.vercel.app.
- URL datada do post de 28/09 retorna 200, título próprio, og:image 1200x630, Twitter image e no-store.
- Preview anterior confirmou post de 06/10 por URL datada e /inspire/:slug, shell com assets do build e canonical datado. Post inexistente retorna 404 sem cache.
- Preview final confirmou slug legado codificado de Ritos e rituais (06/01/2025) com 200 e título correto.
- Teste de regressão simula artigo novo e troca de imagem entre requisições sem reconstrução do site.

## Falhas preexistentes
A suíte geral inicial teve 7 arquivos falhando, 602 testes passando, 5 falhando e 3 ignorados. Instalação do Studio corrige as falhas por dependências ausentes. Testes repetidos na base cf88af9 reproduzem falhas de Home (3), auditoria de alt (1) e erro de importação de overlayGeometry. NossaAbordagem passa na base isolada; timeout inicial ocorreu durante instalações concorrentes. Essas áreas não foram modificadas.

A execução final da suíte completa teve 607 testes passando, 5 falhando e 3 ignorados (4 arquivos com falhas). A falha adicional de PostDetail — metatag ainda ausente no instante da asserção — foi reproduzida executando o mesmo teste na base cf88af9. Nenhuma dessas áreas foi alterada pela correção.

O check GitHub Verify production safety passou. O primeiro preview automático GitHub retornou `Resource provisioning failed` antes do build; ambos os previews CLI concluíram o build. Repetir o deployment GitHub antes da integração.

## Publicação
Integrar via PR com Verify production safety, sem force push, após nova consulta da produção e ancestry. Publicar Studio para ativar campos obrigatórios. Verificar deployment correspondente à main integrada e metadados dos três posts recentes.
