# Página de contato — design

## Objetivo

Substituir a página genérica de contato por uma experiência completa, alinhada à identidade atual da Otimiza. A página deve reunir informações de contato, formulário funcional e mapa interativo do endereço Frei Pacífico 260, São José, 95032-380, Caxias do Sul - RS.

## Direção visual

A composição aprovada é editorial em camadas:

1. abertura com o título “Contato” e uma chamada curta;
2. painel vermelho com informações institucionais ao lado do formulário branco;
3. mapa interativo em largura total abaixo do conjunto;
4. cabeçalho, transições e rodapé globais preservados.

A página utiliza Elza, vermelho `#e02020`, cinza `#5a6572`, superfícies claras e espaçamentos compatíveis com as páginas atuais. A entrada dos blocos deve ser discreta e respeitar `prefers-reduced-motion`.

Em telas pequenas, a ordem é título, informações de contato, formulário e mapa. Campos e ações devem ocupar a largura disponível sem rolagem horizontal.

## Conteúdo

O painel de contato contém:

- Frei Pacífico 260, São José, 95032-380, Caxias do Sul - RS;
- `otm@otm.com.br`;
- `+55 54 3211.6045`;
- Instagram, X e LinkedIn já utilizados pelo rodapé.

O formulário contém:

- nome;
- sobrenome;
- e-mail;
- comentário ou mensagem;
- campo invisível de honeypot;
- botão “Enviar”.

Todos os campos visíveis são obrigatórios. Os rótulos permanecem visíveis e os estados de foco têm contraste adequado.

## Mapa

O mapa usa incorporação do OpenStreetMap para permanecer interativo sem exigir chave de API. Deve apresentar título acessível, carregamento tardio e link externo para abrir a localização em uma aplicação de mapas.

## Envio de mensagens

O navegador envia `POST /api/contact` com JSON. A função:

1. aceita apenas `POST`;
2. limita o tamanho da requisição;
3. valida e normaliza nome, sobrenome, e-mail e mensagem;
4. descarta silenciosamente submissões que preencham o honeypot;
5. chama a API HTTP do SMTP2GO;
6. usa o e-mail do visitante apenas em `Reply-To`;
7. retorna respostas JSON previsíveis sem revelar credenciais ou detalhes internos.

O remetente e o destinatário são controlados por:

- `SMTP2GO_API_KEY`;
- `CONTACT_FROM_EMAIL`;
- `CONTACT_TO_EMAIL`.

Enquanto essas variáveis não estiverem configuradas, o endpoint responde com indisponibilidade de serviço e uma mensagem segura. Nenhuma credencial é incluída no bundle do navegador.

## Estados e erros

Durante o envio, o botão fica desabilitado e informa progresso. Em sucesso, os campos são limpos e uma confirmação é anunciada por uma região `aria-live`. Erros de validação são associados aos campos. Falhas de rede, configuração ou provedor apresentam uma mensagem amigável e preservam o conteúdo digitado.

## Testes

Os testes devem cobrir:

- renderização das informações e do mapa;
- campos obrigatórios e acessíveis;
- envio correto do formulário;
- estado de carregamento, sucesso e erro;
- validação e métodos aceitos pelo endpoint;
- configuração ausente;
- payload enviado ao SMTP2GO sem exposição da chave;
- honeypot.

Também devem ser executados os testes relacionados, lint e build de produção.
