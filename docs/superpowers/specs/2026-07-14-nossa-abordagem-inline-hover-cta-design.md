# Nossa Abordagem Inline Hover CTA Design

## Objetivo

Substituir o par atual “Por que não?” + botão “Fale com a Otimiza” por um único link editorial. Em repouso, o link mostra “Por que não?”; no hover ou foco por teclado, o texto troca para “Fale com a Otimiza”. O destino continua sendo `/contato`.

## Composição visual

- O título “Decidir melhor agora” permanece inalterado.
- O link ocupa a posição atual de “Por que não?” e usa a mesma escala tipográfica do prompt existente.
- A aparência segue a referência: texto escuro, seta simples à direita e uma linha fina contínua sob todo o conjunto.
- O botão preenchido, a cápsula e o ícone circular deixam de existir.
- A largura do link acompanha o conteúdo, com espaço estável suficiente para o rótulo mais longo, evitando que a linha ou a seta saltem durante a troca. Os dois rótulos ficam na mesma célula de grid e usam `white-space: nowrap`; no mobile, o tamanho tipográfico fluido é limitado para o rótulo mais longo caber na largura disponível.

## Movimento

- O link contém duas camadas de texto sobrepostas dentro de uma janela com `overflow: hidden`.
- Em repouso, “Por que não?” está visível e “Fale com a Otimiza” aguarda abaixo.
- No hover ou `focus-visible`, o primeiro rótulo sobe e desaparece, enquanto o segundo sobe para a posição visível.
- Ao remover o hover ou foco, a animação percorre o caminho inverso.
- O deslocamento vertical usa `translateY(110%)`, relativo à altura real de cada rótulo, e a curva CSS `cubic-bezier(0.165, 0.84, 0.44, 1)` (`easeOutQuart`) aproxima o `power3.out` usado pelo título do hero.
- A duração é curta, de 280 ms. A seta permanece estável durante a troca de texto.
- Com `prefers-reduced-motion: reduce`, a troca ocorre sem deslocamento animado.

## Semântica e acessibilidade

- O elemento interativo é um único `<a href="/contato">` com nome acessível fixo “Por que não? Fale com a Otimiza”, incluindo os dois rótulos visuais e atendendo ao critério de label no nome.
- As camadas visuais e a seta são decorativas para tecnologias assistivas, evitando um nome acessível duplicado ou instável.
- `focus-visible` recebe contorno vermelho com afastamento suficiente da linha inferior.
- A área clicável ganha padding vertical transparente sem alterar a aparência editorial.

## Responsividade

- O CTA permanece inline no desktop e no mobile; não ocupa 100% da largura.
- A tipografia preserva a escala editorial do prompt no desktop e usa um clamp próprio no mobile para manter “Fale com a Otimiza” em uma linha.
- A janela de texto tem altura de uma linha em viewports comuns, as duas camadas são sobrepostas por grid e a largura é dimensionada pelo rótulo mais longo, limitada pela largura disponível. Em largura CSS extrema causada por zoom, `white-space` é liberado e a janela adota a altura do rótulo mais longo para preservar reflow sem overflow.

## Validação

- Um teste de componente confirma que existe apenas um link de contato no fechamento, que não existe botão ou CTA separado, que o nome acessível estável contém os dois rótulos visuais e que as duas camadas animadas possuem a estrutura esperada.
- Testes de CSS confirmam linha inferior, camadas sobrepostas, estados de hover/foco e redução de movimento.
- A página é inspecionada em desktop, 390 px e 320 px, incluindo hover, reversão, foco por teclado e navegação. Em 320 px e com zoom de 200%, rótulo, seta e linha devem permanecer dentro da viewport, admitindo quebra apenas quando necessária ao reflow.
- A suíte focada e o build de produção devem terminar com código zero.
