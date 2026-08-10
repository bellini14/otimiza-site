# Memorial Silvana Bettiol — Design

**Date:** 2026-07-29  
**Status:** Approved for planning  
**Route:** `/silvana-bettiol`

## Summary

Create a standalone memorial landing page inside the Otimiza deployment, dedicated to Silvana Tiburi Bettiol. The page is an intimate, link-only environment where invited people can publish one memory each. Published memories appear as pinned paper notes on a corkboard and remain visible to everyone who has the URL.

The supplied HTML is a behavioral and copy reference, not an implementation constraint. The final page will use the existing React/Vite application and a server-side PostgreSQL API.

## Goals

- Provide a respectful, immersive tribute with no institutional navigation or distractions.
- Let anyone with the direct link read the memorial.
- Restrict publishing to a private allowlist of names and email addresses.
- Allow exactly one active memory per invited email.
- Let contributors choose whether their name appears.
- Let contributors edit or delete their memory, including from another browser after entering their email again.
- Preserve invite privacy and never expose email addresses or the full allowlist to the client.
- Deliver a responsive, accessible experience with an editorial hero, scroll-expanding video, form, counter, and organic corkboard.

## Non-goals

- No public link from the Otimiza site.
- No entry in site navigation, footer, cards, sitemap, or other discovery surfaces.
- No general-purpose account system, password authentication, administrator dashboard, approval queue, reactions, replies, social sharing, search, or filtering.
- No more than one active memory per invited email.
- No public display of submission email addresses.

## Page Isolation and Discovery

- Add a direct React route at `/silvana-bettiol`.
- Render it outside `Layout`, `InspireLayout`, and institutional navigation.
- Do not add links to the route anywhere else in the site.
- Exclude the route from generated sitemap and static-page discovery lists.
- Set `robots` metadata to `noindex, nofollow`.
- Give the route its own visual root and page state. It may reuse shared technical utilities, but it must not inherit institutional headers, footers, or content transitions.
- The route is link-only, not network-private: anyone with the URL may read the memories.

## Content Structure

1. Editorial hero
2. Scroll-expanding memorial video
3. Email access gate and contribution form
4. Memory counter
5. Corkboard of memories
6. Minimal memorial footer with the recovery action: “Gostaria de editar ou excluir minha mensagem?”

Final video media will be supplied by the user. Until then, implementation may use a local placeholder asset or a clearly isolated media configuration value, but the finished deployment must use the supplied video.

## Visual Direction

The visual direction is immersive, warm, and editorial:

- Deep teal background with subtle gold and coral atmosphere.
- Characterful serif display typography paired with a restrained sans-serif body face.
- Warm paper, cork, wood, gold, and coral accents.
- Generous negative space around the hero.
- A light paper-like form card over the dark background.
- A dimensional corkboard with a wood frame and restrained texture.
- No photo is required; the video and collective memories form the portrait.

The supplied copy is the initial content reference, including the August 5 memorial date and the wording addressed to Silvana. Copy must be stored in the memorial page component rather than mixed into API logic.

## Scroll-expanding Video

Use the interaction pattern observed at `https://rbp-ai-app-template.vercel.app/`:

- The first viewport centers the memorial heading and supporting copy.
- A small video sits at the lower center of the hero, partially visible near the fold to invite scrolling.
- A tall scroll section contains a sticky viewport stage.
- Scroll progress expands the video from a compact rounded rectangle to a near-full-width cinematic frame.
- On desktop, target an initial size around `400 × 260px` and an expanded frame with safe horizontal margins.
- On mobile, the video expands to the safe viewport width and uses a taller crop.
- Use `object-fit: cover`, rounded corners, and a smooth, scroll-linked transform.
- The video autoplays muted and loops. If the final media contains meaningful speech or audio, provide an explicit user control to enable sound.
- Pause playback when the video is well outside the viewport where practical.
- Under `prefers-reduced-motion: reduce`, skip the progressive transform and render a stable, readable video frame.
- After the sticky section completes, normal document flow reveals the access form and mural.

## Access and Contribution Flow

### First-time visitor

1. The public mural loads without requiring credentials.
2. The visitor enters an email in the access gate.
3. The client sends the email to the server for validation.
4. If the email is allowlisted and has no active memory, the server returns the invited person’s name and a short-lived contribution session.
5. The page reveals:
   - the invited name as confirmation;
   - a memory text area with a hard limit of 280 characters;
   - a character counter;
   - a checkbox, enabled by default, labeled to indicate that the person’s name will appear;
   - the publish action.
6. The person publishes the memory.
7. The server validates the invite and uniqueness again before inserting.
8. The new note appears on the board, the counter increments, and an opaque browser ownership receipt is stored locally.

The name is always sourced from the private allowlist. Contributors cannot type or alter it directly.

### Name privacy

