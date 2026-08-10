# Post Likes Design

## Context

The blog post detail page already shows a `Curtir` button in [src/pages/PostDetail.jsx](/c:/Users/Joao/Desktop/Site%20otimiza/src/pages/PostDetail.jsx), but it does not persist any interaction.
Posts are rendered from Sanity content in a React/Vite frontend deployed on Vercel.
The goal is to add a lightweight like system without requiring user accounts, while keeping a global count shared by all visitors.

## Approved Direction

- Store a global like count per post in a database.
- Expose read/write like endpoints through a Vercel Function.
- Persist the clicked state only in the visitor's browser with `localStorage`.
- Change the button label from `Curtir` to `Curtido` after a successful click.
- Add a subtle heart animation on successful like.

## Proposed Design

The system will split responsibilities between global state and local state.

- Global state: the total number of likes for each post, stored in a database table keyed by post slug.
- Local state: whether the current browser has already clicked like for that post, stored in `localStorage`.

This keeps the interaction simple for visitors and avoids account creation, IP tracking, or device fingerprinting.
It also preserves the user's visual feedback on return visits from the same browser while keeping the count shared across all visitors.

## Backend Model

Use a single row per post instead of one row per click.

Suggested table:

- `slug` `text primary key`
- `count` `integer not null default 0`
- `updated_at` timestamp

Behavior:

- `GET` returns the current count for a post.
- `POST` increments the count for a post and returns the updated value.

If a post has no row yet, the backend should create it lazily on first read or write and treat the current count as `0`.

## API Contract

Add a Vercel Function route that accepts the post slug.

Recommended endpoints:

- `GET /api/posts/:slug/likes`
- `POST /api/posts/:slug/likes`

`GET` response:

- `slug`
- `count`

`POST` response:

- `slug`
- `count`
- `liked: true`

Error handling:

- invalid or missing slug returns `400`
- unexpected database errors return `500`
- responses should stay JSON-only so the React page can handle failures predictably

## Frontend Behavior

`src/pages/PostDetail.jsx` will load the like state alongside the existing post content.

On page load:

- fetch the global count for the current post slug
- read `localStorage` key `post-like:<slug>`
- render the button as `Curtido` if that key exists

On click:

- if the current browser already liked the post, do nothing
- send `POST` to the like endpoint
- on success, update the displayed count
- persist `post-like:<slug> = true` in `localStorage`
- switch the button to the active visual state
- trigger the heart animation once

If the API call fails, the UI should not mark the post as liked locally.
The page should remain usable even if the counter cannot be loaded or updated.

## Visual Treatment

The current button design should remain recognizable, with small state changes instead of a full redesign.

Approved interaction details:

- default state: outlined heart with label `Curtir`
- liked state: filled or visually emphasized heart with label `Curtido`
- button becomes disabled after a successful local like
- successful click triggers a brief heart scale animation, around `180ms` to `240ms`

The animation should feel responsive but restrained, matching the editorial tone of the page.

## Data Source Choice

This feature should not write likes back into Sanity.

Reasons:

- Sanity is the CMS for editorial content, not an interaction counter store
- exposing content write access from the frontend would be unsafe
- increment-style interaction data fits a small application database better than a CMS document mutation flow

Because the site is already hosted on Vercel, the preferred deployment model is:

- Vercel Function for the API
- Postgres for persistence

## Testing

Add focused tests around the blog post detail interaction.

Coverage should include:

- renders the fetched global like count
- reads local liked state from `localStorage`
- updates to `Curtido` after a successful click
- stores the liked flag locally after success
- does not mark the post as liked if the API request fails
- keeps the page stable when the initial like count fetch fails

The backend route should also be tested if the project adds route-level test coverage for API handlers.
