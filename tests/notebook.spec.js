import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function hold(page, reason = 'The speaker’s context and independent sources have not been checked.') {
  await page.getByRole('button', { name: /HOLD/ }).click();
  await page.getByLabel('Reason for holding this claim').fill(reason);
  await page.getByRole('button', { name: 'Keep as provisional' }).click();
}

test('draft-based six-scene path preserves embodied response, dissent, and provisional judgment', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'I need context', exact: true }).click();
  await page.getByLabel('What remains outside the sentence?').fill('The speaker’s sightline and the shape of the step.');
  await page.getByRole('button', { name: 'Next scene' }).click();
  await expect(page.getByRole('heading', { name: 'The notebook answers back' })).toBeVisible();
  await page.getByLabel('Useful possibility', { exact: true }).check();
  await page.getByLabel('Source needed', { exact: true }).check();
  await expect(page.locator('.diff-view')).toContainText('UNKNOWN');
  await page.getByRole('button', { name: 'Next scene' }).click();
  await page.getByRole('button', { name: 'SHOW FOUNDATION' }).click();
  await expect(page.locator('.foundation-register')).toContainText('novelty remains unestablished');
  await expect(page.locator('.equation-placeholder')).toContainText('Original expression not supplied');
  await page.getByRole('button', { name: 'CROSS-EXAMINE THE CART' }).click();
  await page.getByRole('button', { name: 'What did you omit?' }).click();
  await expect(page.locator('.cart-answer')).toContainText('Useful reasoning or disagreement may be missing');
  await page.getByRole('button', { name: 'Next scene' }).click();
  await expect(page.locator('.assent-box')).toContainText('No human assent recorded');
  await page.getByRole('button', { name: 'I disagree', exact: true }).click();
  await page.getByRole('button', { name: 'Next scene' }).click();
  await hold(page);
  await page.getByRole('button', { name: 'Next scene' }).click();
  await page.getByRole('button', { name: 'Narrow', exact: true }).click();
  await page.getByLabel('Your reasons or limits').fill('The description communicates a possibility, not the experience itself.');
  await expect(page.locator('.return-record')).toContainText('I need context');
  await expect(page.locator('.return-record')).toContainText('I disagree');
  await expect(page.locator('.return-record')).toContainText('Held as provisional');
  await expect(page.locator('.return-record')).toContainText('No primary source check recorded');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'World Return', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Narrow', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Your reasons or limits')).toHaveValue(/communicates a possibility/);
});

test('source checks require a user declaration and preserve bounded notes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '05 Refraction Point' }).click();
  await page.getByRole('button', { name: /VERIFY/ }).click();
  const save = page.getByRole('button', { name: 'Record my source check' });
  await expect(save).toBeDisabled();
  await expect(page.getByRole('dialog')).toContainText('McLuhan considered only one-way media');
  await expect(page.getByRole('dialog')).toContainText('No excerpt or edition has been supplied');
  await page.getByLabel('I consulted this primary text myself.').check();
  await page.getByLabel('Your bounded finding').selectOption('Context only');
  await page.getByLabel('Edition, page').fill('My reading provides context, not equation validation.');
  await save.click();
  await page.getByRole('button', { name: '06 World Return' }).click();
  await expect(page.locator('.return-record')).toContainText('Context only (user-reported)');
  await expect(page.locator('.return-record')).toContainText('not equation validation');
});

test('stop clears expansions, prevents generation, and retains the hold reason', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '05 Refraction Point' }).click();
  await page.getByRole('button', { name: /GENERATE/ }).click();
  await expect(page.locator('.generated-output')).toContainText('SYNTHETIC');
  await hold(page);
  await page.getByRole('button', { name: /STOP/ }).click();
  await expect(page.locator('.generated-output')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /GENERATE/ })).toBeDisabled();
  await expect(page.locator('.hold-record')).toContainText('independent sources');
  await page.reload();
  await expect(page.getByRole('button', { name: /GENERATE/ })).toBeDisabled();
});

test('routing exports the actual bounded response and judgment without sending requests', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '04 A room full of agreement' }).click();
  await page.getByRole('button', { name: 'I’m unsure', exact: true }).click();
  await page.getByRole('button', { name: '06 World Return' }).click();
  await page.getByRole('button', { name: 'Revise', exact: true }).click();
  await page.getByLabel('Your revised sentence').fill('This description opens a question about context.');
  await page.getByRole('button', { name: 'Prepare a human review' }).click();
  await page.getByLabel('Question for a human reviewer').fill('What could the speaker clarify about this step?');
  const requests = []; page.on('request', r => requests.push(r.url()));
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download review package' }).click();
  const stream = await (await downloadPromise).createReadStream();
  const chunks = []; for await (const chunk of stream) chunks.push(chunk);
  const record = JSON.parse(Buffer.concat(chunks).toString());
  expect(record.question).toBe('What could the speaker clarify about this step?');
  expect(record.humanAssent.response).toBe('I’m unsure');
  expect(record.judgment).toBe('Revise');
  expect(record.revisedClaim).toContain('opens a question');
  expect(record.basis.sha256).toBe('b2dfcdf3233408e4dc9a7e2361715e6906aefada8efb796f22dfb2ad5722ab0d');
  expect(requests).toEqual([]);
});

test('Atlas arrows and drawer focus work without conflating margins and the Atlas', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'SAID', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'ADDED', exact: true })).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('What did the response introduce?');
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'OUTSIDE', exact: true })).toBeFocused();
  const atlas = page.getByRole('button', { name: 'Full Color Atlas', exact: true });
  await atlas.click();
  await expect(page.getByRole('dialog')).toContainText('not the complete conceptual taxonomy');
  await expect(page.getByRole('heading', { name: 'The Inheritance' })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('dialog').locator(':focus')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(atlas).toBeFocused();
});

