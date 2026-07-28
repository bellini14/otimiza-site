# Home client logo carousel refresh

## Goal

Publish the 27 approved client brands in the home-page carousel, with consistent
perceived size, correct business sectors in Sanity, and no unapproved brands in
that carousel.

## Approved records

The `name`, sector, public brand and source file below are authoritative for this
change. The site URL is the brand's official public homepage.

| # | Sanity name | Public brand / alt text | Sector | Source file |
|---|---|---|---|---|
| 1 | AES Brasil | AES | Energia | `01-aes.png` |
| 2 | Banco Moneo S.A. | Banco Moneo | Bancos | `02-moneo.png` |
| 3 | Bebidas Fruki S.A. | Fruki Bebidas | Alimentos, Bebidas e Supermercados | `03-fruki.png` |
| 4 | Bontempo – Novatempo Franchising Ltda. | Bontempo | Móveis | `04-bontempo.png` |
| 5 | Brametal – Metalúrgica Brandão S.A. | Brametal | Indústria | `05-brametal.svg` |
| 6 | Cooperativa Santa Clara | Santa Clara | Alimentos, Bebidas e Supermercados | `06-santa-clara.png` |
| 7 | ENGIE Brasil Energia S.A. | ENGIE | Energia | `07-engie.svg` |
| 8 | Federação das Indústrias do RS (FIERGS) | FIERGS | Associações, Fundações e Órgãos Públicos | `08-fiergs.png` |
| 9 | Freios Controil Ltda. | Controil | Indústria | `09-controil.jpg` |
| 10 | Grendene S.A. | Grendene | Vestuário e Calçados | `10-grendene.png` |
| 11 | Irmãos Fischer S.A. Ind. e Com. | Fischer | Indústria | `11-fischer.svg` |
| 12 | Hacker Turbinas Elétricas | Hacker | Indústria | `12-hacker.webp` |
| 13 | Lojas Colombo S.A. | Lojas Colombo | Comércio e Distribuidoras | `13-colombo.svg` |
| 14 | Marcopolo S.A. | Marcopolo | Indústria | `14-marcopolo.svg` |
| 15 | Metalúrgica Siemsen | Skymsen | Indústria | `15-skymsen.png` |
| 16 | Moinho do Nordeste S.A. | Moinho do Nordeste | Alimentos, Bebidas e Supermercados | `16-moinho-nordeste.png` |
| 17 | Moinhos Galópolis S.A. | Roseflor | Alimentos, Bebidas e Supermercados | `17-roseflor.jpg` |
| 18 | Pisani Plásticos S.A. | Pisani | Indústria | `18-pisani.svg` |
| 19 | Roni da Silva Chaves | Roni Chaves | Comércio e Distribuidoras | `19-roni.png` |
| 20 | SCA Indústria de Móveis Ltda. | SCA | Móveis | `20-sca.svg` |
| 21 | SIM Rede de Postos – Ditrento Postos e Logística Ltda. | SIM Rede de Postos | Comércio e Distribuidoras | `21-sim.png` |
| 22 | Sulmaq Máquinas | Sulmaq | Indústria | `22-sulmaq.jpg` |
| 23 | Tesouro e Receita do Estado do RS | Tesouro do Estado RS | Associações, Fundações e Órgãos Públicos | `23-tesouro.png` |
| 24 | Unicasa Indústria de Móveis S.A. | Dell Anno | Móveis | `24-dellanno.svg` |
| 25 | Unimed Porto Alegre | Unimed Porto Alegre | Saúde | `25-unimed-poa.png` |
| 26 | Unimed Vales do Taquari e Rio Pardo | Unimed VTRP | Saúde | `26-unimed-vtrp.png` |
| 27 | Zen S.A. | ZEN | Indústria | `27-zen.png` |

## Asset treatment

- Preserve every logo's aspect ratio and approved visual identity.
- Remove excess transparent or near-white outer padding.
- Add horizontal transparent clear space equal to 8% of the trimmed mark's
  width and vertical clear space equal to 8% of its height, then export a
  lossless PNG with a maximum long edge of 1200 px. This proportional treatment
  keeps very wide wordmarks from becoming artificially small. Use a 2 px
  minimum before resizing so very thin source files retain clear space.
- The non-transparent visible bounding box must occupy at least 82% of one
  canvas dimension. This is checked by script for every output.
- The existing frontend display box (`max-width` 8.5rem and `max-height`
  2.25rem on desktop) then sizes wide logos by width and compact logos by
  height, producing comparable perceived size without distortion.
- Where an official asset is white-only, change only its solid white color to a
  dark neutral. Do not redraw, reshape or rearrange any mark.
- Compare a contact sheet of normalized assets against the user-approved source
  contact sheet before publishing.

## Sanity synchronization

- Upload the normalized files as image assets.
- Reuse an existing document when its normalized name or known public-brand
  alias matches. Otherwise create a deterministic `home-client-<slug>` ID.
- Before mutation, fail if more than one existing document matches an approved
  record. After mutation, fail if the 27 active home records do not have unique
  IDs and unique normalized public-brand names.
- Upsert one `clientLogo` document per approved brand.
- Populate `name`, `sector`, `logo`, `logoAlt`, `website`, `sortOrder`,
  `isVisible: true`, and `showOnHome: true`.
- Preserve unrelated case content on existing documents.
- Set `showOnHome: false` on every other `clientLogo` document rather than
  deleting it or hiding it elsewhere on the site.
- Preserve each official website already present in Sanity. For new records,
  use the official homepage verified during asset research; omit the field
  rather than guessing when no official homepage can be verified.

## Frontend behavior

- Keep the existing two-row marquee and its responsive card dimensions.
- Replace the fallback collection with the same 27 approved records so a blocked
  Sanity request cannot restore old brands.
- Continue using the existing grayscale-to-color hover treatment.

## Validation and release

- Add a regression test asserting the fallback contains all and only the 27
  approved brands.
- Verify the normalization output dimensions and visible bounding boxes.
- Query Sanity after mutation and assert exactly 27 unique records in order
  1–27, each with the expected sector, defined asset and `showOnHome: true`.
- Run the focused tests, full test suite, lint, and production build.
- Inspect the home page at desktop and mobile widths.
- Deploy the verified build to the linked Vercel production project and confirm
  the production carousel has the same 27 unique brands and none of the
  previously selected brands that are outside the approved list.
