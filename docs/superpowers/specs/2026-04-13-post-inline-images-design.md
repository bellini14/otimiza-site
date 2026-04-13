# Post Inline Images Design

## Context

The Sanity schema for `post.content` currently accepts only text blocks.
This prevents editors from placing images inside the article body and forces imported WordPress posts to lose their inline visual structure.
The frontend detail page also renders `PortableText` without custom support for image blocks, so even if images were stored inline they would not display correctly.

## Approved Direction

- Allow inline images inside `post.content` in the Sanity Studio editor.
- Render inline images in the blog post detail page.
- Update the WordPress import script so content images can be preserved as real Portable Text image blocks.
- Keep the existing `mainImage` field as the hero image for cards and post headers.

## Proposed Design

`post.content` will become a Portable Text array that accepts:

- text `block`
- inline body `image`

The body image object will include:

- `alt` text for accessibility
- optional caption for editorial context
- Sanity hotspot support so editors can crop responsibly when needed

This keeps the editing model aligned with Sanity's native rich-content workflow instead of introducing a separate gallery or raw HTML field.

## Studio Model

The `post` schema in `studio/schemaTypes/post.js` will update the `content` field so its `of` array contains both block content and an image object definition.
Editors will then be able to insert images directly between paragraphs from the Sanity Portable Text editor toolbar.

The image definition should be small and focused:

- `type: image`
- `options.hotspot: true`
- `fields: alt, caption`

This gives authors enough control for article imagery without creating an over-modeled content system.

## Frontend Rendering

`src/pages/PostDetail.jsx` will define custom `PortableText` components for inline images.
The renderer will:

- output the image using the existing Sanity image builder
- use `alt` text when present, otherwise fall back to the post title
- optionally render the caption under the image
- preserve the current article typography and spacing

The header `mainImage` remains separate from the body content so cards, blog listings, and article hero sections continue to work unchanged.

## Import Behavior

`studio/scripts/import-wordpress-posts.mjs` currently strips body images before converting HTML to Portable Text.
It will be updated so image tags become inline body image blocks in the Portable Text output.

Import rules:

- download reachable image URLs and upload them as Sanity assets
- create an image block at the same approximate position in the article flow
- carry over `alt` text when available
- continue importing the post even if an image download fails

If a source image no longer exists, the text content still imports and the failing image is skipped with a warning.

## Testing

Add focused tests for:

- the `post` schema allowing image blocks inside `content`
- the post detail page rendering inline body images and captions

This covers both the Studio editing capability and the site behavior that depends on it.
