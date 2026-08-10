# Silvana Bettiol Memorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the isolated `/silvana-bettiol` memorial with a scroll-expanding video, private email allowlist, one editable memory per invite, and a public corkboard.

**Architecture:** Keep the memorial route outside the institutional layouts and transition shell. React components call focused `/api/memorial` endpoints; server-only helpers parse the allowlist, sign short-lived sessions, hash browser receipts, and persist public notes in PostgreSQL without storing raw emails.

**Tech Stack:** React 19, React Router 7, Vite 8, Vitest/Testing Library, Vercel Node functions, `postgres`, Node `crypto`, scoped CSS.

**Baseline note:** The source commit starts with 326 passing tests, 11 failing tests, and 4 suites that cannot import existing dependencies/files. The user approved targeted memorial verification without fixing unrelated baseline failures.

---

## File Structure

### Server

- `api/_lib/memorialInvites.js` — parse and validate the private environment allowlist.
- `api/_lib/memorialAuth.js` — normalize email, derive invite keys, sign/verify short-lived sessions, and create/verify ownership receipts.
- `api/_lib/memorialStore.js` — PostgreSQL table creation and CRUD operations.
- `api/_lib/memorialErrors.js` — stable typed errors shared by handlers.
- `api/memorial/access.js` — validate an invited email for contribution or management.
- `api/memorial/notes.js` — list public notes and publish one note.
- `api/memorial/notes/[id].js` — edit or delete one note.
- Matching `*.test.js` files — direct unit/handler coverage with in-memory stores.

### Client

- `src/lib/memorialApi.js` — fetch wrapper and stable client error type.
- `src/lib/memorialOwnership.js` — localStorage receipt read/write/clear.
- `src/lib/memorialPresentation.js` — deterministic rotation/color and scroll-progress helpers.
- `src/components/memorial/MemorialVideo.jsx` — sticky scroll-expanding video stage.
- `src/components/memorial/MemorialAccessForm.jsx` — access gate, contribution, edit, and delete-confirmation UI.
- `src/components/memorial/MemorialBoard.jsx` — public counter, empty state, corkboard, and owned-note action.
- `src/pages/SilvanaMemorial.jsx` — page orchestration and data refresh.
- `src/pages/SilvanaMemorial.css` — fully scoped memorial design and responsive behavior.
- Focused `*.test.*` files beside each unit.

### Integration

- `src/App.jsx` — bypass institutional shell for `/silvana-bettiol`.
- `src/seo/SeoHead.jsx` — support route-specific robots metadata with cleanup.
- `src/seo/SeoHead.test.jsx` — verify `noindex, nofollow` does not leak to other routes.
- `src/App.test.jsx` — verify the direct isolated route.
- `.env.example` — fake memorial configuration only.
- `vercel.json` — add an explicit direct-route rewrite before the catch-all.
- `vercel.test.js` — verify the route rewrite.
- `scripts/memorialQaApi.mjs` — development-only in-memory API fixture for browser QA.
- `scripts/memorialQaApi.test.js` — verify the QA fixture’s contribution/manage lifecycle.
- `vite.config.js` — enable the QA fixture only when `MEMORIAL_QA_MODE=1`.

## Error Contract

Handlers return `{ error: { code, message } }` for failures. Use:

- `INVALID_REQUEST` — 400
- `INVITE_NOT_FOUND` — 403
- `SESSION_INVALID` — 401
- `NOTE_NOT_FOUND` — 404
- `NOTE_EXISTS` — 409
- `RATE_LIMITED` — 429
- `SERVICE_UNAVAILABLE` — 503
- `INTERNAL_ERROR` — 500

Never include an email, invite key, secret, SQL detail, or allowlist entry in a response.

## Session Contract

- Contribution and management sessions are HMAC-SHA256 signed base64url payloads with `{ inviteKey, intent, exp }`.
- Default lifetime: 15 minutes.
- An ownership receipt is `<noteId>.<randomSecret>`. Store only `sha256(randomSecret)` in PostgreSQL.
- The browser stores the opaque receipt at `silvana-memorial:ownership`.
- Deletion always includes a freshly entered email in the request body and verifies that its derived invite key matches the note.

