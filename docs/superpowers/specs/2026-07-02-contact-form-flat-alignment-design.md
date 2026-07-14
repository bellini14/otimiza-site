# Formulário de contato sem painel — design

## Objetivo

Remover a caixa branca atrás do formulário de contato e alinhar todo o conteúdo às margens horizontais da caixa branca do menu.

## Solução

- Manter a estrutura, os campos, o envio e a responsividade atuais.
- Usar `1320px`, o mesmo limite máximo da superfície do menu, no `contact-shell`.
- Remover fundo, sombra, cantos arredondados e padding do `contact-form-panel`.
- Preservar o espaçamento vertical da seção e entre os elementos do formulário.

## Verificação

Um teste de contrato de estilos deve proteger o limite de `1320px` e a ausência das propriedades visuais da antiga caixa. Os testes existentes do formulário devem continuar passando, e a página deve ser conferida visualmente em desktop e mobile.
