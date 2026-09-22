# Site Otimiza

Aplicação React/Vite com funções serverless da Vercel.

## Formulário de contato

O formulário em `/contato` usa `POST /api/contact` e entrega a mensagem pelo SMTP autenticado do SMTP2GO. As credenciais permanecem somente no servidor.

### Configuração do SMTP2GO

1. No painel do SMTP2GO, acesse `Sending > Verified Senders > Sender Domains`, adicione o domínio usado no remetente e configure os registros CNAME informados.
2. Em `Settings > SMTP Users`, crie ou obtenha as credenciais SMTP autorizadas para envio.
3. Copie `.env.example` para `.env.local` no desenvolvimento e preencha:

```dotenv
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=2525
SMTP_USER=seu-usuario-smtp
SMTP_PASS=sua-senha-smtp
CONTACT_FROM_EMAIL=site@seudominio.com.br
CONTACT_TO_EMAIL=contato@seudominio.com.br
NEWSLETTER_TO_EMAIL=marketing@seudominio.com.br
VITE_SITE_URL=https://www.seudominio.com.br
```

`CONTACT_FROM_EMAIL` precisa pertencer a um remetente autorizado no SMTP2GO. O e-mail preenchido pelo visitante é utilizado como `Reply-To`.

### Aviso de nova assinatura Inspire

As inscrições diretas feitas em `/inspire/newsletter` e no formulário lateral continuam sendo registradas no RD Station e, depois, geram um aviso interno pelo SMTP2GO. Defina `NEWSLETTER_TO_EMAIL` com o endereço que deve receber esse aviso; se não for configurado, o site usa `CONTACT_TO_EMAIL`. A mensagem apresenta o logo Inspire, “Novo Assinante!” e uma tabela com nome e e-mail; o e-mail do assinante é usado como `Reply-To`.

`VITE_SITE_URL` deve ser a URL HTTPS pública de produção do site, pois é usada para carregar o logo no cliente de e-mail. Não use um domínio local ou URL de preview da Vercel.

Na Vercel, adicione as variáveis em `Project Settings > Environment Variables` para Production e Preview. Faça um novo deploy depois de salvar. `VITE_SITE_URL` é a única variável pública nesta lista; nunca registre `SMTP_PASS` no Git.

Para testar a função localmente com as variáveis da Vercel:

```powershell
npx vercel dev
```

Sem as variáveis, a página continua disponível e o endpoint retorna uma mensagem segura informando que o serviço de e-mail ainda não foi configurado.

## Desenvolvimento

```powershell
npm install
npm run dev
npm test
npm run lint
npm run build
```

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Compressão na hospedagem

A Vercel Edge CDN aplica compressão automaticamente conforme o cabeçalho
`Accept-Encoding` enviado pelo cliente. Não gere arquivos `.br` ou `.gz` no build:
eles não devem ser servidos diretamente e imagens, fontes e outros formatos já
compactados não devem passar por uma segunda compressão.

Após publicar, verifique HTML e um arquivo textual do bundle com:

```bash
npm run verify:compression -- https://SEU-DOMINIO-PUBLICO
```

O comando termina com erro se HTML, CSS ou JavaScript forem entregues sem
`Content-Encoding: br` ou `Content-Encoding: gzip`.

## Proteção dos formulários com Turnstile

Antes de publicar esta versão, crie um widget **Managed** em Cloudflare > Turnstile e autorize `otm.com.br` e `www.otm.com.br`. Não é necessário mover o DNS para Cloudflare.

Na Vercel, configure em **Production**:
- `VITE_TURNSTILE_SITE_KEY`: Site Key pública, incorporada pelo Vite no build.
- `TURNSTILE_SECRET_KEY`: Secret Key sensível, exclusivamente no servidor.
- `TURNSTILE_ALLOWED_HOSTNAMES`: `otm.com.br,www.otm.com.br` (padrão do código).
- `POSTGRES_URL` ou `DATABASE_URL`: conexão PostgreSQL já utilizada pelo site, com permissão para criar as tabelas `form_abuse_limits` e `form_abuse_submissions` e seus índices. Nenhuma tabela do memorial é alterada.

Os limites compartilhados são 10 tentativas com token por IP a cada 10 minutos e 3 envios verificados por e-mail por hora, somando contato e newsletter. IPv6 usa prefixo /64. Repetições de contato idêntico são suprimidas por 10 minutos e inscrições do mesmo e-mail por 24 horas, inclusive entre origens diferentes. IPs, e-mails e conteúdo são representados nessas tabelas por HMAC; não são armazenados em texto. Registros expirados são eliminados em lotes durante o uso; sem tráfego, podem permanecer até a próxima limpeza. A rotação da Secret Key reinicia efetivamente essas identificações.

A confirmação do Turnstile ocorre antes de SMTP/RD Station e exige hostname e action exatos (`contact` ou `newsletter`). Token inválido gera 400; quota excedida, 429 com Retry-After; duplicidade em processamento, 409; indisponibilidade da verificação ou banco, 503. Sem chaves, os formulários ficam indisponíveis; não há bypass automático. Turnstile não comprova posse do e-mail e não substitui double opt-in.

A notificação interna da newsletter é best-effort após sucesso no RD Station: falha de SMTP é registrada e não faz o visitante repetir uma inscrição já concluída. Timeouts ambíguos dos provedores não oferecem garantia de entrega exatamente uma vez. Reservas pendentes expiram em 2 minutos. RD Station tem prazo de 15 segundos e SMTP, de 20 segundos, com encerramento da conexão.

Para testar, use as [chaves oficiais de teste](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) apenas em ambiente local/preview isolado, com banco descartável e SMTP/RD simulados. As chaves de teste de aprovação usam hostname `dummy-key-pass` e action `test`; a validação estrita desta aplicação deve ser testada com mocks para os casos positivos ou com widget real específico de preview, sem desabilitar a comparação de action em produção. Não vincule preview de teste ao banco nem às integrações de produção.

Validar antes da ativação: widget nos cinco formulários, renovação após expiração/erro, envio legítimo controlado, rejeição sem token, limites e ausência de efeitos externos em rejeições. Alterações nas variáveis públicas requerem novo build. Não envie Secret Key pelo chat nem faça commit de arquivos de segredos.