---

### Task 1: Private invite parsing and cryptographic identity

**Files:**
- Create: `api/_lib/memorialErrors.js`
- Create: `api/_lib/memorialInvites.js`
- Create: `api/_lib/memorialInvites.test.js`
- Create: `api/_lib/memorialAuth.js`
- Create: `api/_lib/memorialAuth.test.js`
- Modify: `.env.example`

- [ ] **Step 1: Write failing invite parser tests**

Cover lowercase/trim normalization, automatic name association, malformed JSON, invalid email/name entries, and duplicate normalized emails.

```js
const invites = parseMemorialInvites({
  SILVANA_INVITEES_JSON: JSON.stringify([
    { email: ' Ana@Example.com ', name: 'Ana Souza' },
  ]),
})

expect(invites.get('ana@example.com')).toEqual({
  email: 'ana@example.com',
  name: 'Ana Souza',
})
```

- [ ] **Step 2: Run the invite tests and verify RED**

Run: `npx vitest run api/_lib/memorialInvites.test.js`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement typed errors and invite parsing**

`parseMemorialInvites(environment = process.env)` must return a `Map` keyed by normalized email and throw a configuration error before serving requests when the environment value is missing or invalid.

- [ ] **Step 4: Run invite tests and verify GREEN**

Run: `npx vitest run api/_lib/memorialInvites.test.js`

Expected: all invite tests pass.

- [ ] **Step 5: Write failing auth tests**

Cover:

- deterministic invite key with `HMAC-SHA256`;
- different secret produces a different key;
- 15-minute signed session accepted before expiry and rejected after expiry;
- wrong intent rejected;
- ownership receipt returns an opaque value and only its secret hash is persisted;
- receipt verification rejects wrong note ID and wrong secret.

- [ ] **Step 6: Run auth tests and verify RED**

Run: `npx vitest run api/_lib/memorialAuth.test.js`

Expected: FAIL because auth functions do not exist.

- [ ] **Step 7: Implement minimal auth utilities**

Export:

```js
normalizeMemorialEmail(value)
deriveInviteKey(email, secret)
createMemorialSession(payload, secret, now = Date.now())
verifyMemorialSession(token, { secret, intent, now = Date.now() })
createOwnershipReceipt(noteId, randomBytesFn)
verifyOwnershipReceipt(receipt, note, timingSafeEqualFn)
```

Use Node `crypto`, constant-time hash comparison, and no third-party JWT package.

- [ ] **Step 8: Add fake configuration documentation**

Add only fake examples:

```dotenv
SILVANA_INVITEES_JSON=[{"email":"convidada@example.com","name":"Convidada Exemplo"}]
SILVANA_EMAIL_KEY_SECRET=replace-with-a-long-random-secret
SILVANA_SESSION_SECRET=replace-with-a-different-long-random-secret
```

- [ ] **Step 9: Run Task 1 tests**

Run: `npx vitest run api/_lib/memorialInvites.test.js api/_lib/memorialAuth.test.js`

Expected: all tests pass with no raw email printed.

- [ ] **Step 10: Commit**

```powershell
git add -- .env.example api/_lib/memorialErrors.js api/_lib/memorialInvites.js api/_lib/memorialInvites.test.js api/_lib/memorialAuth.js api/_lib/memorialAuth.test.js
git commit -m "feat: add private memorial invite identity"
```

### Task 2: PostgreSQL memorial store

**Files:**
- Create: `api/_lib/memorialStore.js`
- Create: `api/_lib/memorialStore.test.js`

- [ ] **Step 1: Write failing store tests**

Use the existing tagged-template fake SQL test pattern. Cover:

- table creation once;
- public list oldest first;
- insert returns serialized note;
- duplicate `invite_key` becomes `NOTE_EXISTS`;
- update preserves ID and creation time;
- delete removes the note;
- deleted invite key can insert again;
- raw email is not a column or query parameter.

- [ ] **Step 2: Run store tests and verify RED**

Run: `npx vitest run api/_lib/memorialStore.test.js`

