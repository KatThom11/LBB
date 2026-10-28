import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const input = (page: Page) => page.getByLabel('Message the Exhibit Cart', { exact: true });
async function send(page: Page, text: string) { await input(page).fill(text); await page.getByRole('button', { name: 'Send message', exact: true }).click(); await expect(page.getByRole('button', { name: 'Stop reply', exact: true })).toHaveCount(0); }
async function openSettings(page: Page) { await page.getByRole('button', { name: 'Open display and privacy settings' }).click(); }

test('home is conversational and the demo streams without an API or a mandatory journey', async ({ page }) => {
  const external: string[] = []; page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1:4173')) external.push(r.url()); });
  await page.goto('/'); await expect(page.getByRole('heading', { name: /A thought is a place/ })).toBeVisible();
  await send(page, 'Does language change reality?');
  await expect(page.getByRole('article', { name: 'Exhibit Cart reply', exact: true })).toContainText('A sentence can describe a doorway');
  await expect(page.getByRole('article', { name: 'Exhibit Cart reply', exact: true })).toContainText('Scripted demo');
  await expect(page.getByRole('navigation', { name: 'Journey steps' })).toHaveCount(0); expect(external).toEqual([]);
});

test('chat to Atlas to saved theory to World Return returns to the same conversation', async ({ page }) => {
  await page.goto('/'); await send(page, 'I want to explore how language changes what we notice.');
  await page.getByRole('button', { name: 'The Full Color Atlas', exact: true }).click();
  await page.getByRole('button', { name: 'Continue journey' }).click();
  await expect(page.locator('.journey-reading')).toContainText('meaning in use');
  await page.getByRole('button', { name: 'Continue journey' }).click();
  await page.getByLabel('What do you think language changes?', { exact: true }).fill('Language changes what I notice, without replacing experience.');
  await page.getByRole('button', { name: 'Save to notebook', exact: true }).click();
  await expect(page.getByRole('article', { name: 'My Theory entry' })).toContainText('without replacing experience');
  await page.getByRole('button', { name: 'Continue journey' }).click();
  await page.getByLabel('Your provisional judgment').selectOption('Narrow');
  await page.getByRole('button', { name: 'Return to our conversation' }).click();
  await expect(page.getByRole('article', { name: 'Your message', exact: true })).toContainText('I want to explore');
  await expect(page.locator('.message-history')).toContainText('Your provisional disposition: Narrow');
  await page.reload(); await expect(page.locator('.message-history')).toContainText('without replacing experience');
  await expect(page.getByRole('article', { name: 'My Theory entry' })).toBeVisible();
});

test('notebook revisions keep the original and remain unverified after reload', async ({ page }) => {
  await page.goto('/'); const notebook = page.getByRole('complementary', { name: 'Living notebook' });
  await notebook.getByLabel('Notebook entry', { exact: true }).fill('Language creates reality.');
  await notebook.getByRole('button', { name: 'Save entry', exact: true }).click();
  await notebook.getByRole('button', { name: 'Revise', exact: true }).click();
  await notebook.getByLabel('Revise your entry').fill('Language can shape how we interpret reality.');
  await notebook.getByRole('button', { name: 'Save revision' }).click();
  await page.reload(); await expect(notebook.getByRole('article')).toContainText('shape how we interpret');
  await notebook.getByText('Revision history', { exact: true }).click();
  await expect(notebook.locator('.revision-history')).toContainText('Language creates reality.');
  await expect(notebook.getByRole('article')).toContainText('Unverified');
});

test('new and recent conversations keep separate histories and a shared notebook', async ({ page }) => {
  await page.goto('/'); await send(page, 'First conversation: a theory about naming.');
  await page.getByRole('button', { name: 'New conversation', exact: true }).click();
  await send(page, 'Second conversation: a theory about seeing.');
  await expect(page.locator('.message-history')).not.toContainText('First conversation:');
  await page.getByRole('button', { name: 'First conversation: a theory about naming.', exact: true }).click();
  await expect(page.locator('.message-history')).toContainText('First conversation:');
  await expect(page.locator('.message-history')).not.toContainText('Second conversation:');
});

test('stopping a stream retains the user message and interrupted reply', async ({ page }) => {
  await page.goto('/'); await input(page).fill('Does language change what we notice?');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await page.getByRole('button', { name: 'Stop reply', exact: true }).click();
  await expect(page.getByRole('article', { name: 'Your message', exact: true })).toContainText('what we notice');
  await expect(page.getByRole('article', { name: 'Exhibit Cart reply, interrupted' })).toBeVisible();
  await send(page, 'Let us try a different perspective.');
  await expect(page.getByRole('article', { name: 'Exhibit Cart reply', exact: true })).toContainText('Try the other side');
});

test('Trial is an honest framework and sources preserve the supplied proposal', async ({ page }) => {
  await page.goto('/'); await page.getByRole('complementary', { name: 'Main navigation' }).getByRole('button', { name: /^A Trial of Color/ }).click();
  await expect(page.locator('.content-notice')).toContainText('manuscript has not been supplied');
  await expect(page.locator('.journey-reading')).toContainText('No manuscript passage');
  await page.getByRole('button', { name: 'Sources & research', exact: true }).click();
  await expect(page.locator('.source-missing')).toContainText('no access to private ChatGPT');
  await page.getByText('Read the supplied Living Notebook working proposal', { exact: true }).click();
  await expect(page.locator('.full-proposal')).toContainText('LBB is The Living Notebook');
});

