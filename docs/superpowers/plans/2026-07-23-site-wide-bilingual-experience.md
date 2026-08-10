# Site-wide Bilingual Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every public Otimiza route consistently available in `pt-BR` and `en-US`, with URL-driven language switching in the main and Inspire headers, reviewed editorial translations, and locale-correct SEO.

**Architecture:** Add a lightweight application-owned i18n layer whose locale is derived exclusively from React Router. Static UI reads complete local catalogues, while Sanity query builders project only the selected editorial language plus paired slugs used for switching detail routes. A shared language selector navigates through centralized route mappings, and all SEO/build-time generators consume the same locale route definitions.

**Tech Stack:** React 19, React Router 7, Vite 8, Sanity, Portable Text, Vitest, Testing Library

---

### Task 1: Establish locale, catalogue, and route primitives

**Files:**
- Create: `src/i18n/locales.js`
- Create: `src/i18n/routes.js`
- Create: `src/i18n/catalogs/pt-BR.js`
- Create: `src/i18n/catalogs/en-US.js`
- Create: `src/i18n/catalogs.test.js`
- Create: `src/i18n/routes.test.js`

- [ ] **Step 1: Write failing catalogue-parity and route-mapping tests**

  Assert that the supported locales are exactly `pt-BR` and `en-US`; `/` resolves
  to Portuguese; every `/en` static route resolves to English; every static route
  round-trips to its paired route; unknown catalogue keys are detectable; and the
  catalogue key sets are identical.

- [ ] **Step 2: Run the focused tests and verify module-not-found failures**

  Run: `npm test -- src/i18n/catalogs.test.js src/i18n/routes.test.js`

  Expected: FAIL because the i18n modules do not exist.

- [ ] **Step 3: Implement locale constants and route pairs**

  Define semantic route IDs and one canonical pair map:

  ```js
  export const routePairs = {
    home: { 'pt-BR': '/', 'en-US': '/en' },
    about: { 'pt-BR': '/quem-somos', 'en-US': '/en/about-us' },
    approach: { 'pt-BR': '/nossa-abordagem', 'en-US': '/en/our-approach' },
    services: { 'pt-BR': '/o-que-fazemos', 'en-US': '/en/what-we-do' },
    cases: { 'pt-BR': '/cases', 'en-US': '/en/case-studies' },
    technology: { 'pt-BR': '/tecnologia', 'en-US': '/en/technology' },
    academy: { 'pt-BR': '/academia-otimiza', 'en-US': '/en/otimiza-academy' },
    contact: { 'pt-BR': '/contato', 'en-US': '/en/contact' },
    inspire: { 'pt-BR': '/inspire', 'en-US': '/en/inspire' },
    newsletter: { 'pt-BR': '/inspire/newsletter', 'en-US': '/en/inspire/newsletter' },
  }
  ```

  Add `localeFromPath`, `pathForRoute`, `routeIdFromPath`,
  `switchStaticPath`, and helpers for localized dynamic case/Inspire paths.
  Dynamic helpers accept explicit `{ slugPt, slugEn }` metadata and fall back to
  the target locale's listing when the paired slug is unavailable.

- [ ] **Step 4: Seed complete shell/common catalogue namespaces**

  Add matching semantic keys for navigation, language menus, footer, shared CTAs,
  loading/error/not-found copy, form labels, accessibility labels, Inspire shell,
  case shell, and SEO defaults. `en-US.js` contains reviewed natural English, not
  mechanical word-for-word labels.

- [ ] **Step 5: Run focused tests**

  Run: `npm test -- src/i18n/catalogs.test.js src/i18n/routes.test.js`

  Expected: PASS.

- [ ] **Step 6: Commit**

  ```bash
  git add src/i18n
  git commit -m "feat: add locale catalogues and route mappings"
  ```

### Task 2: Add the URL-driven locale provider