Expected: FAIL because the store does not exist.

- [ ] **Step 3: Implement the store**

Create `memorial_notes` with:

```sql
id UUID PRIMARY KEY,
invite_key TEXT UNIQUE NOT NULL,
message VARCHAR(280) NOT NULL,
display_name TEXT,
ownership_secret_hash TEXT NOT NULL,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

Expose:

```js
createMemorialStore(sql)
getMemorialStore()
```

with `listPublicNotes`, `findByInviteKey`, `createNote`, `updateNote`, and `deleteNote`.

- [ ] **Step 4: Run store tests and verify GREEN**

Run: `npx vitest run api/_lib/memorialStore.test.js`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```powershell
git add -- api/_lib/memorialStore.js api/_lib/memorialStore.test.js
git commit -m "feat: persist memorial notes"
```

### Task 3: Memorial access and public note API

**Files:**
- Create: `api/memorial/access.js`
- Create: `api/memorial/access.test.js`
- Create: `api/memorial/notes.js`
- Create: `api/memorial/notes.test.js`

- [ ] **Step 1: Write failing access handler tests**

Inject fake invite/store/auth dependencies through exported handler factories. Cover:

- method guard;
- invalid body;
- conservative request-body rejection before parsing oversized payloads;
- unauthorized generic response;
- contribution state with allowlisted name and no note;
- existing note redirects state to management;
- management returns only the caller’s note;
- session intent is correct;
- small per-process throttling rejects repeated failed access attempts without logging emails.

- [ ] **Step 2: Run access tests and verify RED**

Run: `npx vitest run api/memorial/access.test.js`

Expected: FAIL because the handler does not exist.

- [ ] **Step 3: Implement access handler**

Export `createAccessHandler(dependencies)` and a default production handler. Normalize the email, consult the allowlist, derive the invite key, fetch only that invite’s note, and issue a 15-minute session.

- [ ] **Step 4: Run access tests and verify GREEN**

Run: `npx vitest run api/memorial/access.test.js`

Expected: all access tests pass.

- [ ] **Step 5: Write failing list/publish tests**

Cover:

- GET returns `{ notes, count }`;
- hidden name is `null`;
- POST requires a contribution session;
- empty or over-280 message is rejected;
- server trims the message;
- allowlisted name comes from invite configuration, not request body;
- name opt-out stores `null`;
- uniqueness conflict returns 409;
- successful publish returns public note plus ownership receipt;
- response contains no raw email/invite key/ownership hash.

- [ ] **Step 6: Run note handler tests and verify RED**

Run: `npx vitest run api/memorial/notes.test.js`

Expected: FAIL because the handler does not exist.

- [ ] **Step 7: Implement list/publish handler**

Accept bearer sessions, revalidate invite membership and intent, create a random ownership receipt, persist only its hash, and return the opaque receipt.

- [ ] **Step 8: Run Task 3 tests**

Run: `npx vitest run api/memorial/access.test.js api/memorial/notes.test.js`

Expected: all tests pass.

- [ ] **Step 9: Commit**

```powershell
git add -- api/memorial/access.js api/memorial/access.test.js api/memorial/notes.js api/memorial/notes.test.js
git commit -m "feat: add memorial access and publishing API"
```

### Task 4: Edit, delete, and republish API

**Files:**
- Create: `api/memorial/notes/[id].js`
- Create: `api/memorial/notes/[id].test.js`

- [ ] **Step 1: Write failing mutation tests**

Cover:

- unsupported methods;
- PATCH with matching owner receipt;
- PATCH with matching management session;
- cross-note and expired credentials rejected;
- PATCH validates text and derives display name from invite;
- DELETE rejects missing/fresh-email mismatch;
- DELETE succeeds only when email, note, and authorization context agree;
- deleted invite can publish again through store behavior;
- safe 404 and error bodies.

- [ ] **Step 2: Run mutation tests and verify RED**

Run: `npx vitest run "api/memorial/notes/[id].test.js"`

Expected: FAIL because the dynamic handler does not exist.

- [ ] **Step 3: Implement mutation handler**

Export a factory and default handler. Read the ID from `req.query.id`, authorize owner receipt or management session, revalidate allowlist name for PATCH, and require `emailConfirmation` for DELETE.

- [ ] **Step 4: Run mutation tests and verify GREEN**

Run: `npx vitest run "api/memorial/notes/[id].test.js"`

Expected: all tests pass.

- [ ] **Step 5: Run all memorial server tests**

Run:

```powershell
npx vitest run api/_lib/memorialInvites.test.js api/_lib/memorialAuth.test.js api/_lib/memorialStore.test.js api/memorial/access.test.js api/memorial/notes.test.js "api/memorial/notes/[id].test.js"
```

Expected: all memorial server tests pass.

- [ ] **Step 6: Commit**

```powershell
git add -- "api/memorial/notes/[id].js" "api/memorial/notes/[id].test.js"
git commit -m "feat: manage memorial notes"
```

### Task 5: Client API, browser receipt, and deterministic presentation

**Files:**
- Create: `src/lib/memorialApi.js`
- Create: `src/lib/memorialApi.test.js`
- Create: `src/lib/memorialOwnership.js`
- Create: `src/lib/memorialOwnership.test.js`
- Create: `src/lib/memorialPresentation.js`
- Create: `src/lib/memorialPresentation.test.js`

- [ ] **Step 1: Write failing client utility tests**

Cover:

- JSON methods and bearer headers;
- stable client error from `{ error: { code, message } }`;
- network failure fallback;
- localStorage reads malformed/missing data safely;
- receipt write and clear;
- no raw email stored;
- stable rotation/color for a note ID;
- rotation bound is smaller on mobile;
- scroll progress clamps to `[0, 1]`.

- [ ] **Step 2: Run tests and verify RED**

Run: `npx vitest run src/lib/memorialApi.test.js src/lib/memorialOwnership.test.js src/lib/memorialPresentation.test.js`

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement the utilities**

Client API:

```js
listMemorialNotes()
accessMemorial({ email, intent })
publishMemorialNote({ sessionToken, message, showName })
updateMemorialNote({ id, authorization, message, showName })
deleteMemorialNote({ id, authorization, emailConfirmation })
```

Ownership storage contains only:

```json
{ "noteId": "opaque-id", "receipt": "opaque-receipt" }
```

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npx vitest run src/lib/memorialApi.test.js src/lib/memorialOwnership.test.js src/lib/memorialPresentation.test.js`

