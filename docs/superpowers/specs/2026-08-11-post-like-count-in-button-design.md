# Contador de curtidas dentro do botão do post

## Objetivo

Exibir o número de curtidas dentro do botão textual de cada post, na ordem visual `coração → contador → rótulo`, por exemplo `♡ 0 Curtir`.

## Escopo

- Aplicar a ordem apenas à variante do botão que exibe rótulo (`showLabel`).
- Manter o contador fora do botão nas variantes somente com ícone.
- Preservar os comportamentos existentes: carregamento do total, atualização otimista, alternância entre “Curtir” e “Curtido”, animação e atributos ARIA.
- Não alterar API, persistência local ou dados de curtidas.

## Implementação

`PostLikeButton` continuará a produzir o elemento reutilizável do contador. Na variante rotulada, ele será renderizado depois do invólucro do ícone e antes do rótulo. Assim, o botão passa a apresentar `ícone → contagem → texto` sem criar um elemento duplicado ou alterar a estrutura da variante compacta.

## Testes

- Atualizar o teste do botão rotulado para verificar que a contagem está dentro do botão, imediatamente após o ícone e antes do rótulo.
- Executar os testes direcionados e a suíte completa, além de lint e build de produção.

## Publicação segura

O repositório local está divergente do remoto. Antes de qualquer deploy de produção, buscar os refs atuais, rebasear os commits locais sobre a branch remota sem `reset` ou push forçado, resolver conflitos de forma explícita e verificar o diff final. Após validação, publicar com o projeto Vercel já vinculado e confirmar a URL de produção.