**Files:**
- Create: `src/i18n/LocaleProvider.jsx`
- Create: `src/i18n/LocaleProvider.test.jsx`
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`
- Create: `src/pages/LocalizedNotFound.jsx`
- Create: `src/pages/LocalizedNotFound.test.jsx`

- [ ] **Step 1: Write failing provider tests**

  Render at `/`, `/en`, and `/en/about-us`. Assert `locale`, `language`,
  `t(key)`, localized path helpers, and `document.documentElement.lang`. Seed
  browser language and `localStorage.locale` with English and prove `/` still
  renders Portuguese. Assert changing history to an English URL updates the
  provider. Test `formatDate` and `formatNumber` with both locales. Register a
  dynamic post/case slug pair from a nested route consumer and assert
  `switchPath` uses it; unmount or navigate away and assert the registration is
  cleared so stale detail metadata cannot affect another route. Simulate a page
  transition and prove the provider keeps the old locale until
  `displayedLocation` commits, so the shell and page never show different
  languages during the curtain animation.

- [ ] **Step 2: Verify failure**

  Run: `npm test -- src/i18n/LocaleProvider.test.jsx src/App.test.jsx`

  Expected: FAIL because the provider does not exist and App has no English route
  graph.

- [ ] **Step 3: Implement provider and translation lookup**

  The provider reads `useTransitionLocation()`, derives locale from the route
  currently rendered by `PageTransition`, exposes `t`, `pathFor`, `switchPath`,
  `formatDate`, and `formatNumber`, and updates `<html lang>`. Do not read or
  write `localStorage`. Missing development keys throw with a clear key path;
  production returns the key path. Expose
  `registerDynamicAlternate({ kind, pathname, slugPt, slugEn })`, returning an
  unregister callback. Keep only the registration whose `pathname` matches the
  displayed detail route, and clear it on unregister or pathname change.

- [ ] **Step 4: Wrap the application inside the router**

  Mount `LocaleProvider` inside `PageTransition`'s
  `TransitionLocationContext.Provider` and wrap `AppRoutes` with it:

  ```jsx
  <PageTransition>
    <LocaleProvider>
      <AppRoutes />
    </LocaleProvider>
  </PageTransition>
  ```

  This keeps locale changes synchronized with `displayedLocation`, including
  delayed animated navigation.

- [ ] **Step 5: Add paired English routes**

  Route each English static path to the same page component as its Portuguese
  counterpart. Add English dynamic case and Inspire paths. Preserve all current
  Portuguese routes. Add a wildcard route that renders a catalogue-driven
  `LocalizedNotFound` page; test an unknown `/en/...` URL in English and an
  unknown Portuguese URL in Portuguese, including locale-correct recovery links.

- [ ] **Step 6: Run focused tests**

  Run: `npm test -- src/i18n/LocaleProvider.test.jsx src/App.test.jsx src/pages/LocalizedNotFound.test.jsx`

  Expected: PASS.

- [ ] **Step 7: Commit**

  ```bash
  git add src/i18n/LocaleProvider.jsx src/i18n/LocaleProvider.test.jsx src/App.jsx src/App.test.jsx src/pages/LocalizedNotFound.jsx src/pages/LocalizedNotFound.test.jsx
  git commit -m "feat: derive site locale from localized routes"
  ```

### Task 3: Reuse the language selector in both site shells

**Files:**
- Create: `src/components/LanguageSelector.jsx`
- Create: `src/components/LanguageSelector.test.jsx`
- Modify: `src/components/Header.jsx`
- Modify: `src/components/Header.test.jsx`
- Modify: `src/components/InspireLayout.jsx`
- Modify: `src/components/InspireLayout.test.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Write failing shared-selector tests**

  Assert the current flag/locale, accessible translated names, selected state,
  outside-click and Escape dismissal, and navigation from a Portuguese static
  route to its English pair. Test a translated dynamic slug and an untranslated
  post fallback to `/en/inspire` through provider registration. Navigate away
  after registration and prove the selector no longer uses the stale slug.
  Assert the Inspire top bar renders the same control.

- [ ] **Step 2: Verify failure**

  Run: `npm test -- src/components/LanguageSelector.test.jsx src/components/Header.test.jsx src/components/InspireLayout.test.jsx`

  Expected: FAIL because the selector is still private to `Header.jsx` and absent
  from Inspire.

- [ ] **Step 3: Extract the selector**

  Move the SVG flag components, supported-language list, menu semantics, and
  dismissal behavior into `LanguageSelector.jsx`. Accept a `variant` prop for
  main-header and Inspire styling. Read the current matching dynamic alternate
  registration from the locale provider and navigate using `switchPath`.

- [ ] **Step 4: Remove duplicated locale state from Header**

  Delete `getInitialLocale`, desktop `locale`, and `mobileLocale` state. Desktop
  and mobile controls both use the provider and localized labels. Ensure mobile
  switching closes the menu and navigates to the paired route.

