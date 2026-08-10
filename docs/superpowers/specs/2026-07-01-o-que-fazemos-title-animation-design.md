# Animação do título “O Que Fazemos”

## Objetivo

Aplicar ao título principal da página “O Que Fazemos” exatamente a mesma animação usada pelo título principal da página “Quem Somos”.

## Implementação

- Importar o componente existente `SplitText` em `src/pages/OQueFazemos.jsx`.
- Substituir somente o `h1` atual pelo componente `SplitText`.
- Preservar o `id`, o texto e a classe CSS atuais do título.
- Copiar sem alterações os parâmetros de animação usados em `QuemSomos.jsx`: divisão por caracteres, atraso, duração, easing, posições inicial e final, threshold, root margin e alinhamento.
- Não alterar a animação do subtítulo, o layout do hero nem as seções de serviços.

## Acessibilidade

O título continuará sendo renderizado como `h1`, manterá seu texto acessível e continuará associado ao `aria-labelledby` da página pelo mesmo `id`.

## Teste

Adicionar primeiro um teste de componente que confirme que “O Que Fazemos”:

- continua sendo um `h1`;
- mantém o `id` esperado;
- é renderizado pelo wrapper `SplitText`, comprovado pela classe estrutural já usada pelo componente.

Depois da implementação, executar o teste específico da página e a suíte relacionada.