test('replay remains usable offline after loading and reset clears the current record', async ({ page }) => {
  await page.goto('/');
  await page.context().setOffline(true);
  await page.getByRole('button', { name: /EXPLORE CURATED REPLAY/ }).click();
  await page.getByRole('button', { name: 'Load curated replay' }).click();
  await expect(page.locator('.replay-banner')).toContainText('Example decisions');
  await page.getByRole('button', { name: '06 World Return' }).click();
  await expect(page.locator('.return-record')).toContainText('CURATED EXAMPLE');
  await expect(page.locator('.return-record')).toContainText('Not given. No assent inferred.');
  await page.getByRole('button', { name: 'NEW SESSION' }).click();
  await page.getByRole('button', { name: 'Clear and start fresh' }).click();
  await page.context().setOffline(false);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'A sentence and a body', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'I need context', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.replay-banner')).toHaveCount(0);
});

test('the supplied working draft is readable in-app and downloads verbatim', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Working draft', exact: true }).click();
  await expect(page.getByRole('article', { name: 'Supplied working draft' })).toBeVisible();
  await expect(page.locator('.draft-body')).toContainText('LBB is The Living Notebook');
  await expect(page.locator('.draft-body')).toContainText('no demonstrated improvement in judgment');
  await expect(page.getByRole('navigation', { name: 'Working draft sections' }).getByRole('link')).toHaveCount(12);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'DOWNLOAD ORIGINAL TEXT' }).click();
  const stream = await (await downloadPromise).createReadStream();
  const chunks = []; for await (const chunk of stream) chunks.push(chunk);
  expect(Buffer.concat(chunks).toString()).toBe(await readFile('docs/LIVING_NOTEBOOK_WORKING_DRAFT.txt', 'utf8'));
  await page.getByRole('button', { name: 'RETURN TO THE NOTEBOOK' }).click();
  await expect(page.getByRole('heading', { name: 'A sentence and a body', exact: true })).toBeVisible();
});

test('extended path and contrast preference survive reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Extended 8–10 min' }).click();
  await expect(page.locator('.field-note')).toContainText('Carry this question');
  await page.getByRole('button', { name: 'High contrast theme' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');
  await expect(page.locator('.field-note')).toBeVisible();
});

test('phone view keeps all scenes, paper, and replay within the viewport', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  for (let i = 0; i < 6; i++) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (i < 5) await page.getByRole('button', { name: 'Next scene' }).click();
  }
  await page.getByRole('button', { name: 'Working draft', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'CURATED REPLAY', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Load curated replay' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('scenes and document view pass automated WCAG AA checks', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/');
  async function check() {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  }
  for (let i = 0; i < 6; i++) { await check(); if (i < 5) await page.getByRole('button', { name: 'Next scene' }).click(); }
  await page.getByRole('button', { name: 'Working draft', exact: true }).click(); await check();
  await page.getByRole('button', { name: 'Notebook', exact: true }).click();
  await page.getByRole('button', { name: 'Full Color Atlas', exact: true }).click(); await check();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '05 Refraction Point' }).click();
  for (const action of ['VERIFY', 'ROUTE', 'HOLD']) {
    await page.getByRole('button', { name: new RegExp(action) }).click(); await check(); await page.keyboard.press('Escape');
  }
  await page.getByRole('button', { name: 'High contrast theme' }).click(); await check();
});

test('corrupt or blocked storage cannot produce an empty notebook', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('lbb-notebook-v2', '{broken'));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'A sentence and a body', exact: true })).toBeVisible();
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('Storage blocked'); }; });
  await page.getByRole('button', { name: 'I need context', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('session works in memory');
  await page.getByRole('button', { name: 'Next scene' }).click();
  await expect(page.getByRole('heading', { name: 'The notebook answers back' })).toBeVisible();
});

test('a missing entry script displays the notebook identity and recovery instructions', async ({ page }) => {
  await page.route('**/src/main.jsx', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'The Living Notebook', exact: true })).toBeVisible();
  await expect(page.locator('#root')).toContainText('this preview has not loaded the app');
});

test('self-contained production HTML works at a nested web-preview path without asset requests', async ({ page }) => {
  const errors = []; const requests = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('request', r => requests.push(r.url()));
  const html = await readFile('dist/index.html', 'utf8');
  await page.route('**/standalone-preview/nested/index.html', route => route.fulfill({ contentType: 'text/html', body: html }));
  await page.goto('/standalone-preview/nested/index.html');
  await expect(page.getByRole('heading', { name: 'A sentence and a body', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Working draft', exact: true }).click();
  await expect(page.locator('.draft-body')).toContainText('LBB is The Living Notebook');
  await page.getByRole('button', { name: 'Notebook', exact: true }).click();
  await page.getByRole('button', { name: '05 Refraction Point' }).click();
  await page.getByRole('button', { name: /GENERATE/ }).click();
  await expect(page.locator('.generated-output')).toContainText('SYNTHETIC');
  expect(errors).toEqual([]);
  expect(requests).toEqual(['http://127.0.0.1:4173/standalone-preview/nested/index.html']);
});


test('the opposite branch offers a counterargument without deciding for the visitor', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'ARGUE THE OPPOSITE' }).click();
  await expect(page.locator('.authored-counterargument')).toContainText('language can convey useful practical knowledge');
  await expect(page.getByLabel('Question worth testing', { exact: true })).not.toBeChecked();
  await page.getByRole('button', { name: '06 World Return' }).click();
  await expect(page.locator('.return-record')).toContainText('Not given. No assent inferred.');
});
