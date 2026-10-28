import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: '**/*.spec.ts', fullyParallel: true, workers: 2,
  use: { baseURL: 'http://127.0.0.1:4173', launchOptions: { executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] } },
  webServer: { command: 'npm start -- --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: false, timeout: 120000 },
});
