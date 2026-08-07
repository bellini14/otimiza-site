# RD Station Lead Capture and Privacy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate every non-memorial commercial form with RD Station under explicit LGPD consent and publish a linked privacy policy.

**Architecture:** A server-only RD adapter submits minimal conversion payloads with a protected API key. Newsletter submissions require RD success; contact submissions keep SMTP authoritative and perform optional RD registration only after explicit consent. The privacy page is a normal static SEO route linked from the global footer and Inspire expediente.

**Tech Stack:** React 19, React Router, Vite, Vercel Functions, Vitest, Testing Library, RD Station Marketing Conversions API.

---

## File Map

- Create `api/_lib/rdStation.js`: validate source identifiers, build minimal legal-basis payloads, and call RD Station.
- Create `api/_lib/rdStation.test.js`: adapter and payload contract tests.
- Create `api/newsletter.js`: newsletter validation, honeypot handling, and conversion endpoint.
- Create `api/newsletter.test.js`: route validation and error-response tests.
- Modify `api/contact.js` and `api/contact.test.js`: optional consent handling without changing SMTP success semantics.
- Modify `src/pages/InspireNewsletter.jsx` and `src/pages/InspireNewsletter.test.jsx`: functional dedicated signup.
- Modify `src/components/InspireNewsletterSignup.jsx` and its existing untracked test: functional compact signup and policy link.
- Modify `src/pages/Contato.jsx` and `src/pages/Contato.test.jsx`: optional consent and source.
- Modify `src/components/PostArticleContactPanel.jsx`, `src/components/InspireNewsletterSignup.test.jsx`, and `src/pages/PostDetail.test.jsx`: wire existing optional consent to the backend.
- Create `src/pages/PrivacyPolicy.jsx` and `src/pages/PrivacyPolicy.test.jsx`: short policy content.
- Modify `src/App.jsx`, `src/App.test.jsx`, `src/components/Footer.jsx`, `src/components/Footer.test.jsx`, `src/seo/siteMetadata.js`, `src/seo/siteMetadata.test.js`, `scripts/generate-static-seo.mjs`, related SEO tests, and `vercel.json`: route, metadata, static output, and links.
- Modify `src/index.css`: focused consent, status, policy, and footer-link styling while retaining all unrelated local rules.
- Do not modify any `SilvanaMemorial`, `memorial`, or memorial API file.

### Task 1: RD Station server adapter

**Files:**
- Create: `api/_lib/rdStation.js`
- Create: `api/_lib/rdStation.test.js`

- [ ] Write failing tests for the five allowed source identifiers, rejection of unknown sources, minimal payload fields, `communications/consent/granted`, missing configuration, non-2xx provider responses, and absence of secrets/PII in errors.
- [ ] Run `npm test -- api/_lib/rdStation.test.js` and confirm failures are caused by the missing adapter.
- [ ] Implement `RDStationConfigurationError`, `RDStationProviderError`, the closed source set, and `sendNewsletterConversion({ email, name, source }, { env, fetchImpl })`.
- [ ] Send `POST https://api.rd.services/platform/conversions?api_key=...` with `event_type: "CONVERSION"`, `event_family: "CDP"`, and only `conversion_identifier`, `email`, optional `name`, and `legal_bases` in `payload`.
- [ ] Run the targeted test and confirm it passes.

### Task 2: Newsletter API route

**Files:**
- Create: `api/newsletter.js`
- Create: `api/newsletter.test.js`

- [ ] Write failing tests for POST-only behavior, trimmed/lowercased email, optional name, required boolean consent, allowed sources, invalid email, length limits, honeypot short-circuit, configuration failure, provider failure, and success.
- [ ] Run `npm test -- api/newsletter.test.js` and verify RED.
- [ ] Implement normalization and validation using the same response-object pattern as `api/contact.js`; never accept string truthiness as consent.
- [ ] Return accessible Portuguese messages without provider internals.
- [ ] Run both newsletter API and RD adapter tests and verify GREEN.

### Task 3: Dedicated and compact newsletter forms

**Files:**
- Modify: `src/pages/InspireNewsletter.jsx`
- Modify: `src/pages/InspireNewsletter.test.jsx`
- Modify: `src/components/InspireNewsletterSignup.jsx`
- Modify: `src/components/InspireNewsletterSignup.test.jsx`

- [ ] Add failing UI tests asserting unchecked required consent, consent text that specifically covers the Inspire newsletter and Otimiza communications, cancellation through email links or `otm@otm.com.br`, a privacy-policy link, exact source identifier, async `/api/newsletter` request, disabled loading state, accessible error/success status, reset after success, and preserved compact/sidebar expediente content.
- [ ] Run the two targeted test files and verify RED for missing behavior.
- [ ] Implement controlled or FormData-based submissions with `consent: true/false`, honeypots, and sources `otimiza-inspire-newsletter-page` and `otimiza-inspire-sidebar`.
- [ ] Add consent copy stating agreement to receive the Inspire newsletter and Otimiza communications, linking to `/politica-de-privacidade`, and explaining cancellation through links in the emails or `otm@otm.com.br`; keep the dedicated form name optional and the compact form email-only.
- [ ] Ensure success resets every field and checkbox; failure preserves visitor input.
- [ ] Run targeted tests and verify GREEN.

