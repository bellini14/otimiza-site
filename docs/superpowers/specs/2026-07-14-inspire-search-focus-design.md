# Inspire Search Focus Design

## Context

The Inspire search field synchronizes every input change to the `q` URL parameter. The global route wrapper is keyed by both `displayedLocation.pathname` and `displayedLocation.search`, so changing the query string unmounts and recreates the entire route tree. The search input therefore loses focus after the first character and interrupts typing.

## Approved Outcome

Visitors can type continuously in the Inspire search field while automatic search runs. The controlled input updates immediately, the `q` URL parameter remains synchronized, and the existing 300 ms search debounce remains in place. Searching must not blur the input or alter the cursor position.

## Design

The global route wrapper key will depend only on `displayedLocation.pathname`. Path changes will continue to create a fresh route tree for page transitions, while query-string changes on the same page will update React Router state without remounting the layout and input.

The existing Inspire search responsibilities remain unchanged:

- `InspireLayout` owns the controlled input and writes the current term to `?q=` with history replacement.
- `Inspire` reads `q` and performs the existing debounced search after 300 ms.
- Clearing the field removes `q`, and Escape continues to clear and blur intentionally.

No manual focus restoration, separate draft state, new route, or new search parameter is introduced.

## Testing

An app-level regression test will render the Inspire route, focus the search box, and type multiple characters through the real user interaction path. It will verify that the complete term remains in the input and that the input retains focus while the URL query changes. The test must fail with the current pathname-plus-search key and pass after the key is limited to the pathname.

The focused test and the existing Inspire and page-transition tests will be run after the change. A production build will verify that routing and compilation remain valid.

## Non-Goals

This correction does not change the debounce duration, Sanity query behavior, search result layout, category filtering, page-transition visuals, or URL format.
