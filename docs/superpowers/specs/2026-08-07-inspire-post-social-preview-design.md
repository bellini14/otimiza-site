# Prévia social dos posts do Inspire

## Objetivo

Permitir que cada permalink WordPress de um post do Inspire gere uma prévia rica em canais como WhatsApp e LinkedIn. A prévia deve usar a imagem destacada do post, exibir o título do post e apresentar a descrição fixa `Confira a publicação do Inspire.`, sem repetir o título na descrição.

## Contexto e restrições

- Os permalinks existentes seguem o formato `/:ano/:mes/:dia/:slug` e devem permanecer inalterados.
- As alterações dos commits `5007358`, `06fc06c`, `885de43`, `ddde27f`, `e6c7b97`, `70be3a7`, `407a114` e `6167f49` não podem ser revertidas, sobrescritas ou ter seus comportamentos alterados.
- O repositório contém alterações locais não commitadas; a implementação deve ser isolada aos arquivos necessários para esta funcionalidade.
- Canais de compartilhamento não executam o JavaScript do React. Os metadados precisam estar no HTML enviado pelo servidor.
- O diff final não pode alterar arquivos ou linhas responsáveis por permalink, memorial, SMTP e RD Station, salvo a alteração estritamente necessária a esta prévia e acompanhada de teste de regressão.

## Solução escolhida

No build, o gerador de SEO consultará os posts publicados no Sanity e produzirá um documento HTML por permalink em `dist/:ano/:mes/:dia/:slug/index.html`. Cada documento será derivado do HTML principal do build e receberá:

- `title` e `og:title`: título do post seguido da marca Otimiza;
- `meta[name="description"]` e `og:description`: `Confira a publicação do Inspire.`;
- `og:type`: `article`;
- `og:url` e canonical: URL absoluta do permalink WordPress;
- `og:image` e `twitter:image`: URL da imagem destacada do post;
- Twitter Card `summary_large_image`.

A regra de rewrite da Vercel deverá encaminhar apenas `/:ano/:mes/:dia/:slug`, com ano, mês e dia restritos a segmentos numéricos, para `/:ano/:mes/:dia/:slug/index.html`. Essa regra ficará depois das rotas estáticas e fora do escopo de `/api`, mas antes do fallback que entrega a SPA. Depois de entregue e hidratado, o mesmo caminho continuará chegando ao `PostDetail`, preservando a experiência atual.

As URLs absolutas serão construídas exclusivamente a partir de `VITE_SITE_URL`, que deve apontar para a URL pública HTTPS de produção. O build deve falhar caso ela esteja ausente, inválida ou não use HTTPS; variáveis de preview e `localhost` não podem ser usadas. A imagem de fallback será `src/assets/hero-bw.jpg`; o nome com hash em `dist/assets/` será resolvido pelo manifesto do Vite (ou mecanismo equivalente e determinístico) e o build falhará se o arquivo não existir. Sua URL absoluta será formada com essa mesma origem.

Todo valor interpolado no HTML — título, descrição, URL e atributos — será escapado antes da serialização.

## Casos de erro

- Posts sem data ou slug não geram rota estática, pois não possuem permalink WordPress válido.
- Posts sem imagem destacada recebem a imagem de hero em `dist/assets/`, com URL HTTPS absoluta, evitando metadados de imagem vazios.
- Falha ao carregar posts do Sanity interrompe o build com erro explícito, em vez de publicar prévias incompletas.

## Testes e verificação

1. Teste de geração do HTML de um post: título, descrição fixa, imagem e URL canônica.
2. Teste de fallback de imagem quando não houver imagem destacada.
3. Teste de que permalinks inválidos não geram arquivo.
4. Teste da prioridade do rewrite da rota datada antes do fallback da SPA.
5. Teste de que uma rota não datada e uma rota de API não são capturadas pelo rewrite.
6. Teste de que a rota datada entrega o HTML estático e de que o navegador segue hidratando o `PostDetail`.
7. Teste de escape seguro de caracteres especiais em título, slug e URL.
8. Execução dos testes focados, suíte completa e build com `VITE_SITE_URL` HTTPS válido.
9. Inspeção do diff e execução dos testes relevantes aos comportamentos preservados, em especial permalink, memorial, SMTP e RD Station.