- [ ] **Step 5: Add the compact selector to Inspire**

  Place it in `.inspire-shell__actions` beside the newsletter action. Add
  responsive CSS so the search and language control remain usable at 320, 390,
  768, and desktop widths.

- [ ] **Step 6: Run focused tests**

  Run: `npm test -- src/components/LanguageSelector.test.jsx src/components/Header.test.jsx src/components/InspireLayout.test.jsx`

  Expected: PASS.

- [ ] **Step 7: Commit**

  ```bash
  git add src/components/LanguageSelector.jsx src/components/LanguageSelector.test.jsx src/components/Header.jsx src/components/Header.test.jsx src/components/InspireLayout.jsx src/components/InspireLayout.test.jsx src/index.css
  git commit -m "feat: share language selector across site headers"
  ```

### Task 4: Translate the global shell and institutional pages

**Files:**
- Modify: `src/i18n/catalogs/pt-BR.js`
- Modify: `src/i18n/catalogs/en-US.js`
- Modify: `src/components/Header.jsx`
- Modify: `src/components/Footer.jsx`
- Modify: `src/components/Footer.test.jsx`
- Modify: `src/components/FeaturesSection.jsx`
- Modify: `src/components/TechnologySection.jsx`
- Modify: `src/components/ui/blog-highlights.jsx`
- Modify: `src/components/ui/featured-hero.jsx`
- Modify: `src/components/ui/filter-bar.jsx`
- Modify: `src/components/ui/project-card.jsx`
- Modify: `src/components/ui/stagger-testimonials.jsx`
- Modify: `src/pages/Home.jsx`
- Modify: `src/pages/Home.test.jsx`
- Modify: `src/pages/QuemSomos.jsx`
- Modify: `src/pages/QuemSomos.test.jsx`
- Modify: `src/pages/NossaAbordagem.jsx`
- Modify: `src/pages/NossaAbordagem.test.jsx`
- Modify: `src/pages/OQueFazemos.jsx`
- Modify: `src/pages/OQueFazemos.test.jsx`
- Modify: `src/pages/Tecnologia.jsx`
- Create: `src/pages/Tecnologia.test.jsx`
- Modify: `src/pages/AcademiaOtimiza.jsx`
- Create: `src/pages/AcademiaOtimiza.test.jsx`
- Modify: `src/pages/Contato.jsx`
- Modify: `src/pages/Contato.test.jsx`
- Modify: `src/components/ContactMap.jsx`
- Modify: `src/data/sitePages.js`

- [ ] **Step 1: Add failing English-route assertions page by page**

  For each page, render its Portuguese and English paths. Assert representative
  headings, body text, CTAs, accessible labels, footer/navigation links, form
  labels, validation messages, and success/error messages. Assert every internal
  English link stays below the correct English route.

- [ ] **Step 2: Run institutional tests and capture failures**

  Run: `npm test -- src/pages/Home.test.jsx src/pages/QuemSomos.test.jsx src/pages/NossaAbordagem.test.jsx src/pages/OQueFazemos.test.jsx src/pages/Tecnologia.test.jsx src/pages/AcademiaOtimiza.test.jsx src/pages/Contato.test.jsx src/components/Footer.test.jsx`

  Expected: FAIL because hardcoded Portuguese remains.

- [ ] **Step 3: Inventory and move user-visible copy**

  Replace every application-owned visible string and accessibility string in the
  listed components/pages with semantic catalogue lookups. Translate all page
  copy into reviewed English. Keep company/product names and contact data intact.
  Convert `sitePages` to locale-keyed data or remove it if it is unused after the
  catalogue migration.

- [ ] **Step 4: Localize navigation and form behavior**

  Use route IDs/path helpers for links. Localize contact input labels,
  placeholders, validation, submission status, map labels, and CTA copy without
  changing API payload field names.

- [ ] **Step 5: Run institutional tests**

  Run the command from Step 2 plus:
  `npm test -- src/components/FeaturesSection.test.jsx src/components/TechnologySection.test.jsx`

  Expected: PASS.

- [ ] **Step 6: Commit**

  ```bash
  git add src/i18n/catalogs src/components src/pages src/data/sitePages.js
  git commit -m "feat: translate institutional site experience"
  ```

### Task 5: Extend Sanity schemas for reviewed English editorial content

