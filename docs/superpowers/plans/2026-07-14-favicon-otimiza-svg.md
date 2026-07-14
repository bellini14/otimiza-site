# Favicon Otimiza em SVG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar `imagens/favicon otimiza.svg` como o favicon SVG do site.

**Architecture:** O asset de origem será copiado sem transformação para `public/favicon.svg`, que o Vite publica na raiz. `index.html` apontará para essa URL com o MIME type de SVG. Um teste de contrato protege tanto a referência HTML quanto a igualdade byte a byte entre origem e asset público.

**Tech Stack:** Vite 8, Vitest 4, Node.js `fs`.

---

## Estrutura de arquivos

- Criar `favicon.test.js`: contrato automatizado do favicon público.
- Modificar `public/favicon.svg`: cópia exata do SVG fornecido pelo usuário.
- Modificar `index.html`: referência pública do favicon.

### Task 1: Contrato e publicação do favicon

**Files:**
- Create: `favicon.test.js`
- Modify: `public/favicon.svg`
- Modify: `index.html:5`
- Source asset: `imagens/favicon otimiza.svg`

- [ ] **Step 1: Registrar o baseline dos arquivos já modificados**

Run: `git diff -- index.html public/favicon.svg`

Expected: guardar a saída na sessão antes de editar. Ela é o baseline para distinguir as mudanças preexistentes do delta desta tarefa; não restaurar nem reformatar nenhum dos arquivos.

- [ ] **Step 2: Escrever o teste que falha**

```js
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('site favicon', () => {
  it('publishes the supplied Otimiza SVG and references it from the document head', () => {
    const root = process.cwd()
    const html = readFileSync(resolve(root, 'index.html'), 'utf8')
    const sourceFavicon = readFileSync(resolve(root, 'imagens/favicon otimiza.svg'))
    const publicFavicon = readFileSync(resolve(root, 'public/favicon.svg'))

    expect(html).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />')
    expect(publicFavicon.equals(sourceFavicon)).toBe(true)
  })
})
```

- [ ] **Step 3: Executar o teste e confirmar a falha**

Run: `npm test -- favicon.test.js`

Expected: FAIL porque `index.html` ainda referencia `/favicon.png` e `public/favicon.svg` não corresponde ao arquivo fornecido.

- [ ] **Step 4: Aplicar a implementação mínima**

Substituir integralmente `public/favicon.svg` pelo conteúdo byte a byte de `imagens/favicon otimiza.svg`. Em `index.html`, substituir somente:

```html
<link rel="icon" type="image/png" href="/favicon.png" />
```

por:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

- [ ] **Step 5: Executar o teste focalizado**

Run: `npm test -- favicon.test.js`

Expected: PASS com 1 arquivo e 1 teste aprovados.

- [ ] **Step 6: Validar o build e os artefatos**

Run: `npm run build`

Expected: exit code 0 e `dist/favicon.svg` criado.

Run: `Get-FileHash -Algorithm SHA256 'imagens/favicon otimiza.svg','public/favicon.svg','dist/favicon.svg'`

Expected: os três hashes são idênticos.

Run: `Select-String -Path 'dist/index.html' -SimpleMatch '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />'`

Expected: uma correspondência.

- [ ] **Step 7: Inspecionar o delta em relação ao baseline**

Run: `git diff -- index.html public/favicon.svg favicon.test.js`

Expected: comparado ao baseline registrado no Step 1, o único delta novo em `index.html` é a linha do favicon; `public/favicon.svg` passa a ser a cópia exata do asset fornecido; `favicon.test.js` contém somente o teste de contrato. Não executar `git add` nem criar commit, pois os arquivos-alvo já contêm trabalho local preexistente.
