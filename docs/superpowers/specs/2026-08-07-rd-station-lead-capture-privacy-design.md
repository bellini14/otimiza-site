# RD Station Lead Capture and Privacy Design

## Goal

Make every commercial form on the Otimiza site capable of registering an Inspire newsletter subscription in RD Station Marketing while preserving free, specific consent under the LGPD. Add a short privacy policy and links to it without changing any memorial behavior.

## Protected Baseline

The implementation must preserve all committed behavior introduced by `5007358`, `06fc06c`, `885de43`, `ddde27f`, `e6c7b97`, `70be3a7`, and `407a114`, plus every uncommitted local modification present before implementation. No destructive Git command may be used. The Silvana memorial route, forms, API routes, presentation, styles, and tests are out of scope and must remain untouched.

## Scope

The integration covers:

- the dedicated Inspire newsletter page at `/inspire/newsletter`;
- the compact Inspire sidebar newsletter form;
- the general contact form at `/contato`;
- the article contact dialog;
- the Inspire newsroom contact dialog.

It also adds a short privacy policy at `/politica-de-privacidade`, a link beside the global footer copyright, and a link below the Inspire expediente.

## Consent Rules

Newsletter forms exist solely to subscribe the visitor. Their consent checkbox is required, initially unchecked, and clearly states that the visitor agrees to receive the Inspire newsletter and Otimiza communications.

Contact and newsroom forms serve a separate messaging purpose. Their newsletter checkbox is optional and initially unchecked. Refusing it must never block the message from being sent. Only an affirmative checkbox value authorizes an RD Station conversion.

Consent copy links to the privacy policy and explains that subscription can be cancelled through links in the emails or by contacting Otimiza. No pre-checked state or generic bundled authorization is permitted.

## Architecture

A server-only RD Station adapter owns payload construction and sends `POST https://api.rd.services/platform/conversions?api_key=<key>` with JSON content. The request body is `{ event_type: "CONVERSION", event_family: "CDP", payload: { conversion_identifier, email, name?, legal_bases } }`. For an affirmative newsletter subscription, `legal_bases` is exactly `[{ category: "communications", type: "consent", status: "granted" }]`. The adapter reads `RD_STATION_API_KEY` only from the server environment. The key must never be placed in Vite variables, browser code, committed files, logs, or responses.

A dedicated newsletter API route validates and normalizes name, email, consent, source, and honeypot fields. It rejects missing consent or invalid email, silently accepts honeypot submissions without contacting RD Station, and reports a clear temporary failure if RD Station is unavailable.

The existing contact API keeps SMTP delivery from commit `407a114`. It accepts an explicit newsletter-consent value and form source. After a valid message is accepted, it requests an RD conversion only when consent is true. An RD failure must not turn a successfully delivered contact message into a user-visible failure; it is logged without secrets for operational diagnosis.

The RD payload contains only the minimum marketing data: email, optional name, conversion identifier/source, and the legal-basis fields required by the current RD conversion API. Contact message content is never sent to RD Station.

## Form Behavior

Both newsletter forms submit asynchronously, disable repeat submission while pending, show accessible loading/success/error feedback, and reset after success. The compact form remains visually compact and adds only the required consent and status treatment.

The general contact form gains an optional Inspire consent checkbox and passes the explicit boolean to the contact API. The existing optional checkbox in the shared article/newsroom dialog is retained and wired to RD Station rather than merely copied into the email message. Existing SMTP, validation, honeypot, dialog focus, accessibility, and user-feedback behavior remains intact.

Each form sends one stable source identifier from this closed mapping:

- dedicated newsletter page: `otimiza-inspire-newsletter-page`;
- Inspire sidebar: `otimiza-inspire-sidebar`;
- general contact opt-in: `otimiza-contact-page-newsletter`;
- article contact opt-in: `otimiza-inspire-article-contact-newsletter`;
- newsroom contact opt-in: `otimiza-inspire-newsroom-contact-newsletter`.

The server rejects unknown source identifiers. After a successful newsletter conversion, all visitor-entered fields and the required checkbox reset to their initial empty and unchecked states.

## Privacy Policy

The policy identifies Otimiza as controller and explains the data collected, purposes, RD Station use, consent and revocation, reasonable retention, security, data-subject rights, and the contact channel `otm@otm.com.br`. It avoids unsupported promises or invented retention periods. It notes that operational contact data and optional marketing consent are distinct purposes.

The global footer places `Política de Privacidade` beside the copyright while preserving the existing credit. The Inspire expediente places the same link below its existing content and newsroom action. Both use the application router and remain accessible by keyboard.

## Routing and Metadata

The privacy page is a normal non-Inspire route under the global layout. It receives static title, description, canonical metadata, static SEO generation, and a Vercel rewrite consistent with the existing static-page pattern.

## Error Handling and Observability

The API distinguishes invalid input, missing server configuration, RD rejection, and unexpected errors without returning provider details or secrets to the browser. Server logs may contain the safe form source, provider HTTP status code, and internal error category, but never the API key, submitted message, email address, name, or provider response body.

Newsletter registration requires RD success. Contact delivery requires SMTP success; optional RD registration is best effort after affirmative consent. Honeypot submissions produce a generic success and trigger neither provider.

## Testing and Verification

Implementation follows test-driven development. Tests cover required versus optional consent, unchecked defaults, payload minimization, source identifiers, honeypots, API validation, provider errors, newsletter feedback, contact success when RD fails, policy routing/content, footer links, Inspire expediente links, SEO, and configuration safety.

Before completion, run targeted tests, the full test suite, lint, and production build. Compare the final Git diff with the initial dirty state, confirm the seven protected commits remain ancestors of `HEAD`, confirm no memorial file changed as part of this task, and inspect the diff for secrets. Publication is a separate final step and must use the current protected branch/state without force pushing or overwriting deployed commits.

## Deployment Configuration

`RD_STATION_API_KEY` is configured directly in Vercel for the intended environments and never committed. Deployment readiness includes confirming the variable exists without printing its value. A controlled live conversion test is a deployment prerequisite, not an automated repository test: immediately before deployment the user must designate a test email address they control, or perform the submission personally and confirm the conversion in RD Station. The address is never committed to the repository or specification. No production deployment occurs until local verification, diff review, and this user-confirmed conversion check succeed.