**Files:**
- Modify: `studio/schemaTypes/post.js`
- Modify: `studio/schemaTypes/post.test.js`
- Modify: `studio/schemaTypes/clientLogo.js`
- Modify: `studio/schemaTypes/clientLogo.test.js`
- Modify: `studio/schemaTypes/customerTestimonial.js`
- Modify: `studio/schemaTypes/customerTestimonial.test.js`

- [ ] **Step 1: Write failing schema tests**

  Assert English post fields `titleEn`, `slugEn`, `eyebrowEn`,
  `descriptionEn`, and `contentEn`; English case fields `sectorEn`,
  `logoAltEn`, `caseTitleEn`, `caseDescriptionEn`, `caseSlugEn`, and
  `caseContentEn`; and testimonial fields `roleEn`, `categoryEn`,
  `shortQuoteEn`, `detailedQuoteEn`, and `metricsEn` with translated `label`
  and `value`. Assert English validation becomes required as a group when any
  English editorial field is started. An English testimonial is publishable on
  Home only with `roleEn` and `shortQuoteEn`, and on Cases only with those fields
  plus `detailedQuoteEn` when `showOnCases` is true.

- [ ] **Step 2: Verify schema test failures**

  Run: `npm --prefix studio test -- --run`

  If the Studio has no test script, run:
  `npx vitest run studio/schemaTypes/post.test.js studio/schemaTypes/clientLogo.test.js studio/schemaTypes/customerTestimonial.test.js`

  Expected: FAIL because English fields do not exist.

- [ ] **Step 3: Add grouped English fields and validation**

  Preserve all existing Portuguese fields. Add English fields with Studio
  descriptions explaining that incomplete translations stay unpublished on the
  English site. Reuse the current Portable Text structure for `contentEn`,
  including English inline-image `alt` and `caption`. Preserve shared names,
  companies, avatars, visibility flags, and ordering. Add a complete `metricsEn`
  array because metric labels and human-readable values may both need translation.

- [ ] **Step 4: Run schema tests**

  Run the working command from Step 2.

  Expected: PASS.

- [ ] **Step 5: Commit**

  ```bash
  git add studio/schemaTypes
  git commit -m "feat: add reviewed English editorial fields"
  ```

### Task 6: Build locale-specific Sanity projections

**Files:**
- Create: `src/lib/localizedSanity.js`
- Create: `src/lib/localizedSanity.test.js`
- Modify: `src/lib/inspirePostCache.js`
- Modify: `src/lib/inspireSearch.js`
- Modify: `src/lib/blogFilters.js`
- Modify: `src/pages/Home.jsx`
- Modify: `src/pages/Home.test.jsx`
- Modify: `src/components/ui/blog-highlights.jsx`
- Modify: `src/components/ui/blog-highlights.test.jsx`
- Modify: `src/components/ui/stagger-testimonials.jsx`
- Modify: `src/components/ui/stagger-testimonials.test.jsx`

- [ ] **Step 1: Write failing query-builder tests**

  Assert Portuguese projections map existing fields to normalized names. Assert
  English projections alias English fields to the same normalized names, include
  completeness predicates, and retain `_id`, `slugPt`, and `slugEn` only as
  routing metadata. Assert every record exposes `hasEnglishTranslation`, computed
  from the complete required-field predicate, and that `slugEn` is projected as
  `null` unless that predicate is true. Test post feeds, category feeds, search, suggestions, detail,
  case lists, case detail, Home case highlights, Home Inspire posts, Home
  testimonials, and Cases testimonials. Assert
  English testimonial projections alias `roleEn`, `categoryEn`, `shortQuoteEn`,
  `detailedQuoteEn`, and `metricsEn` to normalized field names and apply the
  matching Home/Cases completeness predicate. Assert query parameters remain
  bound values.

- [ ] **Step 2: Verify failure**

  Run: `npm test -- src/lib/localizedSanity.test.js src/lib/inspireSearch.test.js src/lib/blogFilters.test.js src/pages/Home.test.jsx src/components/ui/blog-highlights.test.jsx src/components/ui/stagger-testimonials.test.jsx`

  Expected: FAIL because locale-aware builders do not exist.

- [ ] **Step 3: Implement centralized projections**

  Export small query builders rather than duplicating GROQ in pages. Apply the
  same English-publishable predicate everywhere, including separate Home and
  Cases testimonial predicates. Normalize category identifiers separately from
  translated display labels so filters remain stable. Reuse one exported
  completeness expression for English filtering, `hasEnglishTranslation`, and
  the conditional `slugEn` projection so routing and SEO cannot disagree about
  publication availability.

