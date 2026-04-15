# Inspire Unified Post Likes Design

## Context

The site already has a working global like API and browser-local liked state for article detail pages.
However, the `Inspire` feed still renders a static `Curtir` button in [src/pages/Inspire.jsx](/c:/Users/Joao/Desktop/Site%20otimiza/src/pages/Inspire.jsx), which means the feed and the article detail page do not behave the same way.

The goal is to unify the like interaction so visitors get the same behavior in both places:

- same persistence rules
- same animation
- same count source
- same visual treatment

## Approved Direction

- Use one shared like button component for both the `Inspire` feed and the post detail page.
- Keep the existing Vercel Function and Postgres storage model.
- Keep the existing browser-local liked state via `localStorage`.
- Show the global like count inside the button in both locations.
- Remove the `Curtir` text and replace it with the number of likes once the count is available.

## Proposed Design

The like feature should move from page-specific logic into a focused reusable component.

Suggested component:

- `src/components/PostLikeButton.jsx`

Responsibilities:

- fetch current count by post slug
- read browser liked state from `localStorage`
- submit a like on click
- persist the liked flag locally
- animate the heart after a successful click
- render the same count-based label in both feed and detail contexts

This avoids duplicating logic between pages and ensures both views always stay aligned.

## Shared Interaction Model

For both the feed card and the detail page:

- on load, fetch the current like count for the post slug
- on load, read `post-like:<slug>` from `localStorage`
- if the current browser already liked the post, render the active button state immediately
- if the visitor clicks and has not liked yet, send `POST /api/posts/:slug/likes`
- on success, increment the visible state using the API response
- save `post-like:<slug> = true`
- disable the button for that browser after success

If fetching the count fails:

- keep the page usable
- do not mark the post as liked unless a successful `POST` happens
- avoid showing a fake count

## Visual Behavior

Both locations should render the same visual pattern:

- outlined heart before like
- filled or emphasized heart after like
- subtle heart scale animation after a successful click
- button label is the numeric count once available

Examples:

- before click, count loaded: `heart + 12`
- after click, count updated: `heart active + 13`

There should no longer be one place showing `Curtir` and another showing `Curtido`.
The count becomes the label in both contexts.

## Component API

The shared button should receive only the information needed for rendering and routing context.

Recommended props:

- `slug`
- optional `className`
- optional `size` or `variant` if the feed and detail page need small spacing differences

The component should own the logic state internally instead of pushing count and liked state management up into each page.

## Page Integration

`src/pages/PostDetail.jsx`:

- remove page-local like state and handlers
- replace them with the shared button component

`src/pages/Inspire.jsx`:

- replace the static feed action button with the shared button component
- pass the post slug for each card

The API layer in `src/lib/postLikes.js` should remain the shared utility for network and storage behavior.

## Testing

Add focused coverage for the shared component and the two consuming pages.

Coverage should include:

- the shared button loads and renders the fetched count
- the shared button renders active when the browser already liked the post
- clicking updates the count and stores local liked state
- the same component works in both `PostDetail` and `Inspire`
- the feed no longer renders a static text-only like button
- failed requests do not create a false liked state

The existing API tests can remain unchanged because the backend contract is not changing.
