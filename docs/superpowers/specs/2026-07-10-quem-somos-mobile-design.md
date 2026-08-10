# Quem Somos — refinamento mobile

## Objetivo

Melhorar a composição do `quem-somos-hero` em `src/pages/QuemSomos.jsx` em telas menores que 1024 px, centralizando o conteúdo e criando uma hierarquia visual mais clara sem alterar as demais seções ou a identidade visual existente.

## Direção escolhida

Preservar a estrutura e os elementos atuais, refinando exclusivamente o comportamento mobile. O título, o texto introdutório, o card de destaque e o indicador de rolagem ficam centralizados. A largura dos blocos de texto é limitada para favorecer leitura, e os espaçamentos verticais são reduzidos para evitar grandes áreas vazias.

## Layout mobile

- Abaixo de 1024 px, a abertura usa uma única coluna centralizada, com `gap` entre 1.5 e 2.5 rem e padding lateral do shell existente (1.5 rem; 2 rem a partir de 640 px).
- O título usa `clamp(2.75rem, 13vw, 4.5rem)`, centralizado. Pode quebrar de forma natural apenas se o viewport ou conteúdo expandido não comportar a linha; não pode causar overflow.
- O texto introdutório recebe largura máxima de 36 rem, alinhamento central, entrelinha de aproximadamente 1.35 e margem superior entre 1.25 e 1.75 rem.
- O card recebe largura máxima de 33 rem, conteúdo centralizado, padding mínimo de 1.5 rem e mantém a margem lateral do shell.
- A foto usa `object-position` mobile com o foco deslocado para aproximadamente 60% no eixo horizontal. A sobreposição clara deve preservar contraste WCAG AA: 4,5:1 para texto normal e 3:1 para texto grande.
- O hero usa pelo menos `100svh`; o conteúdo pode aumentar sua altura e rolar em aparelhos baixos. O indicador fica no fluxo após o card, centralizado, com respiro mínimo de 1.5 rem e sem sobreposição ou dependência de posicionamento sobre safe areas.
- A partir de 1024 px, o layout atual em duas colunas, alinhamentos, espaçamentos e enquadramento da imagem são preservados.

## Acessibilidade e movimento

O contraste atende ao WCAG AA, a ordem semântica não muda e nenhum conteúdo essencial depende de hover. O suporte global já existente a `prefers-reduced-motion` deve continuar funcionando. O layout não pode produzir overflow horizontal, inclusive com zoom de 200%, texto ampliado ou conteúdo um pouco maior.

## Verificação

- Teste automatizado para o comportamento responsivo do hero e preservação do breakpoint desktop, evitando depender apenas de nomes de classes.
- Execução dos testes da página Quem Somos.
- Inspeção visual em 320 x 568, 390 x 844, 768 x 1024, 1023 x 900 e 1024 x 900.
- Verificação de ausência de overflow horizontal, sobreposição do indicador e regressão no layout desktop.
