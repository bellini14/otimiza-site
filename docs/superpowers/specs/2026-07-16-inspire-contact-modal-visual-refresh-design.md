# Refinamento visual do modal de contato do Inspire

## Objetivo

Dar mais presença editorial ao modal de contato dos artigos sem perder a identidade visual do Inspire nem alterar seu comportamento.

## Cabeçalho

- Posicionar o ícone `MessageCircle` à esquerda do título, dentro de um círculo com a superfície cinza-clara já usada nos botões do Inspire.
- Aumentar o título **Converse sobre este artigo** para criar a principal hierarquia visual do modal.
- Adicionar abaixo do título a frase curta: **Compartilhe uma dúvida, percepção ou aplicação prática.**
- Manter o botão de fechar à direita, alinhado ao conjunto de título e ícone.

## Conteúdo

- Preservar o cartão contextual do artigo, refinando raio, espaçamento e contraste sem introduzir novas cores de marca.
- Simplificar o texto introdutório restante para evitar repetição com o novo subtítulo: **A equipe da Otimiza responderá pelo seu e-mail.**
- Melhorar a leitura dos campos com espaçamento vertical e estado de foco mais evidente.
- Dar mais presença ao botão de envio usando a cor de texto do Inspire como fundo e texto branco, mantendo o formato arredondado.

## Identidade e responsividade

- Usar somente `--inspire-text`, `--inspire-button-surface`, branco e tons derivados já presentes no tema.
- Preservar fonte Elza, bordas finas, cantos suaves e movimento discreto.
- No mobile, manter título, ícone e botão de fechar legíveis sem aumentar a altura além da viewport; o conteúdo continua rolável internamente.

## Comportamento preservado

- Portal, backdrop, Escape, clique externo, focus trap, restauração de foco e bloqueio de scroll permanecem inalterados.
- Payload, campos, estados de carregamento, sucesso e erro permanecem inalterados.

## Testes

- Exigir a presença do ícone decorativo junto ao título e do novo texto de apoio.
- Atualizar o contrato de CSS para a nova hierarquia do cabeçalho, cartão contextual, foco dos campos e botão primário.
- Rodar testes focados, lint dos arquivos alterados e build.
