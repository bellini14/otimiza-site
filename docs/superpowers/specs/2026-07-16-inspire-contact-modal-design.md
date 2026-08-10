# Modal de contato dos artigos Inspire

## Objetivo

Ao acionar **Contato** na barra de ações de um artigo Inspire, abrir o formulário contextual em uma caixa modal central em vez de expandi-lo dentro da barra lateral direita.

## Escopo

- Manter o botão **Contato** e sua posição atual ao lado de **Curtir** e **Compartilhar**.
- Preservar o conteúdo do formulário, o payload enviado para `/api/contact`, os estados de carregamento, sucesso e erro e a manutenção dos valores em caso de falha.
- Remover o painel expansível da barra lateral e apresentar o mesmo conteúdo em um portal no `document.body`.
- Seguir o padrão visual já usado pela caixa **Compartilhar artigo**: camada de fundo, cartão central, cabeçalho com título e botão de fechar, largura responsiva e adaptação para telas pequenas.

## Comportamento

1. O botão **Contato** informa `aria-haspopup="dialog"`, mantém `aria-expanded="false"` quando fechado e abre o modal com `aria-expanded="true"`.
2. O modal usa `role="dialog"`, `aria-modal="true"` e título associado por `aria-labelledby`.
3. Ao abrir, o foco vai para o botão de fechar.
4. O modal fecha pelo botão X, pela tecla Escape ou por clique direto na camada externa; cliques dentro do cartão não fecham a caixa por propagação.
5. Ao fechar, o foco volta ao botão **Contato**.
6. Enquanto aberto, o scroll do documento fica bloqueado e é restaurado no fechamento/desmontagem.
7. O formulário continua aberto após o envio para exibir o resultado. Fechar e reabrir não apaga os campos nem o status automaticamente; o comportamento existente de reset após sucesso e preservação após erro permanece.

## Estrutura e estilos

`PostArticleContactPanel.jsx` continuará responsável pelo gatilho, modal, formulário e envio, evitando uma refatoração ampla sem benefício direto. A estrutura expansível `post-detail__contact-panel-shell` será substituída por uma camada `post-detail__contact-screen` e um cartão `post-detail__contact-dialog`, renderizados por `createPortal`.

Os estilos específicos do antigo painel expansível serão substituídos pelos estilos do modal. O formulário reaproveitará suas classes atuais sempre que ainda representarem a mesma responsabilidade. O cartão terá limite de largura e altura, rolagem interna quando necessário e margens seguras no mobile.

## Acessibilidade

- Semântica modal completa e nome acessível.
- Fechamento por Escape e retorno de foco ao gatilho.
- Foco inicial explícito no botão de fechar.
- Contenção de Tab e Shift+Tab entre os elementos interativos do diálogo enquanto ele estiver aberto.
- Conteúdo fora do modal visualmente separado por backdrop.
- Estados de envio continuam anunciados por `status` ou `alert`.
- Movimento reduzido desativa transições do modal.

## Testes

- Atualizar o teste de integração de `PostDetail` para comprovar que o formulário nasce fora da sidebar, abre como diálogo em portal e envia o payload existente.
- Cobrir fechamento por X, Escape e clique direto no backdrop, além do retorno e contenção de foco e atributos ARIA.
- Manter os testes de sucesso e erro do envio.
- Atualizar os testes de CSS do tema Inspire para exigir o novo layout modal e eliminar as expectativas do painel expansível.
- Executar os testes focados, a suíte completa, lint e build.

## Fora de escopo

- Alterar campos, textos, destinatário ou endpoint do formulário.
- Criar um componente modal genérico ou refatorar a caixa de compartilhamento.
- Alterar os demais elementos da barra lateral ou da página de contato.
