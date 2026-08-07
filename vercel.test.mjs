import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const configPath = resolve(process.cwd(), 'vercel.json');

describe('Vercel permalink rewrites', () => {
  it('serves dated Inspire posts from their generated static preview before the SPA fallback', async () => {
    const config = JSON.parse(await readFile(configPath, 'utf8'));
    const rewrites = config.rewrites;
    const fallbackIndex = rewrites.findIndex(
      ({ source }) => source === '/((?!api/).*)',
    );
    const postRewriteIndex = rewrites.findIndex(
      ({ source }) =>
        source === '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug',
    );

    expect(fallbackIndex).toBeGreaterThanOrEqual(0);
    expect(postRewriteIndex).toBeGreaterThanOrEqual(0);
    expect(postRewriteIndex).toBeLessThan(fallbackIndex);

    const postRewrite = rewrites[postRewriteIndex];
    expect(postRewrite.destination).toBe(
      '/:year/:month/:day/:slug/index.html',
    );

    const matcher = /^\/\d{4}\/\d{2}\/\d{2}\/[^/]+$/;

    expect(matcher.test('/2026/08/07/inspire-sem-titulo')).toBe(true);
    expect(matcher.test('/ano/08/07/inspire-sem-titulo')).toBe(false);
    expect(matcher.test('/api/posts/x/likes')).toBe(false);
    expect(matcher.test('/inspire/slug')).toBe(false);
  });
});
