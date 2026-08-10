# Quem Somos — seções mobile

## Objetivo

Refinar todas as seções abaixo do hero da página Quem Somos em telas menores que 1024 px. Cada bloco deve ficar visualmente centralizado no viewport, enquanto títulos, parágrafos, listas e ações permanecem alinhados à esquerda para facilitar a leitura.

## Escopo

Alterar `src/pages/QuemSomos.jsx`, os estilos específicos em `src/index.css` e os testes de `src/pages/QuemSomos.test.jsx`. `package.json` e `package-lock.json` também podem receber `@testing-library/user-event` como dependência de desenvolvimento, autorizada pelo usuário para validar a ativação nativa por teclado. As seções cobertas são: narrativa inicial, três vértices, estratégia, missão e consultores. O carrossel de logos mantém seu comportamento atual.

## Sistema mobile compartilhado

- Usar o shell lateral existente, com 1.5 rem até 639 px e 2 rem a partir de 640 px.
- Criar uma coluna de leitura centralizada com largura máxima de 36 rem.
- Manter conteúdo textual alinhado à esquerda, com entrelinha mínima de 1.5 para textos corridos.
- Usar padding vertical de 5 rem abaixo de 640 px e 6 rem entre 640 e 1023 px. A partir de 1024 px, preservar 7 rem na narrativa, 9 rem em vértices/estratégia/consultores e 10 rem na missão.
- Usar `clamp(2.25rem, 10vw, 3.35rem)` nos títulos principais mobile, sem overflow ou palavras cortadas.
- Botões ocupam toda a largura abaixo de 640 px e voltam ao tamanho intrínseco a partir de 640 px, inclusive exatamente em 640 px.

## Tratamento por seção

### Narrativa inicial

Limitar os parágrafos revelados a 36 rem, centralizar o bloco e manter texto à esquerda no mobile. Usar `clamp(1.5rem, 7vw, 2.35rem)` e entrelinha 1.3 abaixo de 1024 px, preservando a animação por palavras. No desktop, preservar o máximo de 1320 px, `clamp(1.8rem, 2.8vw, 3.2rem)`, entrelinha 1.26 e alinhamento justificado atual.

### Três vértices

Centralizar o container geral. Alinhar eyebrow e título principal à esquerda no mobile. Manter os cards em rolagem horizontal com gap de 0.75 rem, largura mínima de 14 rem, `scroll-snap-type: x mandatory`, cada card com `scroll-snap-align: start` e padding inferior de 0.5 rem. O painel ativo usa margem superior de 3 rem, padding superior de 2.5 rem e uma coluna de até 36 rem centralizada; título, descrição e ação ficam alinhados à esquerda.

Os cards continuam sendo botões nativos. Tab deve alcançar cada card, o foco deve permanecer visível e Enter/Espaço deve atualizar `aria-pressed` e o painel ativo. Ao receber foco, o navegador deve trazer o botão horizontalmente para a área visível; não serão adicionados atalhos de seta personalizados.

### Estratégia

Centralizar o bloco de até 36 rem. Manter título, introdução, itens, fechamento e botão alinhados à esquerda. Usar gap de 1.5 rem entre itens, 1.25 rem entre marcador e texto e marcadores de 0.65 rem.

### Missão

Esta é a única exceção editorial: todos os seus elementos de conteúdo — apenas eyebrow e citação — permanecem centralizados. Usar `clamp(1.75rem, 7vw, 2.35rem)`, entrelinha 1.32 e largura máxima de 36 rem no mobile. Manter o ícone decorativo contido pelo `overflow-hidden` da seção.

### Consultores

Centralizar uma coluna de até 36 rem. Manter título, quatro parágrafos e botão alinhados à esquerda. Usar gap de 1.25 rem e entrelinha 1.65 nos textos corridos.

## Responsividade e acessibilidade

- A partir de 1024 px, preservar: narrativa com 1320 px e texto justificado; vértices com heading central, três colunas e painel em duas colunas; estratégia no lado direito do grid `0.45fr 0.55fr`; missão centralizada com padding de 10 rem; consultores no lado esquerdo de duas colunas. Registrar screenshots de 1024 x 900 e 1440 x 900 antes e depois.
- Não introduzir overflow horizontal além da faixa intencional dos cards de vértices.
- O carrossel aceita gesto/rolagem e navegação Tab pelos botões; Enter/Espaço seleciona o card. O painel textual abaixo sempre expõe o conteúdo do botão marcado com `aria-pressed="true"`.
- Preservar `prefers-reduced-motion` e a ordem semântica.
- Em 390 x 844, testar zoom do navegador em 200%. Também substituir temporariamente via DevTools cada texto por uma versão 25% maior. Critério: nenhum texto, botão ou foco é cortado, não há overflow horizontal da página e toda ação permanece alcançável.

## Verificação

- Teste de DOM para semântica dos botões, `aria-pressed` e atualização do painel via teclado.
- Teste de contrato CSS para larguras, alinhamentos e breakpoints, complementado por inspeção de estilos computados no navegador; classes não serão a única evidência.
- Execução dos testes da página Quem Somos e do header.
- Lint focal e build de produção.
- Inspeção visual em 320 x 568, 390 x 844, 768 x 1024, 1023 x 900, 1024 x 900 e 1440 x 900, incluindo comparação desktop antes/depois, foco visível, reduced motion e ausência de overflow da página.
