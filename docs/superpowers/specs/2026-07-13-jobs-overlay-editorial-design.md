# Jobs to Be Done: overlay editorial mobile

## Objetivo

Substituir o painel branco do modal mobile por uma composição tipográfica diretamente sobre o overlay preto com 80% de opacidade e desfoque do fundo.

## Composição

- O overlay ocupa todo o viewport e bloqueia a rolagem da página ao fundo.
- O conteúdo fica centralizado vertical e horizontalmente, em uma coluna com `max-width: 34rem` e largura de `calc(100% - 3rem)`.
- Não há painel, caixa, borda ou sombra ao redor do conteúdo.
- O título aparece em branco, entre 1.75rem e 2rem, com peso leve.
- O corpo aparece em cinza-claro, com `font-size: clamp(1.1rem, 4.8vw, 1.25rem)` e `line-height: 1.55`.
- O botão de fechar permanece isolado no canto superior direito do viewport.
- Em viewports com menos de 700px de altura, o overlay permite rolagem interna, alinha o conteúdo a partir do topo e mantém pelo menos 5rem no topo e 2rem na base.

## Comportamento

- Em larguras de até 767px, o clique em “jobs to be done” abre apenas o overlay mobile; o tooltip desktop continua oculto nesse breakpoint.
- Escape, clique fora do conteúdo e o botão X fecham o overlay.
- Ao fechar, a rolagem da página é restaurada.

## Validação

- Teste automatizado confirma que o modal é renderizado no `body` e não usa uma superfície branca.
- Validação visual em `390 × 844` confirma cobertura integral, conteúdo centralizado, ausência de caixas brancas, fundo `rgb(0 0 0 / 0.8)` e X no canto superior direito.
- Validação visual em `390 × 667` confirma rolagem interna e os espaçamentos mínimos para telas baixas.
- O build de produção deve concluir sem erros.
