import { beforeEach, afterEach, expect, test, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock('openai', () => ({ default: class { responses = { create: mocks.create }; } }));
let route: typeof import('../app/api/chat/route');
const body = { messages: [{ role: 'user', content: 'Does naming change what we notice?' }], shareNotebook: false, notebook: [] };
function request(value: unknown = body, headers: Record<string, string> = {}) { return new Request('http://localhost:3000/api/chat', { method: 'POST', headers: { Host: 'localhost:3000', Origin: 'http://localhost:3000', 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(value) }); }
beforeEach(async () => {
  vi.resetModules(); vi.stubEnv('LBB_LIVE_AI_ENABLED', 'true'); vi.stubEnv('OPENAI_API_KEY', 'unit-test-only-not-a-real-credential');
  mocks.create.mockReset().mockImplementation(async () => (async function* () { yield { type: 'response.output_text.delta', delta: 'A bounded possibility.' }; yield { type: 'response.completed' }; })());
  route = await import('../app/api/chat/route');
});
afterEach(() => { vi.unstubAllEnvs(); });
test('demo default cannot make a paid call', async () => { vi.stubEnv('LBB_LIVE_AI_ENABLED', 'false'); const response = await route.POST(request()); expect(response.status).toBe(503); expect(mocks.create).not.toHaveBeenCalled(); expect(await (await route.GET()).json()).toMatchObject({ enabled: false }); });
test('cross-site requests, oversized input, and unconsented notebook data are rejected before calling a model', async () => {
  expect((await route.POST(request(body, { Origin: 'https://elsewhere.example' }))).status).toBe(403);
  expect((await route.POST(request({ ...body, notebook: [{ category: 'My Theory', text: 'Private theory', status: 'unverified' }] }))).status).toBe(400);
  expect((await route.POST(request({ ...body, messages: [{ role: 'user', content: 'x'.repeat(50000) }] }))).status).toBe(413);
  expect(mocks.create).not.toHaveBeenCalled();
});
test('Responses stream uses no provider storage and includes only explicitly consented notebook context', async () => {
  const response = await route.POST(request({ ...body, shareNotebook: true, notebook: [{ category: 'My Theory', text: 'A visitor-owned theory.', status: 'unverified' }] }));
  expect(response.status).toBe(200); const events = (await response.text()).trim().split('\n').map(s => JSON.parse(s));
  expect(events).toEqual([{ type: 'delta', text: 'A bounded possibility.' }, { type: 'done' }]);
  const params = mocks.create.mock.calls[0][0]; expect(params.store).toBe(false); expect(params.stream).toBe(true); expect(params.max_output_tokens).toBe(800); expect(params.instructions).toContain('A visitor-owned theory.');
});
test('provider startup errors are sanitized', async () => {
  mocks.create.mockRejectedValueOnce(new Error('PRIVATE_PROVIDER_DETAIL'));
  const response = await route.POST(request()); expect(response.status).toBe(502); expect(await response.text()).not.toContain('PRIVATE_PROVIDER_DETAIL');
});
test('stream failures retain a typed error without leaking provider details', async () => {
  mocks.create.mockResolvedValueOnce((async function* () { yield { type: 'response.output_text.delta', delta: 'Partial' }; throw new Error('PRIVATE_STREAM_DETAIL'); })());
  const response = await route.POST(request()); const text = await response.text(); expect(text).toContain('Partial'); expect(text).toContain('"type":"error"'); expect(text).not.toContain('PRIVATE_STREAM_DETAIL');
});
test('a per-process burst limit blocks excess live calls', async () => {
  for (let i = 0; i < 10; i++) { const response = await route.POST(request()); expect(response.status).toBe(200); await response.text(); }
  const limited = await route.POST(request()); expect(limited.status).toBe(429); expect(limited.headers.get('Retry-After')).toBe('60'); expect(mocks.create).toHaveBeenCalledTimes(10);
});
