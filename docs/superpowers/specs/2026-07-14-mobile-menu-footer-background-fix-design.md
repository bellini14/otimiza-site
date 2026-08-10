# Correção do fundo do rodapé do menu mobile

## Contexto

Na página Nossa Abordagem, a classe `nossa-abordagem-white-background` aplicada ao elemento `html` ativa uma regra que define fundo branco para qualquer elemento `footer`. O menu mobile contém um `footer` próprio para o seletor de idioma, então essa regra também o atinge e produz uma faixa branca com texto branco.

## Decisão

O rodapé principal do site receberá a classe explícita `site-footer`. As regras de fundo específicas de página passarão a selecionar `.site-footer`, em vez de todos os elementos `footer`.

O `footer` do menu mobile e seu seletor de idioma permanecerão inalterados e semanticamente separados do rodapé principal.

## Escopo

- Adicionar `site-footer` ao componente de rodapé principal.
- Restringir a regra `nossa-abordagem-white-background` ao rodapé principal.
- Restringir também a regra equivalente de `oquefazemos-sticky-scroll`, evitando o mesmo vazamento de estilo.
- Adicionar teste de regressão que comprove o uso do seletor específico e rejeite os seletores genéricos.

## Verificação

- O teste de regressão deve falhar antes da alteração e passar depois.
- A suíte relacionada a Header, Footer e Nossa Abordagem deve passar.
- O build de produção deve concluir sem erros.

