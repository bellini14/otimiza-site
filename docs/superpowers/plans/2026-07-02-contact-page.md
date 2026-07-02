# Contact Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Otimiza contact page with an accessible responsive form, interactive map, and a server-side SMTP2GO integration that becomes active when credentials are configured.

**Architecture:** `Contato.jsx` owns the page UI and browser-side submission state. `api/contact.js` validates the request and delegates provider communication to `api/_lib/smtp2go.js`, keeping credentials server-only and provider details independently testable.

**Tech Stack:** React 19, React Router, Tailwind/CSS, Lucide React, Vercel Functions, SMTP2GO HTTP API, Vitest, Testing Library.

---

## File structure

- Modify `src/pages/Contato.jsx`: render the complete page and manage form state.
- Create `src/pages/Contato.test.jsx`: verify content, accessibility and submission states.
- Modify `src/index.css`: contact-specific responsive layout, motion and form styles.
- Create `api/contact.js`: validate contact requests and return stable HTTP responses.
- Create `api/contact.test.js`: test HTTP behavior, validation, honeypot and configuration failures.
- Create `api/_lib/smtp2go.js`: isolate environment configuration and the SMTP2GO request.
- Create `api/_lib/smtp2go.test.js`: verify provider payload and error handling.
- Create `.env.example`: document required variables without secrets.
- Modify `README.md`: document local and Vercel setup.

### Task 1: Contact form API

**Files:**
- Create: `api/_lib/smtp2go.js`
- Create: `api/_lib/smtp2go.test.js`
- Create: `api/contact.js`
- Create: `api/contact.test.js`

- [ ] **Step 1: Write failing provider tests**

Test that `sendContactEmail` reads `SMTP2GO_API_KEY`, `CONTACT_FROM_EMAIL`, and `CONTACT_TO_EMAIL`; posts to SMTP2GO with the visitor email as `custom_headers: [{ header: "Reply-To", value: email }]`; and throws a typed configuration error when variables are absent.

- [ ] **Step 2: Run the provider tests and verify failure**

Run: `npm test -- api/_lib/smtp2go.test.js`

Expected: FAIL because `smtp2go.js` does not exist.

- [ ] **Step 3: Implement the provider adapter**

Create a focused adapter that:

```js
export async function sendContactEmail(contact, { fetchImpl = fetch, env = process.env } = {}) {
  // validate env, build text/html payload, POST https://api.smtp2go.com/v3/email/send
}
```

Never return or log the API key. Treat non-2xx responses and SMTP2GO rejection payloads as provider errors.

- [ ] **Step 4: Run provider tests**

Run: `npm test -- api/_lib/smtp2go.test.js`

Expected: PASS.

- [ ] **Step 5: Write failing route tests**

Cover:

- `405` for non-POST methods and `Allow: POST`;
- `400` for malformed body, missing fields, invalid email or oversized values;
- `200` without provider call when the honeypot is filled;
- `503` for missing provider configuration;
- `502` for provider failure;
- `200` after a successful send.

- [ ] **Step 6: Run route tests and verify failure**

Run: `npm test -- api/contact.test.js`

Expected: FAIL because `api/contact.js` does not exist.

- [ ] **Step 7: Implement the route**

Normalize string inputs, enforce conservative limits, invoke `sendContactEmail`, and return stable Portuguese messages. Do not echo submitted content.

- [ ] **Step 8: Run API tests**

Run: `npm test -- api/contact.test.js api/_lib/smtp2go.test.js`

Expected: PASS.

### Task 2: Contact page UI

**Files:**
- Modify: `src/pages/Contato.jsx`
- Create: `src/pages/Contato.test.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Write failing page tests**

Render `Contato` and assert:

- title, address, email, phone and social links;
- accessible required fields for Nome, Sobrenome, E-mail and Comentário ou mensagem;
- titled map iframe and external map link;
- POST payload to `/api/contact`;
- disabled loading state;
- success reset and announcement;
- preserved values and error announcement after failure.

- [ ] **Step 2: Run page tests and verify failure**

Run: `npm test -- src/pages/Contato.test.jsx`

Expected: FAIL because the current page only renders `InfoPage`.

- [ ] **Step 3: Implement semantic page markup**

Replace `InfoPage` with the approved editorial layout. Use Lucide icons, existing social URLs, labeled fields, a visually hidden honeypot, `aria-live`, OpenStreetMap embed, lazy loading and an external directions link.

- [ ] **Step 4: Implement submission behavior**

Use controlled status state, native form values through `FormData`, client-side required validation, JSON POST, disabled loading state, success reset and safe error fallback.

- [ ] **Step 5: Add contact styles**

Add isolated `.contact-page` rules for full-bleed sections, Elza typography, approved colors, responsive stacking, focus-visible states, subtle reveal motion and `prefers-reduced-motion`.

- [ ] **Step 6: Run page tests**

Run: `npm test -- src/pages/Contato.test.jsx`

Expected: PASS.

### Task 3: Configuration and verification

**Files:**
- Create: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: Document configuration**

Add placeholders:

```dotenv
SMTP2GO_API_KEY=
CONTACT_FROM_EMAIL=
CONTACT_TO_EMAIL=
```

Document SMTP2GO verified sender setup, Vercel environment variables, redeployment, and `vercel dev` for local API testing.

- [ ] **Step 2: Run focused verification**

Run: `npm test -- src/pages/Contato.test.jsx api/contact.test.js api/_lib/smtp2go.test.js`

Expected: PASS.

- [ ] **Step 3: Run project verification**

Run:

```powershell
npm test
npm run lint
npm run build
```

Expected: all tests pass, ESLint exits `0`, and Vite produces `dist`.

- [ ] **Step 4: Review the diff**

Run: `git diff --check` and `git diff --stat`.

Expected: no whitespace errors and only contact-related files plus documentation changed by this work.