Expected: all utility tests pass.

- [ ] **Step 5: Commit**

```powershell
git add -- src/lib/memorialApi.js src/lib/memorialApi.test.js src/lib/memorialOwnership.js src/lib/memorialOwnership.test.js src/lib/memorialPresentation.js src/lib/memorialPresentation.test.js
git commit -m "feat: add memorial client utilities"
```

### Task 6: Video stage and corkboard components

**Files:**
- Create: `src/components/memorial/MemorialVideo.jsx`
- Create: `src/components/memorial/MemorialVideo.test.jsx`
- Create: `src/components/memorial/MemorialBoard.jsx`
- Create: `src/components/memorial/MemorialBoard.test.jsx`

- [ ] **Step 1: Write failing video tests**

Cover:

- semantic region and accessible video fallback;
- configured media URL;
- muted/autoplay/loop/playsInline;
- scroll progress writes a CSS custom property;
- reduced-motion mode uses stable state;
- optional sound button only when audio is enabled by configuration.

- [ ] **Step 2: Run video tests and verify RED**

Run: `npx vitest run src/components/memorial/MemorialVideo.test.jsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement video stage**

Use a sticky stage in a `180svh` section and `requestAnimationFrame`-throttled scroll measurement. Set `--memorial-video-progress` rather than rerendering React on every scroll. When no final video URL is configured, show a styled placeholder in the same frame.

- [ ] **Step 4: Run video tests and verify GREEN**

Run: `npx vitest run src/components/memorial/MemorialVideo.test.jsx`

Expected: all video tests pass.

- [ ] **Step 5: Write failing board tests**

Cover:

- loading, empty, singular, and plural states;
- oldest-first order;
- note message and optional signature;
- no signature region for hidden name;
- deterministic paper style;
- content-driven height (no fixed/min-height style on note);
- edit button only on the locally owned note.

- [ ] **Step 6: Run board tests and verify RED**

Run: `npx vitest run src/components/memorial/MemorialBoard.test.jsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 7: Implement board**

