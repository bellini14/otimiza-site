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
```

`CONTACT_FROM_EMAIL` precisa pertencer a um remetente autorizado no SMTP2GO. O e-mail preenchido pelo visitante é utilizado como `Reply-To`.

Na Vercel, adicione as mesmas seis variáveis em `Project Settings > Environment Variables` para Production e Preview. Faça um novo deploy depois de salvar. Não use o prefixo `VITE_` e nunca registre `SMTP_PASS` no Git.

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

## Publicação segura

O deploy de produção deve ser executado somente pelo comando protegido:

```powershell
npm run deploy:prod
```

Antes da primeira publicação, instale a CLI da Vercel para que o executável
`vercel` esteja disponível no `PATH` e execute `vercel link` uma vez para criar
`.vercel/project.json`. Faça commit e push da branch pretendida antes de iniciar
o comando.

O fluxo confirma que o commit local corresponde ao upstream, cria um worktree
temporário nesse hash, instala as dependências da aplicação e do Studio, executa
testes e build e só então chama a Vercel. Alterações locais pendentes permanecem
intactas e nunca são incluídas na publicação.

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
