# Seção editorial de encerramento

## Objetivo

Transformar a seção iniciada por “A consultoria que vai lá e faz.” em uma composição editorial com hierarquia clara, melhor ritmo de leitura e assinatura compacta, preservando o fundo branco e a identidade da página.

## Estrutura visual

- A abertura usa as três primeiras frases como título editorial, com maior presença e entrelinha compacta.
- O manifesto agrupa as duas frases seguintes em uma coluna de leitura com `max-width: 32rem` e uma linha vermelha vertical de `1px`.
- “Há 35 anos, é isso que fazemos.” funciona como fechamento destacado do manifesto.
- “Silvana Tiburi Bettiol” e “Fundadora, Diretora e Consultora” formam uma assinatura compacta, com `gap: 0.35rem`, nome em `1.05rem`, cargo em `0.9rem` e `line-height: 1.35`.
- Não há caixas, cartões, fundos adicionais ou sombras.

## Responsividade

- Em larguras de até 767px, a seção usa uma coluna, `padding: 5rem 1.5rem` e `gap: 3.5rem` entre abertura e conteúdo editorial.
- A abertura usa `font-size: clamp(2.25rem, 10vw, 3.25rem)` e `line-height: 0.98`.
- O manifesto usa `font-size: clamp(1.1rem, 4.8vw, 1.3rem)` e `line-height: 1.55`.
- No desktop, a abertura ocupa a coluna esquerda e manifesto/assinatura a coluna direita.

## Movimento

- A composição inteira, abertura, manifesto e assinatura, inicia com `opacity: 0` e deslocamento vertical de `1.25rem`.
- Um único `IntersectionObserver` ativa a seção quando ela cruza uma faixa de 10% ao redor do centro da tela, usando `rootMargin: -45% 0px -45% 0px` e `threshold: 0`.
- Todos os grupos aparecem simultaneamente e permanecem visíveis depois da primeira ativação, tanto no mobile quanto no desktop.
- A transição usa `opacity 700ms` e `transform 760ms`, ambas com `cubic-bezier(0.22, 1, 0.36, 1)`, sem atrasos entre grupos.
- Com `prefers-reduced-motion`, o conteúdo aparece imediatamente e sem transição.

## Validação

- Teste automatizado confirma um `section` rotulado pela abertura, um `blockquote` para o manifesto, um `footer` para a assinatura, classes dos três grupos, linha vermelha e configuração do observador mobile.
- Validação visual em `390 × 844` confirma hierarquia, alinhamento, ausência de sobreposição e assinatura compacta.
- Build de produção deve concluir sem erros.