Render text content only. Give the owned edit button the accessible name `Editar minha lembrança`. Keep the pin decorative with `aria-hidden`.

- [ ] **Step 8: Run Task 6 tests**

Run: `npx vitest run src/components/memorial/MemorialVideo.test.jsx src/components/memorial/MemorialBoard.test.jsx`

Expected: all component tests pass.

- [ ] **Step 9: Commit**

```powershell
git add -- src/components/memorial/MemorialVideo.jsx src/components/memorial/MemorialVideo.test.jsx src/components/memorial/MemorialBoard.jsx src/components/memorial/MemorialBoard.test.jsx
git commit -m "feat: add memorial video and corkboard"
```

### Task 7: Access, contribution, edit, and deletion UI

**Files:**
- Create: `src/components/memorial/MemorialAccessForm.jsx`
- Create: `src/components/memorial/MemorialAccessForm.test.jsx`

- [ ] **Step 1: Write failing access-form tests**

Model explicit modes: `access`, `contribute`, `manage`, `edit`, and `delete-confirm`.

Cover:

- email entered before fields unlock;
- unauthorized status is accessible;
- allowlisted name appears and is not editable;
- textarea hard limit and live character counter;
- show-name checkbox defaults checked;
- existing note enters management;
- publish preserves text on network failure;
- uniqueness conflict refreshes the form into the existing-memory management state;
- expired sessions return to email validation without losing the typed message;
- edit keeps identity;
- delete asks for email again and confirmation;
- successful delete clears owner state and returns to access;
- footer flow can open management mode.

- [ ] **Step 2: Run form tests and verify RED**

Run: `npx vitest run src/components/memorial/MemorialAccessForm.test.jsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the form state machine**

Keep raw email only in component memory. Clear it after successful publication/edit session setup where it is no longer needed. Expose mutation callbacks so the page can refresh notes and ownership.

- [ ] **Step 4: Run form tests and verify GREEN**

Run: `npx vitest run src/components/memorial/MemorialAccessForm.test.jsx`

Expected: all form tests pass.

- [ ] **Step 5: Commit**

```powershell
git add -- src/components/memorial/MemorialAccessForm.jsx src/components/memorial/MemorialAccessForm.test.jsx
git commit -m "feat: add memorial contribution management flow"
```

### Task 8: Standalone memorial page and visual system

**Files:**
- Create: `src/pages/SilvanaMemorial.jsx`
- Create: `src/pages/SilvanaMemorial.test.jsx`
- Create: `src/pages/SilvanaMemorial.css`

- [ ] **Step 1: Write failing page tests**

Cover:

- approved hero copy and August 5 eyebrow;
- `<SeoHead robots="noindex, nofollow">` is rendered by the actual memorial page;
- video before access form in document order;
- initial public-note loading;
- public refresh after publish/edit/delete;
- local ownership receipt controls owned-note action;
- footer recovery copy opens management;
- status updates use `aria-live`;
- memorial root contains no institutional header/nav/footer.

- [ ] **Step 2: Run page tests and verify RED**

Run: `npx vitest run src/pages/SilvanaMemorial.test.jsx`

Expected: FAIL because the page does not exist.

- [ ] **Step 3: Implement page orchestration**

Load public notes on mount, store `notes/loading/error`, connect access mutations to refresh, and keep management UI close to the form rather than inside every public note.
Render `SeoHead` from this page with the memorial title, description, canonical URL, and
`robots="noindex, nofollow"` so the indexing directive is attached to the real route.

- [ ] **Step 4: Implement scoped visual design**

All rules must be under `.silvana-memorial`. Include:

- deep teal atmospheric background;
- Fraunces/Work Sans font loading with fallbacks;
- paper access card;
- wood-framed textured corkboard;
- paper palette, deterministic transform variables, pin, and content-driven height;
- near-full-width expanded video;
- mobile single-column notes and smaller rotation;
- visible focus, 44px touch targets, contrast;
- reduced-motion overrides;
- no horizontal overflow.

- [ ] **Step 5: Run page and component tests**

Run:

```powershell
npx vitest run src/pages/SilvanaMemorial.test.jsx src/components/memorial/MemorialVideo.test.jsx src/components/memorial/MemorialBoard.test.jsx src/components/memorial/MemorialAccessForm.test.jsx src/lib/memorialApi.test.js src/lib/memorialOwnership.test.js src/lib/memorialPresentation.test.js
```

Expected: all memorial client tests pass.

- [ ] **Step 6: Commit**

```powershell
git add -- src/pages/SilvanaMemorial.jsx src/pages/SilvanaMemorial.test.jsx src/pages/SilvanaMemorial.css
git commit -m "feat: build Silvana memorial experience"
```

### Task 9: Isolated routing, noindex metadata, and direct deployment route

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`
- Modify: `src/seo/SeoHead.jsx`
- Modify: `src/seo/SeoHead.test.jsx`
- Modify: `vercel.json`
- Modify: `vercel.test.js`

