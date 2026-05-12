# Post Like Toggle Design

The existing post like interaction already supports a shared count and browser-local liked state, but it only allows one-way likes and currently uses a heavier presentation than needed.

This change will turn the interaction into a true toggle:

- the control becomes a minimal circular button with only a heart icon inside
- the visible count remains outside the button, aligned beside it
- clicking when unliked sends a like request and increments the shared count
- clicking when liked sends an unlike request and decrements the shared count
- the browser-local liked flag is added and removed in sync with the server result

The backend keeps the current `GET` and `POST` behavior and adds `DELETE /api/posts/:slug/likes` for unlike. The store will support a guarded decrement operation that never returns a negative count.

The shared `PostLikeButton` component remains the single UI entry point for both the Inspire feed and the post detail page. The visual treatment becomes intentionally simpler:

- neutral circular shell in the resting state
- red-tinted active state when liked
- short scale animation on toggle
- no text inside the button

Success means both pages render the same toggle, the count moves up and down correctly, local liked state stays accurate, and unlike never drives the global count below zero.
