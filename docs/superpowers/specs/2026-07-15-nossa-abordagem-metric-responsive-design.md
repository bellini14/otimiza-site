# Design: responsividade do bloco métrico de Nossa Abordagem

## Objetivo

Melhorar a leitura do bloco que começa com “Desde 1990” na página Nossa Abordagem. Em telas largas, o conteúdo deve ocupar uma área menor, com mais margem nas laterais. O termo interativo “jobs to be done” deve permanecer inteiro na mesma linha sempre que aparecer, sem permitir quebra entre suas palavras.

## Contexto e causa

O bloco atualmente usa largura máxima de `1320px` e perde o padding lateral no breakpoint `lg`. Além disso, `JobsToBeDoneTerm` é um elemento inline comum, então o navegador pode quebrar o termo nos espaços internos. Essa combinação deixa o texto excessivamente próximo às bordas e separa “jobs to be done” em duas linhas.

## Solução aprovada

- Reduzir a largura máxima do conteúdo métrico de `1320px` para `1180px` com a classe `max-w-[1180px]`.
- Usar padding lateral `px-6 sm:px-8 lg:px-10`, mantendo respiro interno também em telas grandes.
- Aplicar comportamento de não quebra somente ao elemento `JobsToBeDoneTerm`.
- Preservar tipografia, cores, altura mínima, animação de entrada, tooltip e modal existentes.
- Em telas estreitas, permitir que o termo completo passe para a linha seguinte como uma unidade; o restante do parágrafo continua quebrando normalmente.

## Alternativas consideradas

1. Reduzir apenas a fonte: descartado porque altera a hierarquia visual e não garante que o termo permaneça inteiro.
2. Inserir uma quebra manual antes do termo: descartado porque produziria composição rígida e inadequada entre diferentes larguras.
3. Reduzir o contêiner e tornar o termo indivisível: escolhida por resolver os dois sintomas com comportamento responsivo natural.

## Testes e validação

- Adicionar uma asserção de regressão que confirme `max-w-[1180px]` e `px-6 sm:px-8 lg:px-10` no contêiner métrico.
- Adicionar uma asserção de regressão que confirme o comportamento `white-space: nowrap` do termo.
- Executar o teste focado de `NossaAbordagem` e a suíte relevante.
- Verificar visualmente o bloco em viewport desktop semelhante à captura e em viewport móvel, confirmando ausência de overflow horizontal.

## Fora de escopo

- Alterar o conteúdo do texto.
- Redesenhar tooltip ou modal de “jobs to be done”.
- Modificar outros blocos da página.