- [ ] **Step 1: Write failing isolation and robots tests**

Add tests that:

- direct `/silvana-bettiol` renders memorial content;
- institutional Layout and PageTransition markers are absent;
- other routes still use the existing shell;
- the rendered `/silvana-bettiol` route creates `meta[name="robots"]` with `noindex, nofollow`;
- `SeoHead robots="noindex, nofollow"` creates one robots meta;
- leaving the memorial removes/restores the previous robots directive.

- [ ] **Step 2: Run integration tests and verify RED**

Run:

```powershell
npx vitest run src/App.test.jsx src/seo/SeoHead.test.jsx vercel.test.js
```

Expected: new memorial assertions fail.

- [ ] **Step 3: Implement isolated route**

Inside `BrowserRouter`, add an `AppShell` that reads `useLocation()`. Return `<SilvanaMemorial />` directly for the exact memorial path; otherwise preserve the existing `SmoothScroll` and `PageTransition` tree unchanged.

- [ ] **Step 4: Implement robots metadata cleanup**

Add a `robots` prop to `SeoHead`. The effect must restore the previous content or remove the element on cleanup so `noindex` does not leak to other SPA routes.

- [ ] **Step 5: Add explicit Vercel rewrite**

Before the generic catch-all:

```json
{
  "source": "/silvana-bettiol",
  "destination": "/index.html"
}
```

Do not add the route to `staticPageMetadata`; this keeps it out of static SEO generation and the sitemap.

- [ ] **Step 6: Run integration tests and verify GREEN**

Run:

```powershell
npx vitest run src/App.test.jsx src/seo/SeoHead.test.jsx vercel.test.js
```

Expected: targeted integration tests pass.

- [ ] **Step 7: Commit**

```powershell
git add -- src/App.jsx src/App.test.jsx src/seo/SeoHead.jsx src/seo/SeoHead.test.jsx vercel.json vercel.test.js
git commit -m "feat: isolate memorial route"
```

### Task 10: Targeted verification and visual QA

**Files:**
- Create: `scripts/memorialQaApi.mjs`
- Create: `scripts/memorialQaApi.test.js`
- Modify: `vite.config.js`
- Modify implementation files only if verification reveals memorial-specific defects.

- [ ] **Step 1: Run the complete memorial test set**

Run:

```powershell
npx vitest run api/_lib/memorialInvites.test.js api/_lib/memorialAuth.test.js api/_lib/memorialStore.test.js api/memorial/access.test.js api/memorial/notes.test.js "api/memorial/notes/[id].test.js" src/lib/memorialApi.test.js src/lib/memorialOwnership.test.js src/lib/memorialPresentation.test.js src/components/memorial/MemorialVideo.test.jsx src/components/memorial/MemorialBoard.test.jsx src/components/memorial/MemorialAccessForm.test.jsx src/pages/SilvanaMemorial.test.jsx src/seo/SeoHead.test.jsx src/App.test.jsx vercel.test.js
```