- [ ] **Step 4: Wire localized editorial queries into Home**

  Replace the inline Home case/logo/testimonial queries and the inline
  `blog-highlights.jsx` post query with the centralized builders. Pass the active
  locale to each fetch. In English, project only complete case highlights,
  Inspire posts, and testimonials; use English-only static fallbacks and never
  normalized Portuguese editorial fields.

- [ ] **Step 5: Key caches and search normalization by locale**

  Include locale in cache keys. Use locale-aware text folding and comparison.
  Preserve cached data for each locale, while request consumers ignore stale
  responses from a prior locale.

- [ ] **Step 6: Run focused tests**

  Run the command from Step 2.

  Expected: PASS.

- [ ] **Step 7: Commit**

  ```bash
  git add src/lib src/pages/Home.jsx src/pages/Home.test.jsx src/components/ui/blog-highlights.jsx src/components/ui/blog-highlights.test.jsx src/components/ui/stagger-testimonials.jsx src/components/ui/stagger-testimonials.test.jsx
  git commit -m "feat: add locale-aware editorial queries"
  ```

### Task 7: Localize the complete Inspire experience

**Files:**
- Modify: `src/i18n/catalogs/pt-BR.js`
- Modify: `src/i18n/catalogs/en-US.js`
- Modify: `src/components/InspireLayout.jsx`
- Modify: `src/components/InspireLayout.test.jsx`
- Modify: `src/components/InspireCursorTooltip.jsx`
- Modify: `src/components/InspireCursorTooltip.test.jsx`
- Modify: `src/components/InspireNewsletterSignup.jsx`
- Modify: `src/components/InspireNewsletterSignup.test.jsx`
- Modify: `src/components/InspireShareButton.jsx`
- Modify: `src/components/PostArticleContactPanel.jsx`
- Modify: `src/components/PostLikeButton.jsx`
- Modify: `src/pages/Inspire.jsx`
- Modify: `src/pages/Inspire.test.jsx`
- Modify: `src/pages/InspireNewsletter.jsx`
- Modify: `src/pages/InspireNewsletter.test.jsx`
- Modify: `src/pages/PostDetail.jsx`
- Modify: `src/pages/PostDetail.test.jsx`
- Modify: `src/data/blogPosts.js`

- [ ] **Step 1: Add failing English Inspire tests**

  Test localized shell labels, search placeholder/status/suggestions, categories,
  cards, dates, read-time labels, newsletter, sharing, likes, contact CTA, post
  detail, related posts, and not-found states. Mock mixed Sanity records and prove
  incomplete English posts never render in lists, search, suggestions, or direct
  details. Simulate a slow Portuguese request followed by English navigation and
  prove the Portuguese result cannot overwrite English state.

- [ ] **Step 2: Verify failures**

  Run: `npm test -- src/components/InspireLayout.test.jsx src/pages/Inspire.test.jsx src/pages/InspireNewsletter.test.jsx src/pages/PostDetail.test.jsx`

  Expected: FAIL due to Portuguese literals and non-localized GROQ.

- [ ] **Step 3: Replace page-local queries with localized query builders**

  Pass the active locale to every feed, category, search, suggestion, related,
  and detail fetch. Reset visible request state per locale and guard completions
  with a locale/request version.

- [ ] **Step 4: Translate the Inspire interface**

  Move all labels, categories, dates, accessibility copy, tooltip copy, and error
  states to the catalogues. Build links with locale-aware helpers. Format dates
  with `pt-BR` or `en-US`.

- [ ] **Step 5: Reshape static fallback posts**

  Preserve Portuguese fallback records and add English variants only where a
  complete reviewed translation exists. English mode never consumes a
  Portuguese fallback.

- [ ] **Step 6: Pass dynamic slug metadata to the selector**

  On post detail, call `registerDynamicAlternate` in an effect after normalized
  content loads, keyed to the current pathname, and run its unregister callback
  on slug/locale change or unmount. Register `slugEn` only when
  `hasEnglishTranslation` is true. Switching an untranslated Portuguese post
  targets `/en/inspire`; stale or partial metadata is never reused.

- [ ] **Step 7: Run focused tests**

  Run the command from Step 2 plus component tests for the share, like, cursor,
  newsletter, and contact-panel components.

  Expected: PASS.

