import { expect, test } from 'vitest';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { artwork, films } from '../lib/media';

test('all Runway uploads retain their recorded bytes and valid image dimensions', async () => {
  const manifest = JSON.parse(await readFile('public/assets/lbb/manifest.json', 'utf8'));
  expect(manifest.assets).toHaveLength(8);
  for (const asset of manifest.assets) {
    const bytes = await readFile(`public${asset.path}`);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(asset.sha256);
    expect(bytes.length).toBe(asset.bytes);
    if (asset.kind === 'image') {
      expect(bytes.subarray(1, 4).toString()).toBe('PNG');
      expect(bytes.readUInt32BE(16)).toBe(asset.width);
      expect(bytes.readUInt32BE(20)).toBe(asset.height);
    }
  }
});

test('every registered image and film points to an uploaded file', async () => {
  const manifest = JSON.parse(await readFile('public/assets/lbb/manifest.json', 'utf8'));
  const paths = manifest.assets.map((asset: { path: string }) => asset.path).sort();
  expect([...Object.values(artwork).map(a => a.src), ...Object.values(films)].sort()).toEqual(paths);
});
