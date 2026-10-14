import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const configPath = resolve(process.cwd(), 'vercel.json');

describe('Vercel permalink rewrites', () => {
  it('serves dated posts through the live metadata function before the SPA fallback', async () => {
    const config = JSON.parse(await readFile(configPath, 'utf8'));
    const rewrites = config.rewrites;
    const fallbackIndex = rewrites.findIndex(
      ({ source }) => source === '/((?!api/).*)',
    );

    expect(fallbackIndex).toBeGreaterThanOrEqual(0);
    expect(rewrites).toContainEqual(expect.objectContaining({
      source: '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug',
      destination: '/api/post-page?slug=:slug&date=:year/:month/:day',
    }));
    expect(config.functions['api/post-page.js'].includeFiles).toBe('dist/post-shell.html');
    expect(rewrites.findIndex(({ source }) => source.startsWith('/:year'))).toBeLessThan(fallbackIndex);
    expect(rewrites.findIndex(({ source }) => source === '/inspire/newsletter')).toBeLessThan(rewrites.findIndex(({ source }) => source === '/inspire/:slug'));
    expect(rewrites.find(({ source }) => source === '/inspire/:slug').destination).toBe('/api/post-page?slug=:slug');
    expect(rewrites[fallbackIndex].destination).toBe('/index.html');
  });
});