- [ ] **Step 8: Commit**

  ```bash
  git add src/i18n/catalogs src/components src/pages/Inspire.jsx src/pages/Inspire.test.jsx src/pages/InspireNewsletter.jsx src/pages/InspireNewsletter.test.jsx src/pages/PostDetail.jsx src/pages/PostDetail.test.jsx src/data/blogPosts.js
  git commit -m "feat: localize Inspire content and search"
  ```

### Task 8: Localize case listings and details

**Files:**
- Modify: `src/i18n/catalogs/pt-BR.js`
- Modify: `src/i18n/catalogs/en-US.js`
- Modify: `src/pages/Cases.jsx`
- Modify: `src/pages/Cases.test.jsx`
- Modify: `src/pages/CaseDetail.jsx`
- Modify: `src/pages/CaseDetail.test.jsx`
- Modify: `src/data/caseStudies.js`
- Modify: `src/data/clientSectors.js`
- Modify: `src/data/homeCases.js`
- Modify: `src/data/homeCases.test.js`

- [ ] **Step 1: Add failing English case tests**

  Assert English headings, sectors, filters, cards, detail copy, side navigation,
  back links, dates/numbers if present, SEO content inputs, and localized links.
  Mock complete and incomplete English CMS cases and prove incomplete ones do not
  appear or open in English. Mock complete and incomplete English testimonials
  and prove only fully translated normalized testimonial projections render on
  English Home/Cases surfaces, with no Portuguese role, category, quote, or
  metric fallback.

- [ ] **Step 2: Verify failures**

  Run: `npm test -- src/pages/Cases.test.jsx src/pages/CaseDetail.test.jsx src/data/homeCases.test.js`

  Expected: FAIL.

- [ ] **Step 3: Use localized queries and data**

  Move case GROQ to `localizedSanity.js`. Normalize active-locale fields while
  keeping both slugs as routing metadata. Reshape static cases, sectors, and home
  highlights into explicit locale variants; do not use Portuguese fallbacks in
  English. Replace the inline Cases testimonial GROQ with the locale-specific
  testimonial builder and apply its English completeness predicate before
  rendering.

- [ ] **Step 4: Translate case UI and route links**

  Replace hardcoded headings, section labels, accessibility text, empty/not-found
  messages, back links, filters, CTA copy, and static sections with catalogue
  values. Route English links through `/en/case-studies`.

- [ ] **Step 5: Pass paired slugs to language switching**

  `CaseDetail` calls `registerDynamicAlternate` after loading normalized content
  and unregisters it on pathname/record change or unmount. It registers `slugEn`
  only when `hasEnglishTranslation` is true. A translated case switches directly
  between slugs; an untranslated Portuguese case switches to
  `/en/case-studies`, and stale or partial metadata is never reused.

- [ ] **Step 6: Run focused tests**

  Run the command from Step 2.

  Expected: PASS.

- [ ] **Step 7: Commit**

  ```bash
  git add src/i18n/catalogs src/pages/Cases.jsx src/pages/Cases.test.jsx src/pages/CaseDetail.jsx src/pages/CaseDetail.test.jsx src/data
  git commit -m "feat: localize case studies"
  ```

### Task 9: Make runtime and generated SEO bilingual

**Files:**
- Modify: `src/seo/siteMetadata.js`
- Modify: `src/seo/siteMetadata.test.js`
- Modify: `src/seo/SeoHead.jsx`
- Modify: `src/seo/SeoHead.test.jsx`
- Modify: `src/seo/structuredData.js`
- Modify: `src/seo/structuredData.test.js`
- Modify: `src/App.jsx`
- Modify: `src/pages/PostDetail.jsx`
- Modify: `src/pages/PostDetail.test.jsx`
- Modify: `src/pages/CaseDetail.jsx`
- Modify: `src/pages/CaseDetail.test.jsx`
- Modify: `scripts/generate-static-seo.mjs`
- Modify: `scripts/generate-static-seo.test.js`
- Modify: `scripts/generate-sitemap.mjs`
- Modify: `scripts/generate-sitemap.test.js`
- Modify: `index.html`

- [ ] **Step 1: Write failing bilingual SEO tests**

  Assert localized metadata and structured data, canonical URLs, `og:locale`,
  `og:locale:alternate`, and alternate links for `pt-BR`, `en-US`, and
  `x-default`. Assert untranslated dynamic content has no English alternate.
  Render translated and untranslated post/case details and assert their
  locale-specific canonical URL, paired alternate URLs, localized title and
  description, and omission of unavailable English alternates.
  Assert generated static HTML exists for every English static route and that
  the sitemap contains English routes only for complete English editorial
  records.

