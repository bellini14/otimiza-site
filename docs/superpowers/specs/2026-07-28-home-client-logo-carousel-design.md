# Home client logo carousel refresh

## Goal

Publish the 27 approved client brands in the home-page carousel, with consistent
perceived size, correct business sectors in Sanity, and no unapproved brands in
that carousel.

## Approved brands

AES Brasil; Banco Moneo; Bebidas Fruki; Bontempo; Brametal; Cooperativa Santa
Clara; ENGIE Brasil Energia; FIERGS; Freios Controil; Grendene; Irmãos Fischer;
Hacker Turbinas Elétricas; Lojas Colombo; Marcopolo; Metalúrgica Siemsen
(Skymsen); Moinho do Nordeste; Moinhos Galópolis (Roseflor); Pisani Plásticos;
Roni da Silva Chaves; SCA; SIM Rede de Postos; Sulmaq; Tesouro e Receita do
Estado do RS; Unicasa (Dell Anno); Unimed Porto Alegre; Unimed VTRP; Zen.

## Asset treatment

- Preserve every logo's aspect ratio and approved visual identity.
- Remove excess transparent or white padding.
- Place each mark on a transparent 1200 × 420 px canvas.
- Fit the visible mark into a shared optical area, with orientation-aware limits
  so compact and horizontal marks have comparable perceived size.
- Keep enough clear space around each mark and export lossless PNG files.
- Where an official asset is white-only, create a dark monochrome rendering so
  it remains visible on the carousel's white cards.
- Review a contact sheet of the normalized assets before publishing.

## Sanity synchronization

- Upload the normalized files as image assets.
- Upsert one `clientLogo` document per approved brand.
- Populate `name`, `sector`, `logo`, `logoAlt`, `website`, `sortOrder`,
  `isVisible: true`, and `showOnHome: true`.
- Preserve unrelated case content on existing documents.
- Set `showOnHome: false` on every other `clientLogo` document rather than
  deleting it or hiding it elsewhere on the site.

## Frontend behavior

- Keep the existing two-row marquee and its responsive card dimensions.
- Replace the fallback collection with the same 27 approved records so a blocked
  Sanity request cannot restore old brands.
- Continue using the existing grayscale-to-color hover treatment.

## Validation and release

- Add a regression test asserting the fallback contains all and only the 27
  approved brands.
- Verify the normalization output dimensions and visible bounding boxes.
- Run the focused tests, full test suite, lint, and production build.
- Inspect the home page at desktop and mobile widths.
- Deploy the verified build to the linked Vercel production project and confirm
  the production carousel.

