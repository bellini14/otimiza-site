# Site-wide bilingual experience design

## Goal

Make the complete Otimiza website available in Brazilian Portuguese and United
States English. The existing language button must switch the visible content,
navigation, metadata, and URL consistently. Portuguese remains the default
language, while English pages live below `/en/...`.

## Confirmed product decisions

- Supported locales are `pt-BR` and `en-US`.
- Portuguese remains on the current routes and is always the default for `/`.
- English uses dedicated, localized routes below `/en`.
- The site does not inspect the browser language or redirect a first-time visitor.
- Interface translations are maintained in the application.
- Inspire posts and case content receive reviewed English translations in Sanity.
- Runtime machine translation is not used.
- Posts and cases without a complete English version are hidden throughout the
  English experience.
- The main site header and the Inspire header both expose the same language
  switching behavior and visual language.

## Route model

The route is the source of truth for the active locale. English route names are
localized for readable, indexable URLs:

| Portuguese | English |
| --- | --- |
| `/` | `/en` |
| `/quem-somos` | `/en/about-us` |
| `/nossa-abordagem` | `/en/our-approach` |
| `/o-que-fazemos` | `/en/what-we-do` |
| `/cases` | `/en/case-studies` |
| `/cases/:slugPt` | `/en/case-studies/:slugEn` |
| `/tecnologia` | `/en/technology` |
| `/academia-otimiza` | `/en/otimiza-academy` |
| `/contato` | `/en/contact` |
| `/inspire` | `/en/inspire` |
| `/inspire/newsletter` | `/en/inspire/newsletter` |
| `/inspire/:slugPt` | `/en/inspire/:slugEn` |

Static route pairs are defined in one routing module. Dynamic post and case
records supply their Portuguese and English slug pair from Sanity. All internal
links are built through locale-aware helpers instead of manually prepending
`/en`.

Changing language navigates to the equivalent route and creates normal browser
history. On a translated post or case, it preserves the content identity and
uses the paired slug. If the current dynamic item has no complete English
translation, switching from Portuguese goes to the corresponding English
listing (`/en/inspire` or `/en/case-studies`) rather than displaying Portuguese
content inside the English site. Switching from English to Portuguese always
uses the paired Portuguese record.

Unknown English routes show an English not-found state. Legacy Portuguese
routes remain valid and are not redirected.

## Locale architecture

A small locale module owns:

- the supported locale definitions;
- route-to-locale detection;
- static route pairing;
- localized path construction;
- dynamic alternate-path registration for loaded posts and cases;
- locale-specific date and number formatting.

A React locale provider reads the displayed router location and exposes
`locale`, `language`, `t(key, values)`, and path helpers. The URL, not
`localStorage`, determines rendered content. The provider updates
`document.documentElement.lang` to `pt-BR` or `en-US`.

`localStorage` continues to remember the latest explicit choice for continuity,
but it never redirects `/` and never overrides a URL. Both desktop and mobile
controls consume the same provider, which removes the current duplicated header
state.

## Interface translation catalogue

Application-owned copy is moved into two complete local catalogues, split into
focused namespaces such as `common`, `navigation`, `home`, `cases`, `contact`,
and `inspire`. This includes:

- desktop and mobile navigation;
- headings, paragraphs, buttons, labels, tooltips, loading and empty states;
- forms, validation messages, success and error messages;
- accessibility labels and visually hidden text;
- search filters and category display labels;
- footer and contact information labels;
- static case fallback content and static Inspire fallback content;
- not-found and unavailable states;
- page titles, descriptions, structured-data labels, and static SEO fallback
  text.

Translation keys are semantic and stable. Components do not fall back silently
to Portuguese. Development and tests fail visibly for missing keys; production
uses the key as a diagnostic fallback so mixed-language UI is not shipped
unnoticed.

Brand names, company names, product names, addresses, email addresses, phone
numbers, and URLs remain unchanged unless an explicit translated label is
required.

## Reusable language selector

The flag artwork, supported-language data, menu behavior, and accessibility
semantics are extracted from `Header.jsx` into a reusable selector component.
It preserves the supplied `pt-BR`/`en-US` appearance:

- the trigger shows the current flag and locale;
- the menu shows both locales and marks the selected one;
- Escape and outside click dismiss the menu;
- keyboard and screen-reader behavior remain supported;
- selection navigates to the equivalent localized path and closes the menu.

The main header uses the reusable selector on desktop and its locale action on
mobile. The Inspire top bar gains the same selector, styled to fit its existing
compact action group. Responsive layouts must keep search, newsletter, and
language actions usable without overlap.