- [ ] **Step 2: Verify failures**

  Run: `npm test -- src/seo scripts/generate-static-seo.test.js scripts/generate-sitemap.test.js`

  Expected: FAIL because metadata and generators are Portuguese-only.

- [ ] **Step 3: Localize runtime metadata**

  Make `staticPageMetadata`, fallback titles/descriptions, route labels, and
  structured data locale-aware. Extend `SeoHead` to create/update/remove
  canonical, alternate, Open Graph locale, Twitter, and JSON-LD values without
  leaving stale tags during client navigation.

- [ ] **Step 4: Wire dynamic detail SEO**

  In `PostDetail.jsx` and `CaseDetail.jsx`, build the canonical URL from the
  active locale route and active slug. Use the normalized active-locale title
  and description. Pass paired alternate URLs only when the corresponding
  record has `hasEnglishTranslation === true`; never infer availability from a
  non-empty `slugEn` alone. Always use the Portuguese URL for `x-default` when it
  exists. Add article locale/URL data to structured data.

- [ ] **Step 5: Generate both static route sets**

  Replace Portuguese-only heading/section/link maps with locale-keyed build data
  derived from the catalogues and route pairs. Emit `/en/index.html`-compatible
  output paths for English routes while preserving current Vercel behavior.

- [ ] **Step 6: Generate bilingual sitemap entries**

  Add all static English routes and only fully translated dynamic English
  routes. If build-time Sanity fetching is configured, fetch public slug pairs
  with a bounded failure fallback; otherwise use reviewed static fallback
  records and never invent English routes.

- [ ] **Step 7: Run focused tests and production build**

  Run:

  ```bash
  npm test -- src/seo src/pages/PostDetail.test.jsx src/pages/CaseDetail.test.jsx scripts/generate-static-seo.test.js scripts/generate-sitemap.test.js
  npm run build
  ```

  Expected: PASS; the build produces localized static files, sitemap, and no
  missing translation-key errors.

- [ ] **Step 8: Commit**

  ```bash
  git add src/seo src/App.jsx src/pages/PostDetail.jsx src/pages/PostDetail.test.jsx src/pages/CaseDetail.jsx src/pages/CaseDetail.test.jsx scripts index.html
  git commit -m "feat: generate bilingual SEO metadata"
  ```

### Task 10: Complete translation audit and regression verification

**Files:**
- Create: `scripts/audit-translations.mjs`
- Create: `scripts/audit-translations.test.js`
- Modify: `package.json`
- Modify only when defects are found: files changed in Tasks 1-9

- [ ] **Step 1: Write a failing translation audit**

  The audit checks catalogue parity, unsupported raw locale literals,
  known Portuguese-only UI phrases outside the Portuguese catalogue, and
  locale-unaware internal route literals in translated components. Allowlist
  brand names, contact data, test fixtures, and Portuguese catalogue/data files.

- [ ] **Step 2: Add `npm run audit:translations` and make it pass**

  Run: `npm test -- scripts/audit-translations.test.js && npm run audit:translations`

  Expected: PASS with zero unallowlisted findings.

- [ ] **Step 3: Run the full automated suite**

  ```bash
  npm test
  npm run lint
  npm run build
  npm run audit:translations
  ```

  Expected: all commands exit 0.

- [ ] **Step 4: Perform browser verification**

  Start `npm run dev -- --host 127.0.0.1`. Verify every Portuguese/English static
  route plus representative translated and untranslated post/case routes at
  desktop, 768 px, 390 px, and 320 px. Confirm both selectors, focus/keyboard
  behavior, browser back/forward, direct URL reloads, search, newsletter and
  contact forms, long English copy, canonical/alternate tags, and no
  mixed-language interface.

- [ ] **Step 5: Review final diff**

  Confirm no existing unrelated workspace modifications were overwritten or
  staged. Note that English editorial records require reviewed content in Sanity
  before they become visible; the code intentionally hides incomplete records.

- [ ] **Step 6: Commit**

  ```bash
  git add scripts/audit-translations.mjs scripts/audit-translations.test.js package.json
  git add <only verified bilingual implementation fixes>
  git commit -m "test: audit bilingual site consistency"
  ```
