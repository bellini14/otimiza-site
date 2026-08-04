# Sanity CORS origins

## Goal

Allow the production website to read the Sanity project from both canonical HTTPS host variants.

## Design

Add these exact origins to Sanity project `igy822g7`:

- `https://otm.com.br`
- `https://www.otm.com.br`

Do not enable credentialed requests. Avoid wildcard origins and do not change application code or dataset configuration.

## Verification

List the project's configured CORS origins after the change and confirm both exact origins are present with credentials disabled.
