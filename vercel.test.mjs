import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const configPath = resolve(process.cwd(), 'vercel.json');

describe('Vercel permalink rewrites', () => {
  it('lets generated static dated post pages take filesystem precedence and sends missing posts to the SPA fallback', async () => {
    const config = JSON.parse(await readFile(configPath, 'utf8'));
    const rewrites = config.rewrites;
    const fallbackIndex = rewrites.findIndex(
      ({ source }) => source === '/((?!api/).*)',
    );

    expect(fallbackIndex).toBeGreaterThanOrEqual(0);
    expect(rewrites).not.toContainEqual(expect.objectContaining({
      source: '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug',
    }));
    expect(rewrites[fallbackIndex].destination).toBe('/index.html');
  });
});
