import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('uploaded media URLs are served, including byte-range video playback', async ({ request }) => {
  const manifest = JSON.parse(await readFile('public/assets/lbb/manifest.json', 'utf8'));
  for (const asset of manifest.assets) {
    const response = await request.head(asset.path);
    expect(response.status()).toBe(200);
    expect(Number(response.headers()['content-length'])).toBe(asset.bytes);
    expect(response.headers()['content-type']).toContain(asset.kind === 'video' ? 'video/mp4' : 'image/png');
  }
  const range = await request.get('/assets/lbb/videos/butterfly-opening.mp4', { headers: { Range: 'bytes=0-1023' } });
  expect(range.status()).toBe(206);
  expect((await range.body()).length).toBe(1024);
});

test('butterfly and Cart films decode, play, and leave the composer usable', async ({ page }) => {
  await page.goto('/');
  const opening = page.getByRole('group', { name: 'opening animation', exact: true });
  await expect(opening.locator('video')).toBeVisible();
  await expect.poll(() => opening.locator('video').evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0);
  await expect(page.getByLabel('Message the Exhibit Cart', { exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Play Exhibit Cart animation', exact: true }).click();
  const cart = page.getByRole('group', { name: 'Exhibit Cart animation', exact: true });
  await expect.poll(() => cart.locator('video').evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0);
  await expect.poll(() => cart.locator('video').evaluate((video: HTMLVideoElement) => video.videoWidth)).toBe(960);
  await page.getByRole('button', { name: 'Pause Exhibit Cart animation', exact: true }).click();
  await expect.poll(() => cart.locator('video').evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);
  await page.getByLabel('Message the Exhibit Cart', { exact: true }).fill('The artwork leaves this conversation available.');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByRole('article', { name: 'Your message', exact: true })).toContainText('conversation available');
});

test('reduced motion loads stills without automatically fetching videos and permits explicit playback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); const videoRequests: string[] = [];
  page.on('request', r => { if (r.url().endsWith('.mp4')) videoRequests.push(r.url()); });
  await page.goto('/'); const opening = page.getByRole('group', { name: 'opening animation', exact: true });
  await expect(opening).toHaveAttribute('data-motion-preference', 'reduced');
  await expect(opening.locator('img')).toBeVisible();
  await expect(opening.locator('video')).toHaveCount(0);
  expect(videoRequests).toEqual([]);
  await page.getByRole('button', { name: 'Play opening animation', exact: true }).click();
  await expect.poll(() => opening.locator('video').evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0);
});

test('a missing film keeps the still artwork and the working notebook', async ({ page }) => {
  await page.route('**/assets/lbb/videos/butterfly-opening.mp4', route => route.abort());
  await page.goto('/'); const opening = page.getByRole('group', { name: 'opening animation', exact: true });
  await expect(opening).toContainText('Animation unavailable');
  await expect.poll(() => opening.locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByLabel('Message the Exhibit Cart', { exact: true })).toBeEnabled();
  await expect(page.getByRole('complementary', { name: 'Living notebook' })).toBeVisible();
});

test('Present and Possible museum artwork is navigable without replacing the Atlas reflection', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'The Full Color Atlas', exact: true }).click();
  const gallery = page.getByRole('region', { name: 'Atlas gallery artwork' });
  await expect(gallery.getByRole('img')).toHaveAttribute('alt', /Present gallery/);
  await page.getByRole('button', { name: 'The Possible', exact: true }).click();
  await expect(gallery.getByRole('img')).toHaveAttribute('alt', /Possible gallery/);
  await expect.poll(() => gallery.getByRole('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Continue journey' }).click();
  await expect(page.getByRole('heading', { name: 'Two ways of looking.', exact: true })).toBeVisible();
});
