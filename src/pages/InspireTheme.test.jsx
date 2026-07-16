import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const indexCss = fs.readFileSync(path.resolve('src/index.css'), 'utf8')
const postDetailSource = fs.readFileSync(path.resolve('src/pages/PostDetail.jsx'), 'utf8')

describe('Inspire theme text color', () => {
  it('uses a single shared ink color across Inspire text rules', () => {
    const inspireSection = indexCss.match(/Inspire Editorial Shell[\s\S]*?@keyframes inspire-spin/)

    expect(inspireSection).not.toBeNull()
    expect(indexCss).toMatch(/--inspire-text:\s*#5a6572;/i)
    expect(inspireSection[0]).not.toMatch(/(?:^|\n)\s*color:\s*#(?!5a6572\b)[0-9a-f]{3,8}/im)
    expect(inspireSection[0]).not.toMatch(/(?:^|\n)\s*color:\s*rgb\(/i)
  })

  it('does not hardcode alternate text colors in the Inspire post detail view', () => {
    expect(postDetailSource).not.toMatch(/text-white|text-brand-red|text-slate-\d+/)
    expect(postDetailSource).not.toMatch(/text-\[#(?!5A6572\])/i)
  })

  it('reveals and dismisses the article contact panel with accessible smooth animations', () => {
    expect(indexCss).toMatch(/\.post-detail__sidebar-actions-row\s*\{[^}]*column-gap:\s*0\.5rem;[^}]*row-gap:\s*0;/s)
    expect(indexCss).toMatch(/\.post-detail__contact-panel-shell\s*\{[^}]*display:\s*grid;[^}]*grid-template-rows:\s*0fr;[^}]*transition:\s*grid-template-rows\s+340ms[^;]+;/s)
    expect(indexCss).toMatch(/\.post-detail__contact-panel-shell--open\s*\{[^}]*grid-template-rows:\s*1fr;/s)
    expect(indexCss).toMatch(/\.post-detail__contact-panel\s*\{[^}]*opacity:\s*0;[^}]*transition:\s*opacity\s+140ms[^;]+;/s)
    expect(indexCss).toMatch(/\.post-detail__contact-panel-shell--open\s+\.post-detail__contact-panel\s*\{[^}]*opacity:\s*1;[^}]*transition:\s*opacity\s+180ms\s+ease\s+340ms;/s)
    expect(indexCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.post-detail__contact-panel-shell,[\s\S]*?\.post-detail__contact-panel\s*\{[^}]*transition:\s*none;/s)
  })

  it('visually separates the current article context inside the contact panel', () => {
    expect(indexCss).toMatch(/\.post-detail__contact-context\s*\{[^}]*padding:\s*0\.75rem\s+0\.85rem;[^}]*border-left:\s*2px solid var\(--inspire-text\);[^}]*background:\s*var\(--inspire-button-surface\);/s)
    expect(indexCss).toMatch(/\.post-detail__contact-article-title\s*\{[^}]*display:\s*-webkit-box;[^}]*-webkit-line-clamp:\s*2;/s)
    expect(indexCss).toMatch(/\.post-detail__contact-status--success\s*\{[^}]*font-weight:\s*500;/s)
  })

  it('aligns the post actions with the back link and keeps their lower spacing compact', () => {
    expect(indexCss).toMatch(/\.post-detail__sidebar\s*\{[^}]*padding:\s*2\.5rem\s+0\s+0\s+2\.4rem;/s)
    expect(indexCss).toMatch(/\.post-detail__sidebar-actions\s*\{[^}]*margin-bottom:\s*1\.75rem;[^}]*padding-bottom:\s*1\.5rem;/s)
    expect(indexCss).toMatch(/\.post-detail__contact-panel-shell\s*\{[^}]*overflow:\s*hidden;/s)
    expect(indexCss).toMatch(/\.post-detail__contact-panel-content\s*\{[^}]*margin-top:\s*1\.15rem;[^}]*padding-top:\s*1\.35rem;[^}]*border-top:\s*1px solid #ececec;/s)
  })

  it('contains the feed and article thumbnails inside the available width', () => {
    expect(indexCss).toMatch(/\.inspire-page__feed\s*\{[^}]*min-width:\s*0;[^}]*max-width:\s*100%;/s)
    expect(indexCss).toMatch(/\.inspire-story__thumb-link\s*\{[^}]*min-width:\s*0;[^}]*max-width:\s*100%;/s)
  })

  it('lays out the mobile filters in two rows without widening the page', () => {
    const inspireStart = indexCss.indexOf('Inspire Editorial Shell')
    const mobileStart = indexCss.indexOf('@media (max-width: 720px)', inspireStart)
    const mobileEnd = indexCss.indexOf('@keyframes inspire-spin', mobileStart)
    const mobileCss = indexCss.slice(mobileStart, mobileEnd)
    const compactStart = mobileCss.indexOf('@media (max-width: 380px)')
    const compactCss = mobileCss.slice(compactStart)

    expect(mobileCss).toMatch(/\.inspire-page__grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/s)
    expect(mobileCss).toMatch(/\.inspire-page__tabs\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1\.25fr\)\s+minmax\(0,\s*1fr\);[^}]*overflow-x:\s*visible;/s)
    expect(mobileCss).toMatch(/\.inspire-page__tab\s*\{[^}]*font-size:\s*0\.9rem;[^}]*white-space:\s*nowrap;/s)
    expect(compactStart).toBeGreaterThan(-1)
    expect(compactCss).toMatch(/\.inspire-page__tabs\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/s)
    expect(mobileCss).toMatch(/\.inspire-story\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+5\.75rem;[^}]*gap:\s*0\.75rem;/s)
  })

  it('highlights article category labels with a yellow strip', () => {
    expect(indexCss).toMatch(/\.inspire-category-label\s*\{[^}]*width:\s*fit-content;[^}]*padding:[^;]+;[^}]*background:\s*#fff176;[^}]*font-size:\s*0\.92rem;[^}]*font-weight:\s*400;[^}]*letter-spacing:\s*normal;[^}]*text-transform:\s*none;/s)
  })

  it('keeps the sidebar newsletter flat and uses an underline-only Elza form field', () => {
    expect(indexCss).toMatch(/\.inspire-sidebar__newsletter\s*\{[^}]*font-family:\s*"elza",\s*sans-serif;[^}]*border:\s*0;[^}]*background:\s*transparent;/s)
    expect(indexCss).toMatch(/\.inspire-sidebar__newsletter-input\s*\{[^}]*border:\s*0;[^}]*border-bottom:\s*1px solid[^;]+;[^}]*background:\s*transparent;/s)
    expect(indexCss).not.toMatch(/\.inspire-sidebar__newsletter(?:-input|-submit)?[^}]*box-shadow:/s)
  })

  it('uses three equal columns and one shared button treatment for post sidebar actions', () => {
    expect(indexCss).toMatch(/\.post-detail__sidebar-actions-row\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/s)
    expect(indexCss).toMatch(/\.post-detail__sidebar-action-control\s*\{[^}]*width:\s*100%;[^}]*min-height:\s*2\.7rem;[^}]*border-radius:\s*999px;[^}]*background:\s*var\(--inspire-button-surface\);/s)
  })

  it('uses the same subtle gray for the background and border of every sidebar button', () => {
    expect(indexCss).toMatch(/--inspire-button-surface:\s*#eef1f3;/i)
    expect(indexCss).toMatch(/\.post-detail__sidebar-action-control\s*\{[^}]*border:\s*1px solid var\(--inspire-button-surface\);[^}]*background:\s*var\(--inspire-button-surface\);/s)
    expect(indexCss).toMatch(/\.post-detail__contact-footer button\s*\{[^}]*border:\s*1px solid var\(--inspire-button-surface\);[^}]*background:\s*var\(--inspire-button-surface\);/s)
    expect(indexCss).toMatch(/\.inspire-sidebar__newsletter-submit\s*\{[^}]*border:\s*1px solid var\(--inspire-button-surface\);[^}]*background:\s*var\(--inspire-button-surface\);/s)
  })

  it('extends the shared gray surface to every Inspire action button', () => {
    expect(indexCss).toMatch(/\.inspire-shell \.post-like-button\s*\{[^}]*border-color:\s*var\(--inspire-button-surface\);[^}]*background:\s*var\(--inspire-button-surface\);/s)
    expect(indexCss).toMatch(/\.inspire-story__action-button\s*\{[^}]*border:\s*1px solid var\(--inspire-button-surface\);[^}]*background:\s*var\(--inspire-button-surface\);/s)
    expect(indexCss).toMatch(/\.inspire-shell__app-pill\s*\{[^}]*background:\s*#fff(?:fff)?;/si)
    expect(indexCss).toMatch(/\.inspire-newsletter__submit\s*\{[^}]*border:\s*1px solid var\(--inspire-button-surface\);[^}]*background:\s*var\(--inspire-button-surface\);/s)
  })

  it('gives the like action a short pulse and halo without shifting its layout', () => {
    expect(indexCss).toMatch(/\.post-like-button__icon\s*\{[^}]*position:\s*relative;[^}]*z-index:\s*1;/s)
    expect(indexCss).toMatch(/\.post-like-button__icon-shell::after\s*\{[^}]*z-index:\s*0;/s)
    expect(indexCss).toMatch(/\.post-like-button--feedback\s+\.post-like-button__icon-shell::after\s*\{[^}]*animation:\s*post-like-halo\s+360ms\s+cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\);/s)
    expect(indexCss).toMatch(/@keyframes\s+post-like-halo\s*\{[\s\S]*?from\s*\{[^}]*opacity:\s*0\.35;[^}]*transform:\s*scale\(0\.5\);[\s\S]*?to\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*scale\(1\.65\);/s)
    expect(indexCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.post-like-button__icon--popping,[\s\S]*?\.post-like-button--feedback\s+\.post-like-button__icon-shell::after\s*\{[^}]*animation:\s*none;/s)
  })

  it('keeps the desktop menu and sidebar fixed while only the left column scrolls', () => {
    expect(indexCss).toMatch(/@media\s*\(min-width:\s*1101px\)[\s\S]*?\.inspire-shell:has\(\.inspire-page\),[\s\S]*?\.inspire-shell:has\(\.post-detail\)\s*\{[^}]*display:\s*flex;[^}]*height:\s*100dvh;[^}]*overflow:\s*hidden;/s)
    expect(indexCss).toMatch(/\.inspire-shell__main:has\(\.inspire-page\),[\s\S]*?\.inspire-shell__main:has\(\.post-detail\)\s*\{[^}]*flex:\s*1;[^}]*min-height:\s*0;[^}]*overflow:\s*hidden;/s)
    expect(indexCss).toMatch(/\.inspire-page__feed,[\s\S]*?\.post-detail__main\s*\{[^}]*min-height:\s*0;[^}]*overflow-y:\s*auto;[^}]*overscroll-behavior:\s*contain;/s)
    expect(indexCss).toMatch(/\.inspire-sidebar,[\s\S]*?\.post-detail__sidebar\s*\{[^}]*position:\s*static;[^}]*height:\s*100%;[^}]*overflow-y:\s*auto;/s)
  })

  it('clips the Inspire columns directly below the desktop menu', () => {
    expect(indexCss).toMatch(/@media\s*\(min-width:\s*1101px\)[\s\S]*?\.inspire-page\s*\{[^}]*padding-top:\s*0;/s)
    expect(indexCss).toMatch(/\.inspire-page__feed\s*\{[^}]*padding-top:\s*1\.2rem;/s)
    expect(indexCss).toMatch(/\.inspire-sidebar\s*\{[^}]*padding-top:\s*1\.55rem;/s)
  })

  it('uses a thin minimal scrollbar for the fixed-layout columns', () => {
    expect(indexCss).toMatch(/\.inspire-page__feed,[\s\S]*?\.post-detail__main,[\s\S]*?\.inspire-sidebar,[\s\S]*?\.post-detail__sidebar\s*\{[^}]*scrollbar-width:\s*thin;[^}]*scrollbar-color:\s*rgb\(90 101 114 \/ 0\.22\) transparent;/s)
    expect(indexCss).toMatch(/:is\([^)]+\)::-webkit-scrollbar\s*\{[^}]*width:\s*5px;/s)
    expect(indexCss).toMatch(/:is\([^)]+\)::-webkit-scrollbar-thumb\s*\{[^}]*border-radius:\s*999px;[^}]*background:\s*rgb\(90 101 114 \/ 0\.22\);/s)
  })

  it('uses the shared light gray on the Inspire menu', () => {
    expect(indexCss).toMatch(/\.inspire-shell__topbar\s*\{[^}]*background:\s*#eef1f3;/si)
  })

  it('animates only the changing Inspire content column', () => {
    expect(indexCss).toMatch(/\.inspire-transition-route\s+:is\(\s*\.inspire-page__feed,\s*\.inspire-newsletter\s*\)\s*\{[^}]*animation:\s*inspire-content-enter\s+360ms\s+cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)\s+both;/s)
    expect(indexCss).toMatch(/@keyframes\s+inspire-content-enter\s*\{[\s\S]*?from\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translate3d\(0,\s*12px,\s*0\);[\s\S]*?to\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*translate3d\(0,\s*0,\s*0\);/s)
    expect(indexCss).toMatch(/\.inspire-transition-route\s+\.post-detail__content--ready\s*\{[^}]*animation:\s*inspire-post-content-enter\s+460ms\s+cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)\s+both;[^}]*will-change:\s*opacity,\s*transform;/s)
    expect(indexCss).toMatch(/@keyframes\s+inspire-post-content-enter\s*\{[\s\S]*?from\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translate3d\(0,\s*10px,\s*0\);[\s\S]*?to\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*translate3d\(0,\s*0,\s*0\);/s)
    expect(indexCss).not.toMatch(/\.inspire-transition-route\s+\.post-detail__main\s*\{[^}]*animation:/s)
    expect(indexCss).not.toMatch(/\.inspire-transition-route\s+\.inspire-sidebar\s*\{[^}]*animation:/s)
    expect(indexCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.inspire-transition-route\s+:is\([^)]*\.inspire-page__feed[^)]*\.post-detail__content[^)]*\)\s*\{[^}]*animation:\s*none;/s)
  })

  it('reserves the post action space and softly reveals the buttons', () => {
    expect(indexCss).toMatch(/\.post-detail__sidebar-actions-placeholder\s*\{[^}]*min-height:\s*2\.7rem;/s)
    expect(indexCss).toMatch(/\.post-detail__sidebar-actions-row--enter\s*\{[^}]*animation:\s*inspire-post-actions-enter\s+320ms\s+cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\);/s)
    expect(indexCss).not.toMatch(/\.post-detail__sidebar-actions-row--enter\s*\{[^}]*(?:will-change|animation:[^;]*\bboth\b)/s)
    expect(indexCss).toMatch(/@keyframes\s+inspire-post-actions-enter\s*\{[\s\S]*?from\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translate3d\(0,\s*8px,\s*0\);[\s\S]*?to\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*none;/s)
    expect(indexCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.post-detail__sidebar-actions-row--enter\s*\{[^}]*animation:\s*none;/s)
  })

  it('moves the shared newsletter smoothly between the feed and post positions', () => {
    expect(indexCss).toMatch(/\.inspire-transition-route\s+\.post-detail__sidebar\s+\.inspire-sidebar__newsletter\s*\{[^}]*animation:\s*inspire-sidebar-newsletter-enter-post\s+360ms\s+cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\);/s)
    expect(indexCss).toMatch(/\.inspire-transition-route\s+\.inspire-sidebar\s+\.inspire-sidebar__newsletter\s*\{[^}]*animation:\s*inspire-sidebar-newsletter-enter-feed\s+360ms\s+cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\);/s)
    expect(indexCss).not.toMatch(/\.inspire-transition-route\s+:(?:is\([^)]*\)|[^\s]+)[^{]*\.inspire-sidebar__newsletter\s*\{[^}]*(?:will-change|animation:[^;]*\bboth\b)/s)
    expect(indexCss).toMatch(/@keyframes\s+inspire-sidebar-newsletter-enter-post\s*\{[\s\S]*?from\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translate3d\(0,\s*-6\.9rem,\s*0\);[\s\S]*?to\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*none;/s)
    expect(indexCss).toMatch(/@keyframes\s+inspire-sidebar-newsletter-enter-feed\s*\{[\s\S]*?from\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translate3d\(0,\s*6\.9rem,\s*0\);[\s\S]*?to\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*none;/s)
    expect(indexCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.inspire-sidebar__newsletter\s*\{[^}]*animation:\s*none;/s)
  })

  it('uses a dark translucent tooltip that follows the pointer', () => {
    expect(indexCss).toMatch(/\.inspire-cursor-tooltip\s*\{[^}]*position:\s*fixed;[^}]*background:\s*rgb\(23 29 35 \/ 0\.72\);[^}]*pointer-events:\s*none;/s)
    expect(indexCss).toMatch(/\.inspire-cursor-tooltip\s*\{[^}]*transition:\s*opacity\s+120ms\s+ease;/s)
    expect(indexCss).toMatch(/\.inspire-cursor-tooltip--enter\s*\{[^}]*animation:\s*inspire-tooltip-enter\s+140ms\s+cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)\s+both;/s)
    expect(indexCss).toMatch(/\.inspire-cursor-tooltip--exit\s*\{[^}]*animation:\s*inspire-tooltip-exit\s+110ms\s+ease-in\s+both;/s)
    expect(indexCss).toMatch(/@keyframes\s+inspire-tooltip-exit\s*\{[\s\S]*?from\s*\{[^}]*opacity:\s*1;[^}]*scale:\s*1;[\s\S]*?to\s*\{[^}]*opacity:\s*0;[^}]*scale:\s*0\.96;/s)
  })

  it('styles the instant search suggestions as a minimal anchored panel', () => {
    expect(indexCss).toMatch(/\.inspire-search-suggestions\s*\{[^}]*position:\s*absolute;[^}]*top:\s*calc\(100% \+ 0\.55rem\);[^}]*z-index:\s*70;[^}]*background:\s*#fff(?:fff)?;/s)
    expect(indexCss).toMatch(/\.inspire-search-suggestion\.is-active\s*\{[^}]*background:\s*#eef1f3;/s)
    expect(indexCss).toMatch(/@keyframes\s+inspire-search-suggestions-enter\s*\{[\s\S]*?from\s*\{[^}]*opacity:\s*0;[^}]*translate:\s*0 -0\.35rem;[\s\S]*?to\s*\{[^}]*opacity:\s*1;[^}]*translate:\s*0 0;/s)
  })

})
