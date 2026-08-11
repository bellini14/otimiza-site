# Inspire 155 — E-mail Editorial

## Objetivo

Refatorar o HTML do e-mail editorial Inspire e produzir a edição 155, com uma abertura para o artigo **“Extensão das Adjacências: A segunda avenida”**. O resultado deve preservar a identidade visual da Otimiza e ser legível, responsivo e seguro nos principais clientes de e-mail.

## Escopo

- Criar uma versão HTML completa e autocontida para disparo.
- Entregar separadamente o conteúdo a ser colado no campo **Custom Head HTML** da plataforma de disparo.
- Trocar a abertura atual pela seção de Rafael Andreolla:
  - selo/título de seção: `2ª Avenida — Extensão das Adjacências`;
  - título do artigo: `Extensão das Adjacências: A segunda avenida`;
  - texto aprovado pelo solicitante;
  - imagem da estrada sinuosa com motociclista fornecida pelo solicitante;
  - CTA com URL provisória, a ser substituída pela URL definitiva do post quando ele for publicado.
- Identificar a edição como **Inspire 155 — Editorial agosto de 2026**.
- Incluir os quatro posts mais recentes disponíveis no Inspire que não sejam dicas:
  1. `Eureka, Heurística e o Planejamento Estratégico` — 28/07/2026.
  2. `Difícil de copiar` — 21/07/2026.
  3. `Há uma diferença colossal entre a teoria e a prática.` — 13/07/2026.
  4. `Maximização do core: a primeira avenida` — 03/07/2026.
- Não incluir postagens cujo título ou categoria seja uma dica de leitura ou de conteúdo para assistir.

## Arquitetura do e-mail

O HTML usará tabelas de apresentação (`role="presentation"`) como estrutura principal, com uma tabela externa de 100% e um container central de 600 px. Os estilos essenciais permanecerão inline. As classes no Custom Head serão complementares: usadas para o empilhamento e os ajustes de leitura em telas estreitas, nunca como única fonte de um estilo crítico.

Cada bloco será independente e poderá falhar graciosamente:

1. Pré-cabeçalho oculto, com resumo da edição para a caixa de entrada.
2. Cabeçalho com a marca Otimiza e identificação da edição.
3. Hero editorial com a imagem, título, introdução e CTA da nova avenida.
4. Área “Artigos selecionados” com quatro cards verticais, cada qual contendo imagem, categoria, título, resumo e link.
5. Rodapé institucional com dados de contato e os links exigidos pela plataforma de disparo, caso já presentes no HTML-base.

## Custom Head HTML

O bloco para o campo Custom Head HTML terá somente elementos próprios para o interior de `<head>`: metadados de viewport e de reformatagem Apple, instruções condicionais para Outlook e CSS seguro.

- `meta viewport`, `x-apple-disable-message-reformatting` e `format-detection` reduzem zoom, mudanças de tamanho e autolinks indesejados em aplicativos móveis.
- `mso` condicional define pixels por polegada e mantém a renderização previsível no Outlook para Windows.
- Reset de `body`, `table`, `td`, `img` e links previne margens, espaçamentos e bordas inesperadas.
- As media queries usam apenas classes de apoio já existentes no markup: largura fluida, colunas empilhadas, padding móvel e tipografia mais compacta.
- O corpo usará uma pilha de fontes de sistema. Fontes Adobe podem continuar como melhoria visual, mas não serão requisito para leitura.

## Dados e links

Durante esta primeira entrega, o CTA do novo artigo permanecerá claramente marcado como provisório. A criação do post e a inclusão dos links finais serão a próxima etapa, solicitada separadamente. Para os quatro artigos selecionados, os links serão formados com a rota pública já usada pelo Inspire, usando data e slug de cada publicação.

## Critérios de aceitação

- O HTML não contém dependências de layout em `div`, flexbox, JavaScript ou CSS externo.
- Em desktop, o conteúdo permanece em uma coluna editorial de 600 px.
- Em telas de até 600 px, imagens ocupam a largura disponível e blocos em colunas se empilham.
- O conteúdo legível não depende do carregamento da fonte Adobe.
- Todas as imagens incluem `alt` útil, largura explícita e CSS responsivo.
- Os quatro artigos selecionados correspondem à curadoria acima e não incluem Dicas.
- Todos os links finais podem ser substituídos sem alterar a estrutura do e-mail.

## Verificação

- Validar a presença dos metadados e CSS no Custom Head HTML.
- Fazer uma checagem estrutural do HTML para confirmar tabelas de apresentação, links, `alt` em imagens e ausência de JavaScript.
- Visualizar em viewport desktop e mobile antes da entrega.
