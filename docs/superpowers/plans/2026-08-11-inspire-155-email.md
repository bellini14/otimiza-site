# Inspire 155 Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produzir uma versão compatível e responsiva do e-mail Inspire 155, acompanhada de um fragmento seguro para Custom Head HTML.

**Architecture:** Criar dois artefatos independentes em `email-templates/`: o documento HTML completo que será importado/disparado e o fragmento exclusivo que será colado no campo Custom Head HTML. Um teste Vitest de arquivo validará os metadados, a estrutura de e-mail baseada em tabelas, o conteúdo editorial, os links dos quatro artigos e a ausência de dependências frágeis de layout.

**Tech Stack:** HTML para e-mail, CSS inline e media queries, comentários condicionais MSO, Node.js `fs`, Vitest.

---

## Estrutura de arquivos

- Criar: `email-templates/inspire-155.html` — documento HTML completo da edição, pronto para colar/importar na plataforma.
- Criar: `email-templates/inspire-155-custom-head.html` — apenas o fragmento permitido dentro de `<head>` para o campo Custom Head HTML.
- Criar: `email-templates/inspire-155.test.js` — contrato automatizado do conteúdo e dos requisitos de compatibilidade.
- Referência somente leitura: `C:\Users\Joao\.codex\attachments\8d2409e8-33c9-4023-ae6a-f295d07a57f0\pasted-text.txt` — HTML-base da edição 153.
- Referência de conteúdo: `docs/superpowers/specs/2026-08-11-inspire-155-email-design.md` — conteúdo aprovado, artigos selecionados e URLs.

### Task 1: Definir o contrato verificável do e-mail

**Files:**
- Create: `email-templates/inspire-155.test.js`
- Verify: `docs/superpowers/specs/2026-08-11-inspire-155-email-design.md`

- [ ] **Step 1: Criar o teste que descreve os dois artefatos ainda inexistentes**

```js
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const templatePath = resolve('email-templates/inspire-155.html')
const headPath = resolve('email-templates/inspire-155-custom-head.html')

function read(path) {
  return readFileSync(path, 'utf8')
}

describe('Inspire 155 email template', () => {
  it('contains the approved edition, hero and provisional publication tokens', () => {
    const template = read(templatePath)

    expect(template).toContain('<title>Inspire 155 — Editorial agosto de 2026</title>')
    expect(template).toContain('2ª Avenida — Extensão das Adjacências')
    expect(template).toContain('Extensão das Adjacências: A segunda avenida')
    expect(template).toContain('{{LINK_ARTIGO_PRINCIPAL}}')
    expect(template).toContain('{{IMAGEM_ARTIGO_PRINCIPAL_URL}}')
    expect(template).toContain('Negócios bem-sucedidos são construídos')
  })

  it('uses an email-safe table structure and accessible images', () => {
    const template = read(templatePath)

    expect(template).toContain('role="presentation"')
    expect(template).toMatch(/<table[^>]+width="100%"/)
    expect(template).toContain('width="600"')
    expect(template).not.toMatch(/<script\b/i)
    expect([...template.matchAll(/<img\b[^>]*>/gi)].every((match) => /\balt="[^"]+"/.test(match[0]))).toBe(true)
  })

  it('includes exactly the four selected non-tip articles with their public links', () => {
    const template = read(templatePath)
    const expected = [
      ['Eureka, Heurística e o Planejamento Estratégico', 'https://www.otm.com.br/2026/07/28/eureka-heuristica-e-o-planejamento-estrategico/'],
      ['Difícil de copiar', 'https://www.otm.com.br/2026/07/21/dificil-de-copiar/'],
      ['Há uma diferença colossal entre a teoria e a prática.', 'https://www.otm.com.br/2026/07/13/ha-uma-diferenca-colossal-entre-a-teoria-e-a-pratica/'],
      ['Maximização do core: a primeira avenida', 'https://www.otm.com.br/2026/07/03/gestao-do-core-a-primeira-avenida/'],
    ]

    expected.forEach(([title, href]) => {
      expect(template).toContain(title)
      expect(template).toContain(href)
    })
    expect(template).not.toMatch(/Dica (de leitura|para assistir)/i)
  })

  it('ships a Custom Head fragment with mobile, Apple Mail and Outlook safeguards', () => {
    const head = read(headPath)

    expect(head).toContain('name="viewport"')
    expect(head).toContain('x-apple-disable-message-reformatting')
    expect(head).toContain('<!--[if mso]>')
    expect(head).toContain('@media only screen and (max-width: 600px)')
    expect(head).not.toMatch(/<\/?head\b/i)
    expect(head).not.toMatch(/<script\b/i)
  })
})
```