Expected: all targeted tests pass.

- [ ] **Step 2: Run lint on changed implementation files**

Run:

```powershell
npx eslint api/_lib/memorial*.js api/memorial src/lib/memorial*.js src/components/memorial src/pages/SilvanaMemorial.jsx src/seo/SeoHead.jsx src/App.jsx
```

Expected: zero errors.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: exit 0 and `dist` generated.

- [ ] **Step 4: Confirm sitemap exclusion**

Run:

```powershell
Select-String -Path dist/sitemap.xml -Pattern 'silvana-bettiol'
```

Expected: no matches.

- [ ] **Step 5: Write the failing QA API fixture test**

Cover a single fake invite (`convidada@example.com` / `Convidada Exemplo`) through
access, publish, edit, delete, and republish using an in-memory note. The fixture must
be importable only from tooling and must not read production secrets.

- [ ] **Step 6: Run the QA fixture test and verify RED**

Run: `npx vitest run scripts/memorialQaApi.test.js`

Expected: FAIL because the fixture does not exist.

- [ ] **Step 7: Implement the development-only QA API fixture**

Create `scripts/memorialQaApi.mjs` as a Vite `configureServer` middleware that responds
to `/api/memorial/access`, `/api/memorial/notes`, and `/api/memorial/notes/:id` with
in-memory state and the same public response shapes as production. Enable the plugin
from `vite.config.js` only when `process.env.MEMORIAL_QA_MODE === '1'`.

The fixture is for browser QA only, uses fake data, never loads in a production build,
and must start empty on each dev-server restart.

- [ ] **Step 8: Run the QA fixture test and verify GREEN**

Run: `npx vitest run scripts/memorialQaApi.test.js`

Expected: all fixture lifecycle tests pass.

- [ ] **Step 9: Commit the QA fixture**

```powershell
git add -- scripts/memorialQaApi.mjs scripts/memorialQaApi.test.js vite.config.js
git commit -m "test: add memorial browser QA fixture"
```

- [ ] **Step 10: Start the local full-flow QA server**

Run:

```powershell
$env:MEMORIAL_QA_MODE='1'
npm run dev -- --host 127.0.0.1
```

Expected: Vite starts and the development-only middleware serves the fake memorial API.

- [ ] **Step 11: Perform browser QA at desktop**

At approximately `1280 × 720`, verify:

- direct route and no institutional navigation;
- initial video frame near the fold;
- scroll expansion reaches safe near-full width;
- access with `convidada@example.com`, publish, edit, delete with email confirmation, and republish;
- content-driven short and 280-character note heights;
- owner edit icon only on matching note;
- console has no memorial errors.

- [ ] **Step 12: Perform browser QA at mobile**

At approximately `390 × 844`, verify:

- no horizontal overflow;
- full-width/taller video crop;
- readable single-column notes;
- reduced rotations;
- 44px controls and visible focus;
- footer management action.

- [ ] **Step 13: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce`. Confirm the video uses a stable frame and note entrance animation is disabled.

- [ ] **Step 14: Record the unrelated baseline**

Run `npm test` once. Confirm memorial tests remain green and report the pre-existing failures separately rather than treating them as regressions.

- [ ] **Step 15: Review changed files**

Run:

```powershell
git status --short
git diff --check
git diff --stat HEAD~10..HEAD
```

Expected: only memorial and approved integration files are changed, with no whitespace errors.

- [ ] **Step 16: Commit any verification-only fixes**

```powershell
git add -- <only-files-fixed-during-verification>
git commit -m "fix: polish memorial verification issues"
```

Skip this commit when verification required no code changes.

## Release Blockers

Implementation may use fake fixtures and a styled video placeholder. Do not call the production release ready until all are supplied and configured:

- final memorial video;
- final `{ email, name }` invite list in `SILVANA_INVITEES_JSON`;
- long random values for `SILVANA_EMAIL_KEY_SECRET` and `SILVANA_SESSION_SECRET`;
- production PostgreSQL connection.
