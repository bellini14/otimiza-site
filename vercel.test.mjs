import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const configPath = resolve(process.cwd(), 'vercel.json');

describe('Vercel permalink rewrites', () => {
  it('routes shared article URLs with a trailing slash or legacy index.html to live metadata', async () => {
    const config = JSON.parse(await readFile(configPath, 'utf8'));
    const dated = '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug';
    const fallback = config.rewrites.findIndex(({ source }) => source === '/((?!api/).*)');
    for (const source of [`${dated}/`, '/inspire/:slug/']) {
      const index = config.rewrites.findIndex((route) => route.source === source);
      expect(index, `Missing live route for ${source}`).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(fallback);
      expect(config.rewrites[index].destination).toBe(source.startsWith('/inspire')
        ? '/api/post-page?slug=:slug'
        : '/api/post-page?slug=:slug&date=:year/:month/:day');
    }
    expect(config.redirects).toContainEqual({
      source: `${dated}/index.html`,
      destination: '/:year/:month/:day/:slug',
      permanent: true,
    });
    expect(config.rewrites.findIndex(({ source }) => source === '/inspire/newsletter/')).toBeLessThan(
      config.rewrites.findIndex(({ source }) => source === '/inspire/:slug/'),
    );
  });
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