- [ ] **Step 2: Rodar o teste para confirmar que falha antes dos arquivos existirem**

Run: `npm test -- email-templates/inspire-155.test.js`

Expected: FAIL com `ENOENT` para `email-templates/inspire-155.html` e `email-templates/inspire-155-custom-head.html`.

- [ ] **Step 3: Registrar o teste**

```bash
git add email-templates/inspire-155.test.js
git commit -m "test: define Inspire 155 email contract"
```

### Task 2: Criar o Custom Head HTML seguro

**Files:**
- Create: `email-templates/inspire-155-custom-head.html`
- Test: `email-templates/inspire-155.test.js`

- [ ] **Step 1: Adicionar somente elementos permitidos dentro do head**

O fragmento deve incluir, nesta ordem:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
<!--[if mso]>
<xml>
  <o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
```

Depois dos metadados, incluir um `<style>` com reset seguro para `body`, `table`, `td`, `img` e links; um fallback de fonte de sistema; e uma única media query `@media only screen and (max-width: 600px)` para `.email-container`, `.mobile-padding-x`, `.mobile-stack`, `.mobile-title` e `.mobile-button`.

- [ ] **Step 2: Copiar o mesmo fragmento para o `<head>` do documento final**

Não envolver o arquivo do Custom Head com `<html>` ou `<head>`. No documento completo, o conteúdo é inserido dentro do único `<head>` existente, para que os dois artefatos não divirjam.

- [ ] **Step 3: Rodar o teste para confirmar a cobertura do head**

Run: `npm test -- email-templates/inspire-155.test.js`

Expected: ainda FAIL somente nas expectativas do documento principal ausente.

- [ ] **Step 4: Registrar o fragmento de compatibilidade**

```bash
git add email-templates/inspire-155-custom-head.html
git commit -m "feat: add Inspire 155 email head safeguards"
```

### Task 3: Construir o documento completo da edição 155

**Files:**
- Create: `email-templates/inspire-155.html`
- Reference: `C:\Users\Joao\.codex\attachments\8d2409e8-33c9-4023-ae6a-f295d07a57f0\pasted-text.txt`
- Reference: `docs/superpowers/specs/2026-08-11-inspire-155-email-design.md`
- Test: `email-templates/inspire-155.test.js`

- [ ] **Step 1: Criar o esqueleto de e-mail resiliente**

Partir da identidade visual do HTML-base, mas substituir o layout frágil por:

```html
<body style="margin:0; padding:0; background-color:#ffffff;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
    Inspire 155: a segunda avenida do crescimento.
  </div>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" class="email-container" width="600" border="0" cellspacing="0" cellpadding="0" style="width:600px; max-width:600px;">
          <!-- cabeçalho, hero, artigos e rodapé -->
        </table>
      </td>
    </tr>
  </table>
