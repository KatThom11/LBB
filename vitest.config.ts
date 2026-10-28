import { defineConfig } from 'vitest/config';
import path from 'node:path';
export default defineConfig({ resolve: { alias: { '@': path.resolve(process.cwd()) } }, test: { include: ['tests/api.test.ts'], environment: 'node' } });