- If the name checkbox is enabled, the API returns the allowlisted name with the public note.
- If disabled, the public note contains no signature area at all.
- Do not display “Anônimo” or any replacement label.

### Returning in the publishing browser

- Store only an opaque note identifier and ownership receipt in browser storage; do not store the raw email.
- Match the receipt to the corresponding public note.
- Show a discreet edit icon only on that note and only in that browser.
- Editing may update the text and name-visibility choice without changing the note count.
- Deletion always asks the person to enter the invited email again and requires explicit confirmation.
- After deletion, clear the local ownership receipt.

### Returning in another browser

- No note initially appears to belong to the visitor.
- The footer action “Gostaria de editar ou excluir minha mensagem?” opens a management email gate.
- After the visitor enters an allowlisted email with an active note, the server returns a short-lived management session scoped only to that note.
- The person may edit the text, change name visibility, or request deletion.
- Deletion requires explicit confirmation and a fresh email entry in the deletion flow.

### After deletion

- Delete the active memory.
- Decrement the visible count.
- Release the email so the invite can publish a new memory.
- A later publication is a new note and receives a new ownership receipt.

## Corkboard Behavior

- Show the total number of active memories with correct singular/plural wording.
- When no memories exist, show an invitation to publish the first one.
- Notes use a consistent responsive width but a content-driven height.
- Long content wraps naturally up to 280 characters.
- Alternate among a restrained palette of paper colors.
- Apply a small deterministic rotation derived from the note identifier. Rotation must not change between reloads.
- Add a pin at the top of each note.
- Keep rotations smaller on narrow screens.
- Animate new notes with a restrained entrance only when reduced motion is not requested.
- Sort memories consistently by creation time. The initial implementation uses oldest-to-newest order, matching the supplied behavioral reference.
- The edit control must not reserve visible space on notes the current browser does not own.

## API Design

Use dedicated serverless endpoints under `/api/memorial`.

### `GET /api/memorial/notes`

Returns active public notes only:

```json
{
  "notes": [
    {
      "id": "opaque-id",
      "message": "Memory text",
      "name": "Invited Name",
      "createdAt": "ISO-8601 timestamp",
      "updatedAt": "ISO-8601 timestamp"
    }
  ],
  "count": 1
}
```

`name` is omitted or `null` when the contributor disabled name display.

### `POST /api/memorial/access`

Accepts a normalized email attempt and an intent (`contribute` or `manage`). It validates the private allowlist and returns only the state needed for that invited person:

- invited name;
- whether an active memory exists;
- a short-lived signed, intent-scoped session token;
- existing memory details only for a valid management request.

Do not return the allowlist, other invited names, or email addresses.

### `POST /api/memorial/notes`

Accepts a contribution session, message, and name-visibility boolean. Revalidates authorization, length, and uniqueness, then inserts the memory and returns:

- the public note;
- an opaque ownership receipt for browser-local storage.

### `PATCH /api/memorial/notes/:id`

Accepts either a valid browser ownership receipt or management session, plus the new message and name-visibility value. It may update only the caller’s matching active note.

### `DELETE /api/memorial/notes/:id`

Accepts a fresh email confirmation plus a valid ownership or management context. It revalidates that the email maps to the same note before deletion. On success, the invite becomes available again.

Use JSON responses with stable error codes and human-readable Portuguese messages. Do not leak whether a non-allowlisted address resembles an invited address.

## Private Invite Configuration

Use a production environment variable rather than committed source:

`SILVANA_INVITEES_JSON`

Expected shape:

```json
[
  { "email": "person@example.com", "name": "Person Name" }
]
```

Rules:

- Normalize email by trimming whitespace and converting to lowercase.
- Reject malformed entries and duplicate normalized emails at configuration load.
- Never expose this variable through `VITE_*` or client code.
- Never log raw emails or the invite list.
- Document the variable in an example/configuration guide using fake values only.

The final allowlist will be supplied by the user before production readiness.

## Persistence and Privacy

Use the existing PostgreSQL infrastructure with a dedicated table, conceptually:

```text
memorial_notes
- id: UUID primary key
- invite_key: text unique not null
- message: varchar(280) not null
- display_name: text nullable
- ownership_secret_hash: text not null
- created_at: timestamptz not null
- updated_at: timestamptz not null
```

- Derive `invite_key` from the normalized email using a server-only keyed hash. Do not store the raw email.
- Store only a hash of the browser ownership secret.
- Use a separate server-only signing secret for short-lived access/management sessions.
- Enforce one active memory per invite with a database unique constraint, not client logic.
- Validate and trim all text on the server.
- Render memory text as text, never raw HTML.
- Use parameterized SQL.
- Apply conservative request body limits.
- Do not include emails or secrets in server logs or error responses.

Required secrets:

- `SILVANA_INVITEES_JSON`
- a server-only email-key secret;
- a server-only session-signing secret.

