# Inspire Search Focus Design

## Context

The Inspire search field synchronizes every input change to the `q` URL parameter. The global route wrapper is keyed by both `displayedLocation.pathname` and `displayedLocation.search`, so changing the query string unmounts and recreates the entire route tree. The search input therefore loses focus after the first character and interrupts typing.

## Approved Outcome

Visitors can type continuously in the Inspire search field while automatic search runs. The controlled input updates immediately, the `q` URL parameter remains synchronized, and the existing 300 ms search debounce remains in place. Searching must not blur the input or alter the cursor position.

## Design

The global route wrapper key will depend only on `displayedLocation.pathname`. Path changes will continue to create a fresh route tree for page transitions, while query-string changes on the same page will update React Router state without remounting the layout and input.

`InspireLayout` will also distinguish URL values written by its own controlled input from genuine external query navigation. Each local write receives component-scoped navigation metadata with a monotonic sequence, preserved in router state. When an internal update is observed, it and all older superseded writes are retired; only that exact pending update is treated as an echo. Unmatched navigation remains authoritative and updates the input even while focused, so repeated values, clearing, browser history, and other external navigation stay synchronized.

The existing Inspire search responsibilities remain unchanged:

- `InspireLayout` owns the controlled input and writes the current term to `?q=` with history replacement.
- `Inspire` reads `q` and performs the existing debounced search after 300 ms.
- Clearing the field removes `q`, and Escape continues to clear and blur intentionally.

No manual focus restoration, separate draft state, new route, or new search parameter is introduced.

## Testing

App-level regression tests will render the Inspire route through the real route wrapper while replacing only the unrelated article feed. They will verify initial `q` hydration, retained DOM identity, focus and caret across same-path query updates, the complete rapidly edited term in both the input and URL, synchronization of a genuine external `q` navigation while focused, collision with pending local values, and type-clear-Back history restoration.

The focused test and the existing Inspire and page-transition tests will be run after the change. A production build will verify that routing and compilation remain valid.

## Non-Goals

This correction does not change the debounce duration, Sanity query behavior, search result layout, category filtering, page-transition visuals, or URL format.