### Task 4: Optional contact opt-ins without SMTP regression

**Files:**
- Modify: `api/contact.js`
- Modify: `api/contact.test.js`
- Modify: `src/pages/Contato.jsx`
- Modify: `src/pages/Contato.test.jsx`
- Modify: `src/components/PostArticleContactPanel.jsx`
- Modify: `src/components/InspireNewsletterSignup.test.jsx`
- Modify: `src/pages/PostDetail.test.jsx`

- [ ] Add failing API tests proving a legacy contact request with both newsletter fields omitted still delivers through SMTP, no RD call occurs when consent is absent/false, one minimal RD call occurs for each allowed contact source when true, honeypot triggers neither provider, SMTP failure prevents success, and RD failure after SMTP does not fail the message response.
- [ ] Add failing UI tests proving optional unchecked consent never blocks contact; consent text specifically covers the Inspire newsletter and Otimiza communications, explains cancellation through email links or `otm@otm.com.br`, and links to the privacy policy; and every updated contact UI transmits an explicit boolean plus its exact mapped source whether checked or unchecked.
- [ ] Run the targeted API and UI tests and verify RED.
- [ ] Extend contact normalization so omitted/false `newsletterConsent` is valid and requires no source, while exact boolean `true` requires an allowed contact `newsletterSource`; call RD only after SMTP succeeds and only for true consent.
- [ ] Add the optional checkbox to `/contato` with source `otimiza-contact-page-newsletter`; wire the existing article/newsroom checkbox to sources `otimiza-inspire-article-contact-newsletter` and `otimiza-inspire-newsroom-contact-newsletter`. Each updated UI always sends its mapped source and explicit consent boolean, while the API retains compatibility with older callers that omit both. Keep existing message copy and dialog behavior. Use the same specific newsletter/Otimiza communications, cancellation, contact-address, and privacy-link copy required above.
- [ ] Log only source, provider HTTP status, and internal category on best-effort RD failure.
- [ ] Run targeted tests and verify GREEN, including existing SMTP tests from commit `407a114`.

### Task 5: Privacy policy, routing, footer links, and SEO

**Files:**
- Create: `src/pages/PrivacyPolicy.jsx`
- Create: `src/pages/PrivacyPolicy.test.jsx`
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`
- Modify: `src/components/Footer.jsx`
- Modify: `src/components/Footer.test.jsx`
- Modify: `src/components/InspireNewsletterSignup.jsx`
- Modify: `src/pages/Inspire.test.jsx`
- Modify: `src/seo/siteMetadata.js`
- Modify: `src/seo/siteMetadata.test.js`
- Modify: `scripts/generate-static-seo.mjs`
- Modify: static SEO test file located by `rg -n "generateStaticSeoPages|routeHeadings" scripts src -g '*test*'`
- Modify: `vercel.json`

- [ ] Write failing tests for `/politica-de-privacidade`, required policy sections, `otm@otm.com.br`, copyright-adjacent link, expediente link, metadata, generated static route, and Vercel rewrite.
- [ ] Run targeted route/footer/SEO tests and verify RED.
- [ ] Implement a concise Portuguese policy covering controller, collected data, separate purposes, RD Station, consent/revocation, retention without invented deadlines, security, rights, and contact.
- [ ] Add the route under `Layout`, metadata/static SEO entries, rewrite, and both requested links without changing the memorial route.
- [ ] Run targeted tests and verify GREEN.

### Task 6: Focused styling and accessibility

**Files:**
- Modify: `src/index.css`
- Modify: existing relevant style tests found with `rg -n "contact-consent|newsletter__form|site-footer" src -g '*test*'`

- [ ] Write failing style/DOM assertions for checkbox visibility, focus state, responsive footer copyright row, policy typography, and status spacing.
- [ ] Run targeted style tests and verify RED.
- [ ] Add only scoped selectors for the new controls and policy page, preserving every unrelated local CSS hunk.
- [ ] Run targeted UI/style tests and verify GREEN.

### Task 7: Full regression and preservation verification

**Files:**
- Verify only; do not touch memorial files.

- [ ] Run `npm test` and record the complete pass/fail count.
- [ ] Run `npm run lint` and resolve only task-caused findings.
- [ ] Run `npm run build` and verify static `/politica-de-privacidade` output.
- [ ] Run protected feature suites explicitly: permalink/slug tests, memorial tests, and contact SMTP tests.
- [ ] Run `git diff --check`, `git status --short`, and `git diff --name-only 5007358..HEAD` plus working-tree diff inspection.
- [ ] Confirm each protected commit remains an ancestor of `HEAD` using `git merge-base --is-ancestor`.
- [ ] Confirm task edits include no memorial path and search tracked/untracked task files for `RD_STATION_API_KEY` values or the exposed key; only the variable name may appear.
- [ ] Do not stage or commit pre-existing user changes. If committing implementation, stage only newly created files and exact task hunks after reviewing `git diff --cached`; otherwise leave implementation uncommitted for user review.
- [ ] Do not deploy until the exposed key is disabled, a replacement is stored directly in Vercel, and the user performs or designates a controlled test conversion.
