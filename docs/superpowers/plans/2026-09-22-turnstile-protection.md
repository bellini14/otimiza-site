# Turnstile and form abuse protection

Goal: protect contact and every newsletter entry point, with no changes to the read-only memorial.

Implementation plan:
1. Add server-side Siteverify validation (required token, 2048-character bound, fixed endpoint, timeout, exact hostname and action matching, fail closed). Never expose secret keys. No production bypass or automatic test keys.
2. Use existing PostgreSQL connection for atomic shared quotas: 10 attempts per IP/10 min, 3 verified sends per email/hour across both endpoints. Trust Vercel's overwritten forwarding header only on Vercel; socket IP locally. Store HMAC identifiers, not plaintext IP/email. Expire and clean rows. Fail closed on storage errors.
3. Reserve duplicate submissions atomically after verification: identical contact content for 10 min; newsletter email across sources for 24 h. Release reservation on processing failure to allow retries; successful duplicate submissions return generic success without SMTP/RD calls. External providers cannot guarantee exactly-once delivery after ambiguous timeouts.
4. Integrate reusable explicit-render Turnstile React widget in contact page, article/editorial panel, newsletter page/sidebar and popup. Reset on all submitted attempts and expiration; handle script/network errors, blocked script and remounts. Keep form fields on failure. No key means form unavailable with clear visitor feedback.
5. Tests: missing/invalid/replayed tokens, action/hostname mismatch, timeout, quota responses, no side effects on rejection, concurrent quota/reservation SQL behavior, UI token lifecycle, all entry points. Existing valid-path API tests mock guard explicitly; separate guard integration tests use real validation.
6. Document Vercel environment setup, Cloudflare widget domains and safe local test credentials. Update privacy copy. Run focused tests, lint, build. Do not deploy before real keys and isolated preview configuration are confirmed.

Files: api/_lib/formProtection.js; api/_lib/formAbuseStore.js; api/contact.js; api/newsletter.js; src/components/TurnstileChallenge.jsx; src/lib/turnstile.js; five form components; matching tests; .env.example; README.md; PrivacyPolicy.jsx.