test('Refraction actions have distinct local outcomes and route never sends a message', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'The Refraction Lab', exact: true }).click();
  await page.getByRole('button', { name: 'Continue journey' }).click(); await page.getByRole('button', { name: 'Continue journey' }).click();
  await page.getByRole('button', { name: 'GENERATE', exact: true }).click();
  await expect(page.locator('.journey-page')).toContainText('A possibility generated');
  await page.getByRole('button', { name: 'VERIFY', exact: true }).click(); await expect(page.locator('.source-examination')).toContainText('primary excerpts have not been supplied');
  await page.getByRole('button', { name: 'HOLD', exact: true }).click(); await page.getByLabel('Reason for holding judgment').fill('No primary source has been checked.');
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'ROUTE', exact: true }).click(); const stream = await (await download).createReadStream(); const chunks: Buffer[] = []; for await (const chunk of stream!) chunks.push(chunk);
  expect(JSON.parse(Buffer.concat(chunks).toString()).status).toContain('Not sent');
  await page.getByRole('button', { name: 'STOP', exact: true }).click(); await expect(page.locator('.message-history')).toContainText('scripted extension');
});

test('live setup stays disabled without configuration and makes no paid request', async ({ page, request }) => {
  await page.goto('/'); await openSettings(page); await page.getByRole('button', { name: 'Live OpenAI mode', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('not configured');
  expect((await (await request.get('/api/chat')).json()).enabled).toBe(false);
});

test('live notebook context is excluded by default and requires per-reply consent', async ({ page }) => {
  const payloads: Array<{notebook: unknown[];shareNotebook: boolean}> = [];
  await page.route('**/api/chat', async route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { enabled: true } });
    payloads.push(route.request().postDataJSON());
    return route.fulfill({ contentType: 'application/x-ndjson', body: '{"type":"delta","text":"Mocked live response, not an API call."}\n{"type":"done"}\n' });
  });
  await page.goto('/'); const notebook = page.getByRole('complementary', { name: 'Living notebook' });
  await notebook.getByLabel('Notebook entry', { exact: true }).fill('My private provisional theory.'); await notebook.getByRole('button', { name: 'Save entry', exact: true }).click();
  await openSettings(page); await page.getByRole('button', { name: 'Live OpenAI mode', exact: true }).click(); await page.getByRole('button', { name: 'Close dialog' }).click();
  await send(page, 'A reply without notebook context.'); expect(payloads[0].notebook).toEqual([]);
  await notebook.getByLabel('Select for next live reply').check(); await input(page).fill('Now consider the selected note.');
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeDisabled();
  await page.getByLabel(/I consent to send these 1 selected/).check(); await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Stop reply' })).toHaveCount(0);
  expect(payloads[1].shareNotebook).toBe(true); expect(payloads[1].notebook).toHaveLength(1);
  await expect(notebook.getByLabel('Select for next live reply')).not.toBeChecked();
});

test('mobile menu, notebook dialog, keyboard return, and layout remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 }); await page.goto('/');
  await expect(input(page)).toBeEnabled();
  expect(await page.locator('.conversation-scroll').evaluate(el => el.scrollTop)).toBe(0);
  const menu = page.getByRole('button', { name: 'Open navigation' }); await menu.click(); await page.keyboard.press('Escape'); await expect(menu).toBeFocused();
  await menu.click(); await page.getByRole('dialog').getByRole('button', { name: 'The Full Color Atlas', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The Full Color Atlas', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Open notebook', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Notebook entry', { exact: true }).fill('A mobile theory.'); await page.getByRole('dialog').getByRole('button', { name: 'Save entry', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('article')).toContainText('A mobile theory.');
  await page.keyboard.press('Escape'); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Back to conversation', exact: true }).click(); await send(page, 'Hello from a small screen.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('display preferences and valid notes persist when storage works; storage failure is visible', async ({ page }) => {
  await page.goto('/'); await openSettings(page); await page.getByLabel('High contrast', { exact: true }).check(); await page.getByLabel('Text size', { exact: true }).selectOption('larger'); await page.getByRole('button', { name: 'Close dialog' }).click(); await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high'); await expect(page.locator('html')).toHaveAttribute('data-text-size', 'larger');
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('Quota full'); }; });
  await page.getByRole('button', { name: 'New conversation', exact: true }).click(); await expect(page.locator('.storage-banner')).toContainText('in memory');
});

test('automated accessibility checks pass for chat, notebook, journey, sources and settings', async ({ page }) => {
  test.setTimeout(60000); await page.goto('/');
  async function check() { const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze(); expect(result.violations).toEqual([]); }
  await expect(page.getByRole('button', { name: 'New conversation', exact: true })).toBeEnabled(); await check();
  await send(page, 'What does language do?'); await check();
  await page.getByRole('button', { name: 'The Full Color Atlas', exact: true }).click(); await check();
  await page.getByRole('button', { name: 'Sources & research', exact: true }).click(); await check();
  await openSettings(page); await check();
});