Names for the latter two variables may be finalized in the implementation plan, but they must not use the `VITE_` prefix.

## Error and Loading States

- Initial mural loading uses a quiet skeleton or loading message.
- An empty successful response uses the first-memory invitation.
- Invalid or unauthorized email uses a discreet generic error.
- An invited email with an existing note entering the contribution flow is directed to management rather than allowed to publish twice.
- Network failures preserve typed content and provide a retry action.
- A uniqueness race returns a conflict response and refreshes the visitor into the existing-memory state.
- Expired sessions ask the person to validate the email again without losing the typed message where safe.
- Failed edits leave the existing public note unchanged.
- Failed deletion leaves both note and local receipt intact.
- Successful publication, edit, and deletion use an accessible status region.
- Disable only the action currently in flight; do not freeze reading or scrolling.

## Accessibility

- Use semantic headings, labels, form controls, and button elements.
- Preserve visible focus indicators with sufficient contrast.
- Use an `aria-live` status region for validation and mutation results.
- Keep the corkboard’s visual rotation separate from readable text flow.
- Maintain readable text contrast on every paper color.
- Make edit/delete actions keyboard accessible and give them explicit accessible names.
- Do not rely on color alone for error, success, or ownership state.
- Respect `prefers-reduced-motion`.
- Provide video controls appropriate to the final media, captions if speech is meaningful, and a useful fallback message.

## Responsive Behavior

- Desktop: compact centered access card above a spacious multi-column corkboard.
- Tablet: reduce board gaps and video margins while retaining multiple note columns where readable.
- Mobile: single-column form and notes, nearly full-width expanding video, reduced note rotation, touch targets of at least 44px, and no horizontal overflow.
- Note height remains content-driven at every breakpoint.

## Testing Strategy

### Pure and server tests

- Invite configuration parsing, normalization, duplicates, and malformed input.
- Keyed invite derivation without raw email persistence.
- Public-note serialization with and without a name.
- Stable note rotation derived from identifier.
- Message trimming, empty validation, and 280-character enforcement.
- One-active-memory database constraint and conflict handling.
- Edit preserves note identity and count.
- Delete releases the invite for a new publication.
- Ownership receipt hashing and session expiry/scope.
- Unauthorized cross-note edit/delete rejection.
- Delete requires matching fresh email confirmation.

### API tests

- Public list and empty list.
- Authorized and unauthorized access.
- Contribution, duplicate contribution, edit, delete, and republish.
- Existing-note management from a new browser.
- Stable status codes and safe response bodies.
- No raw email leakage in responses.

### Component tests

- Email gate unlocks only after authorized response.
- Allowlisted name is shown as confirmation and not editable.
- Message field enforces and displays the 280-character limit.
- Name checkbox controls signature rendering.
- Owned-note icon appears only when the local receipt matches.
- Footer management flow works without a local receipt.
- Empty state, counter grammar, loading, success, error, and retry states.
- Edit preserves count; delete decrements count and clears local receipt.

### Browser and visual checks

- Scroll-expanding video at desktop and mobile widths.
- Stable reduced-motion fallback.
- Content-driven note heights and no clipping at short and maximum-length messages.
- No horizontal overflow.
- Keyboard navigation and visible focus.
- Direct route works on local preview and production-style fallback routing.
- Route is absent from site navigation and sitemap and emits `noindex, nofollow`.

## Implementation Boundaries

Keep responsibilities separated:

- Page orchestration and state
- Scroll-video presentation
- Access/contribution form
- Corkboard and note rendering
- Browser ownership receipt utility
- Client memorial API utility
- Server invite configuration and token utilities
- Server memorial store
- Server endpoint handlers

Avoid placing API, cryptographic, and database logic in React components.

## External Inputs Required Before Production

- Final memorial video file and confirmation of whether it includes meaningful audio or speech.
- Final invite list containing `{ email, name }` entries.
- Production values for the server-only hashing and signing secrets.

Implementation and local tests can proceed with fake fixtures. Production readiness and final visual QA remain pending until the video and invite list are provided.

## Acceptance Criteria

- `/silvana-bettiol` renders as a standalone, unlinked, non-indexed memorial.
- The hero video expands on scroll in the approved reference style and has an accessible reduced-motion behavior.
- Anyone with the URL can read active memories.
- Only allowlisted emails can unlock publishing or management.
- Each email has at most one active memory.
- The allowlisted name is associated automatically and appears only when selected.
- Notes have content-driven height, deterministic organic styling, pins, and readable responsive layout.
- Only the publishing browser sees the owned-note edit icon automatically.
- Another browser can manage the matching note only after email validation through the footer flow.
- Editing preserves note identity and count.
- Deletion requires the email again, removes the note, clears local ownership, and permits republishing.
- Raw emails and the invite list never appear in client assets, public API responses, or committed configuration.
