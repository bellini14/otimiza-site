# Página de contato — design

## Objetivo

Substituir a página genérica de contato por uma experiência completa, alinhada à identidade atual da Otimiza. A página deve reunir informações de contato, formulário funcional e mapa interativo do endereço Frei Pacífico 260, São José, 95032-380, Caxias do Sul - RS.

## Direção visual

A composição revisada é limpa e concentrada em duas áreas:

1. hero com o título “Contato” e uma chamada à esquerda;
2. mapa interativo ocupando o lado direito do hero;
3. degradê horizontal entre o fundo claro do texto e o mapa;
4. formulário amplo em uma única superfície branca abaixo;
5. cabeçalho, transições e rodapé globais preservados.

O texto auxiliar “Fale com a Otimiza” é removido. O mapa deixa de existir como seção independente abaixo do formulário.

O hero e o formulário usam a mesma largura máxima e as mesmas margens laterais externas da caixa branca do menu. A página utiliza Elza, cinza `#5a6572`, superfícies claras e detalhes vermelhos pontuais. A entrada dos blocos deve ser discreta e respeitar `prefers-reduced-motion`.

Em telas pequenas, o título aparece antes do mapa e o formulário ocupa toda a largura disponível, sem rolagem horizontal.

## Conteúdo

O painel vermelho e as informações de endereço, e-mail, telefone e redes sociais são removidos desta versão. Essas informações serão reposicionadas em uma etapa futura.

O formulário contém:

- nome;
- sobrenome;
- e-mail;
- comentário ou mensagem;
- campo invisível de honeypot;
- botão “Enviar”.

Todos os campos visíveis são obrigatórios. Os rótulos permanecem visíveis e os estados de foco têm contraste adequado.

## Mapa

O mapa usa Leaflet com tiles do OpenStreetMap para permanecer interativo sem exigir chave de API. Ele ocupa o lado direito do hero e continua utilizável nessa área. Um degradê sobreposto, sem capturar eventos de ponteiro, faz a transição do fundo claro para o mapa.

Os controles nativos verticais são desabilitados. A página oferece controles próprios de zoom, organizados horizontalmente na parte inferior direita do mapa, na ordem “diminuir” e “aumentar”. Os botões possuem nomes acessíveis e acionam o zoom real do mapa.

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