</body>
```

Manter `role="presentation"`, `border="0"`, `cellspacing="0"` e `cellpadding="0"` em todas as tabelas de layout. Aplicar cor, margem, tipografia, alinhamento e espaçamento inline em cada célula relevante. Não usar JavaScript, `<video>`, CSS Grid, Flexbox ou imagens relativas.

- [ ] **Step 2: Montar cabeçalho e hero aprovados**

Recriar os logos e links institucionais do HTML-base usando URLs HTTPS diretas. Exibir `Inspire 155` e `Editorial agosto de 2026`; adicionar o título de seção, o título do artigo, todos os sete parágrafos aprovados e o botão `Ler o segundo capítulo`.

O link do botão e da imagem devem ser exatamente `{{LINK_ARTIGO_PRINCIPAL}}` e `{{IMAGEM_ARTIGO_PRINCIPAL_URL}}`, respectivamente. A imagem deve declarar o texto alternativo definido na especificação, `width="600"`, `style="display:block; width:100%; max-width:600px; height:auto;"` e dimensões/estilos que não dependam de `border-radius` para sua legibilidade.

- [ ] **Step 3: Substituir a seleção por quatro cards não-Dicas**

Depois de um título `Artigos selecionados`, construir quatro blocos de cartão em tabela. Para cada artigo da tabela da especificação, incluir imagem HTTPS com `alt` igual ao título, `width="600"` e `style="display:block; width:100%; max-width:600px; height:auto;"`, categoria, título, resumo e o CTA `Ler artigo`. Cada imagem, título e CTA deve usar a mesma URL pública do card.

Cada card será vertical, em uma coluna, para evitar layouts lado a lado que quebram no Outlook ou em telas pequenas. Separar os cards por espaçamento em células (`<td height="…">`) ou padding inline, não por margens externas.

- [ ] **Step 4: Preservar o rodapé e os requisitos de entrega**

Preservar informações de marca, canais sociais e contato existentes no HTML-base. Atualizar links Markdown malformados do arquivo-base para URLs HTML reais; todos os `href` devem ser HTTPS válidos, exceto a variável `{{LINK_ARTIGO_PRINCIPAL}}`. Não introduzir links de descadastro: esse item é gerado pela plataforma de e-mail.

- [ ] **Step 5: Rodar o contrato completo**

Run: `npm test -- email-templates/inspire-155.test.js`

Expected: PASS com quatro testes aprovados.

- [ ] **Step 6: Registrar o documento final**

```bash
git add email-templates/inspire-155.html
git commit -m "feat: add Inspire 155 editorial email"
```

### Task 4: Verificar o artefato para entrega

**Files:**
- Verify: `email-templates/inspire-155.html`
- Verify: `email-templates/inspire-155-custom-head.html`
- Test: `email-templates/inspire-155.test.js`

- [ ] **Step 1: Executar a suíte focalizada**

Run: `npm test -- email-templates/inspire-155.test.js`

Expected: PASS com quatro testes aprovados.

- [ ] **Step 2: Executar a checagem de formatação do repositório**

Run: `git diff --check HEAD~3..HEAD`

Expected: nenhum erro de whitespace no contrato, Custom Head e template.

- [ ] **Step 3: Fazer revisão manual de envio**

Confirmar no arquivo final:

- há somente um `<html>`, `<head>` e `<body>`;
- todas as imagens têm `alt`, `width` e URLs absolutas (exceto a variável de imagem do hero);
- o hero mostra os sete parágrafos na ordem aprovada;
- há exatamente quatro cards selecionados e nenhum conteúdo “Dica de leitura” ou “Dica para assistir”; e
- a substituição futura de `{{LINK_ARTIGO_PRINCIPAL}}` e `{{IMAGEM_ARTIGO_PRINCIPAL_URL}}` é o único passo pendente para o post novo.

- [ ] **Step 4: Entregar ambos os arquivos com instruções de uso**

No handoff, apontar os dois arquivos e informar que o conteúdo de `inspire-155-custom-head.html` deve ser colado integralmente no campo **Custom Head HTML**. Informar também que as duas variáveis do hero serão substituídas ao criar/publicar o post na próxima etapa.