## Sanity editorial model

Existing Portuguese fields remain the source for `pt-BR`, avoiding a destructive
content migration. Each translatable post field gains an explicit reviewed
English counterpart:

- `titleEn`
- `slugEn`
- `eyebrowEn`
- `descriptionEn`
- `contentEn`

Image assets and publication dates are shared. Inline image `alt` and `caption`
values in the English Portable Text are authored in English.

Case records gain:

- `sectorEn`
- `logoAltEn`
- `caseTitleEn`
- `caseDescriptionEn`
- `caseSlugEn`
- `caseContentEn`

A post is English-publishable only when `titleEn`, `slugEn`, `descriptionEn`,
and non-empty `contentEn` exist. A case is English-publishable only when
`caseTitleEn`, `caseDescriptionEn`, `caseSlugEn`, and non-empty
`caseContentEn` exist. The Studio groups English fields clearly and validates
the English group when any English editorial field is started, preventing
partially translated records from being mistaken for published content.

Sanity queries select only the active locale's projected field names. English
queries include the completeness predicate. They do not download both language
versions and choose in the browser. Search suggestions, search results,
categories, related posts, cards, feeds, and case listings all use the same
predicate.

Static fallback posts and cases are reshaped to contain explicit locale
variants. English fallbacks exist only for records with complete reviewed
translations; untranslated fallbacks are omitted from English lists.

## Data flow

1. React Router resolves the displayed path.
2. The locale provider derives `pt-BR` or `en-US`.
3. Static UI reads only the active local catalogue.
4. Locale-aware queries request only the active Sanity projection.
5. Lists and search exclude incomplete English records at the query boundary.
6. The language selector resolves an equivalent static or dynamic path and
   navigates to it.
7. SEO receives the same locale, translated content, canonical URL, and
   available alternate URL.

Changing locale invalidates locale-keyed Inspire caches, searches, and pending
requests. Results from an earlier locale request cannot overwrite the current
locale state.

## Error and incomplete-content behavior

- A failed Sanity request uses the matching-locale static fallback only.
- It never falls back from English content to Portuguese content.
- An untranslated English post or case behaves as not found when opened
  directly and links back to the English listing.
- Empty search and loading messages use the active locale.
- If an alternate dynamic path cannot be resolved, the language control targets
  the matching listing rather than guessing a slug.
- Locale values outside the supported set are ignored.

## SEO and indexability

Each page sets:

- a locale-specific title and description;
- a locale-specific canonical URL;
- Open Graph locale and localized social copy;
- structured data using the visible language and URL;
- `<html lang>`;
- `hreflang="pt-BR"` and `hreflang="en-US"` when both versions exist;
- `hreflang="x-default"` pointing to the Portuguese version.

English static routes receive generated HTML fallbacks during the build, just
like the current Portuguese pages. The sitemap includes both static route sets
and only fully translated English post/case routes. Dynamic records without an
English version do not receive English alternate links or sitemap entries.

## Performance

There is no translation API and no translation request in the navigation path.
Interface catalogues are small local JavaScript modules. Sanity responses
project only one locale and are keyed by locale in caches. The English Studio
fields do not increase client payloads unless English is active.

The initial Portuguese route remains the existing default and does not wait for
locale detection. Adding the provider and path helpers must not introduce a
second content fetch or duplicate React render loop.

## Testing and acceptance criteria

Automated tests cover:

- locale detection and every static route pair;
- localized link construction and dynamic alternate resolution;
- Portuguese default behavior without browser-language redirection;
- shared selector behavior in the main and Inspire headers;
- persistence without URL override;
- `html lang`, translated accessibility labels, and menu keyboard behavior;
- complete catalogue parity and missing-key detection;
- localized dates, filters, forms, validation, empty states, and error states;
- locale-specific Sanity projections and English completeness predicates;
- no Portuguese fallback in English Inspire and case experiences;
- request race protection when locale changes;
- locale-aware post and case detail routing;
- canonical, alternate, Open Graph, structured-data, sitemap, and generated
  static HTML output for both locales.

Manual verification covers all public routes at desktop and mobile widths. The
review checks the main and Inspire selectors, route equivalence, browser
back/forward behavior, untranslated content exclusion, search, forms, long
English labels, focus order, screen-reader names, and absence of mixed-language
copy.

The feature is complete when a visitor can start at any supported public page,
switch language through the visible button, remain on the equivalent translated
content where available, and navigate the rest of that locale without seeing
interface or editorial copy from the other language.
