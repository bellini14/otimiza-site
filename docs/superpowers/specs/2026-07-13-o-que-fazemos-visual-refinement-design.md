# Refinamento visual da página “O Que Fazemos”

## Objetivo

Elevar a qualidade visual, tipográfica, responsiva e cinética da página `/o-que-fazemos`
sem alterar seu conteúdo, sua estrutura semântica, suas rotas ou seu funcionamento.
A página continuará apresentando o hero e os mesmos 11 serviços em capítulos sticky,
com os mesmos títulos, textos, números decorativos e CTAs.

## Restrições

- Preservar a fonte Elza e a paleta institucional: vermelho, cinza-azulado e superfícies claras.
- Não adicionar ou remover conteúdo, serviços, controles, imagens ou funcionalidades.
- Manter `Link` para `/contato`, `aria-labelledby`, títulos semânticos, ordem dos serviços,
  números decorativos e integração com a transição global.
- Não adicionar bibliotecas. Usar Motion, GSAP/SplitText e Lenis já presentes.
- Preservar as alterações locais existentes no worktree.
- Limitar a implementação a `OQueFazemos.jsx`, aos estilos específicos da página em
  `index.css` e ao teste correspondente.

## Abordagens consideradas

### 1. Refino editorial cinético — escolhida

Manter a composição atual e aperfeiçoar hierarquia, espaçamento, superfícies e movimento.
O progresso de scroll de cada capítulo recebe amortecimento por spring e movimenta somente
os elementos existentes: título, conteúdo, campo visual e overlay. É a opção que entrega a
melhoria pedida com menor risco de descaracterização ou regressão funcional.

### 2. Tratamento cinematográfico

Usar escalas maiores, blur, rotação e transições mais dramáticas entre capítulos. Produziria
mais impacto, mas competiria com o conteúdo consultivo, poderia causar desconforto e se
afastaria da sobriedade visual da Otimiza.

### 3. Refino estático

Alterar apenas tipografia, espaçamento e cores em CSS. Seria a opção mais conservadora, mas
não atenderia suficientemente ao pedido de animações mais fluidas e scroll mais interativo.

## Direção visual

A estética será editorial, sóbria e precisa. O hero permanece leve e centralizado. Os
capítulos continuam amplos, mas o contraste entre título, introdução, rótulos, explicações e
CTA fica mais claro. A superfície recebe profundidade discreta por gradientes e linhas já
compatíveis com a linguagem atual, sem criar novos elementos gráficos.

O título principal mantém o preset compartilhado das páginas internas. Nos capítulos:

- o `h2` ganha escala fluida e melhor largura útil;
- a introdução permanece como segundo nível, com peso e line-height mais confortáveis;
- rótulos “Processo” e “Resultado(s)” deixam de parecer texto auxiliar minúsculo;
- parágrafos passam a uma faixa legível em desktop e mobile;
- o CTA ganha proporção, área de leitura e estado `focus-visible` coerentes.

## Layout desktop e tablet

- Manter full bleed, shell de 1320 px, painel de 100svh e sobreposição sticky.
- Corrigir a grade residual do heading, que ainda reserva espaço para um número pequeno já
  ausente do JSX.
- Preservar o número grande no campo visual lateral e melhorar sua integração com a
  superfície, sem mudar seu conteúdo.
- Ajustar espaçamentos com `clamp()` para funcionar também em telas desktop mais baixas.
- Preservar o breakpoint que oculta o campo visual em larguras menores ou iguais a 1024 px.

## Layout mobile

- Manter o mesmo capítulo em tela cheia e a mesma ordem de leitura.
- Remover a disputa entre rolagem interna invisível do painel e rolagem global; o gesto terá
  um único dono, Lenis/documento.
- Reequilibrar padding vertical, espaço entre heading e conteúdo e escala dos textos para
  larguras de 320–767 px.
- Em alturas a partir de 700 px, manter o painel sticky de 100svh e fazer todos os textos
  caberem sem truncamento, inclusive nos cartões mais longos.
- Em alturas de até 699 px, priorizar legibilidade: desmontar a sobreposição sticky somente
  nesse breakpoint, permitir que o painel cresça e manter toda a rolagem no documento. Esse
  fallback não altera conteúdo, ordem ou destino dos CTAs.
- Manter o número grande oculto, como já ocorre hoje.

## Movimento e scroll

Cada `ServiceChapter` continuará usando seu `useScroll`, com o mesmo target e offsets. O
progresso bruto será suavizado por `useSpring`, evitando respostas secas do overlay e das
entradas. Esse progresso dirigirá transformações discretas nos wrappers existentes:

- heading: pequena subida e fade-in;
- conteúdo: entrada posterior, com subida curta e fade-in;
- campo visual: deslocamento horizontal e escala muito sutis;
- overlay: escurecimento progressivo menos abrupto durante a sobreposição.

Não haverá animação decorativa contínua, cursor personalizado ou elementos novos. Em
`prefers-reduced-motion: reduce`, a pilha continuará linear e todas as transformações da
página — inclusive caracteres do título — serão neutralizadas.

## Acessibilidade e robustez

- Preservar H1/H2/H3, `aria-labelledby`, `aria-hidden` do visual e nome acessível do CTA.
- Adicionar paridade de teclado ao hover do CTA com `:focus-visible`.
- Manter contraste dentro da paleta atual.
- Não depender de hover para comunicar conteúdo.
- Evitar nested scroll no mobile e manter fallback linear para reduced motion.
- Preservar a exceção do último capítulo e o z-index do footer.

## Testes e validação

O trabalho seguirá TDD. Primeiro, o teste de `OQueFazemos` será ampliado para descrever:

- preservação dos 11 capítulos, conteúdo e CTA;
- uso de progresso amortecido e camadas animadas nos elementos existentes;
- nova escala tipográfica e hierarquia;
- ausência de rolagem interna no painel mobile;
- neutralização completa em reduced motion;
- preservação da geometria sticky, último painel e footer.

Depois serão executados o teste focado, a suíte relacionada, a suíte completa, lint e build.
A validação visual cobrirá desktop e mobile, inclusive os limites 767/768/770/771/1024 px,
390 × 844 px para a experiência sticky, 360 × 640 px para o fallback de altura reduzida e
`prefers-reduced-motion`. Os critérios mensuráveis serão: nenhum overflow horizontal,
nenhum painel com scroll interno, nenhum texto/CTA fora de sua superfície e footer acessível.
