# Inspire Category Filters Design

## Context

The Inspire landing page currently starts its article feed with two controls, `Para você` and `Em destaque`. They switch between the full loaded feed and a six-item subset, but they do not represent editorial categories.

The requested change replaces those controls with five single-select filters in the same position:

- `Tudo`
- `Artigos`
- `Dica de leitura`
- `Dica para assistir`
- `Lente analítica`

The Sanity post field `eyebrow` remains the source of truth for dynamic post categories. Local fallback posts receive an Inspire-specific `inspireCategory` value so their existing `eyebrow` labels can continue serving other site surfaces without changing meaning.

## Approved Outcome

Replace the existing tabs completely. `Tudo` is selected on initial render and displays the full feed. Selecting any other option displays only posts whose Sanity `eyebrow` or local fallback `inspireCategory` belongs to that category.

The selected filter is exclusive: choosing one option deselects the previous one. Its active treatment follows the existing understated editorial tab style, including the underline, rather than introducing chips or a new visual language.

## Category Model

The UI uses stable internal keys separate from visible labels:

| Key | Visible label | Category value |
| --- | --- | --- |
| `all` | Tudo | no restriction |
| `articles` | Artigos | Artigos |
| `reading-tip` | Dica de leitura | Dica de leitura |
| `watch-tip` | Dica para assistir | Dica para assistir |
| `analytical-lens` | Lente analítica | Lente Analítica |

Sanity category pagination uses the canonical category values in the table above. Editors must use those values in the existing `eyebrow` field; this avoids filtering partial server batches in the browser and keeps offsets and `hasMore` correct. The page may compare the returned value case-insensitively as a defensive check, but the server query remains canonical and exact.

Local fallback category matching uses `inspireCategory` and normalizes leading and trailing whitespace, letter case, and diacritics. This keeps local filtering stable while preserving the requested Portuguese labels in the interface.

## Data Flow and Pagination

For `Tudo`, the page keeps its current initial Sanity query, cache behavior, and infinite pagination.

For a category filter, the page requests a category-restricted, date-sorted Sanity batch beginning at offset zero. Changing filters resets the visible category feed, pagination offset, error state, and `hasMore` state. Infinite scrolling then requests subsequent batches for that same category. Category-specific batches are not written into the existing all-post cache, preventing a partial category feed from replacing the cached global feed.

When Sanity is unavailable or returns no dynamic collection and the page is using the static fallback, each fallback post has one of the four requested values in a new `inspireCategory` property. The selected category is applied locally with the normalization rules above, and static pagination continues to use the existing batch sizes. Existing `eyebrow` values remain untouched for consumers outside Inspire.

The fallback mapping is explicit:

| Fallback post slug | `inspireCategory` |
| --- | --- |
| `teste-de-integracao-sanity-nossa-nova-estrutura-esta-ativa` | Artigos |
| `como-transformar-gargalos-operacionais-em-vantagem-competitiva` | Lente Analítica |
| `governanca-orientada-por-dados-para-times-que-precisam-escalar` | Lente Analítica |
| `automacao-com-impacto-real-onde-investir-primeiro` | Artigos |
| `rituais-de-gestao-que-reduzem-ruido-e-aceleram-resposta` | Dica de leitura |
| `o-que-muda-quando-a-operacao-passa-a-trabalhar-com-prioridade-real` | Artigos |
| `estrutura-enxuta-para-acompanhar-indicadores-sem-burocracia` | Dica de leitura |
| `onde-a-automacao-entrega-valor-nas-primeiras-semanas` | Dica para assistir |
| `como-desenhar-fluxos-mais-claros-para-times-multifuncionais` | Dica para assistir |
| `onde-a-automacao-falha-quando-o-processo-ainda-esta-errado` | Lente Analítica |
| `playbooks-enxutos-para-times-comerciais-mais-previsiveis` | Dica de leitura |

Rapid filter changes must not allow a slower response for an older selection to overwrite the newest selection. The page will ignore stale category responses.

## Search Interaction

The current search experience remains unchanged. While a URL search query is active, the category controls remain hidden and search results are not narrowed by the previously selected category. Clearing the search restores the selected category and its feed.

## Empty, Loading, and Error States

- While the first batch for a newly selected category is loading, show the existing feed loading treatment.
- If a selected category has no posts, show a concise empty state instead of a blank article column.
- If loading a later category batch fails, keep already loaded articles visible and reuse the existing retry control.
- The existing search-specific status remains reserved for search results.

## Accessibility and Responsive Behavior

The filters are native buttons inside a `role="group"` container with a category-focused accessible label. Each button exposes its state through `aria-pressed`. This retains normal Tab and Shift+Tab navigation without claiming tab-widget keyboard behavior.

On narrow screens, the filters remain on one horizontal line with overflow scrolling so labels are not compressed or wrapped. The active underline stays attached to the selected label.

## Component Boundaries

The change stays focused in the existing Inspire page and stylesheet:

- `src/pages/Inspire.jsx`: filter configuration, selected state, category-aware data fetching, feed selection, empty state, and filter markup.
- `src/lib/blogFilters.js`: a small pure category-normalization/matching helper if the existing normalization is insufficient.
- `src/data/blogPosts.js`: add an Inspire-specific category to each fallback post without replacing its existing `eyebrow`.
- `src/pages/Inspire.test.jsx` and focused utility tests: behavior and regression coverage.
- `src/index.css`: filter overflow and empty-state styling while retaining the current visual grammar.

No new CMS field, route, shared design-system component, or URL parameter is required.

## Testing Scope

Automated coverage will verify:

- the five requested filter labels replace the two current tabs;
- `Tudo` is selected initially;
- selecting each category renders matching posts and excludes other categories;
- matching is resilient to case and diacritic differences in local data;
- category changes reset pagination and do not allow stale responses to win;
- infinite loading remains restricted to the selected category;
- an empty category renders an explicit empty state;
- the existing search flow continues to work independently.

The finished page will also be checked in the browser at desktop and mobile widths to verify active styling, overflow behavior, article updates, and absence of layout regressions.

## Non-Goals

This change does not add multi-select filters, filter counts, category management in Sanity, category-specific URLs, new sidebar behavior, or changes to article detail pages.
