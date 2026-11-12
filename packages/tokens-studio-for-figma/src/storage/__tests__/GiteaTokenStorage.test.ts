import { Buffer } from 'buffer';
import { GiteaTokenStorage } from '../GiteaTokenStorage';
import { getGiteaCompareUrl, normalizeGiteaUrl } from '../gitea';

const baseUrl = 'https://git.example.test/gitea';
const api = `${baseUrl}/api/v1/repos/owner/repo`;
const tokenSet = { color: { type: 'color', value: '#fff' } };
const single = JSON.stringify({ global: tokenSet, $themes: [], $metadata: { tokenSetOrder: ['global'] } });
const file = (path: string, content: string, sha = 'blob') => ({
  type: 'file',
  path,
  sha,
  encoding: 'base64',
  content: Buffer.from(content).toString('base64'),
});
const response = (data: unknown, status = 200, headers: Record<string, string> = {}) => ({
  ok: status < 400,
  status,
  headers: { get: (key: string) => headers[key] || null },
  json: async () => data,
}) as Response;
let head = 'revision';
let repoStatus = 200;
let pathStatus = 200;
let writeStatus = 201;
let entries: Record<string, unknown>;
let mockFetch: jest.Mock;
let instance = 0;

const client = (path = 'tokens.json', expected = 'revision') => new GiteaTokenStorage('secret', 'owner', 'repo', baseUrl, expected).changePath(path);

beforeEach(() => {
  head = 'revision';
  repoStatus = 200;
  pathStatus = 200;
  writeStatus = 201;
  instance += 1;
  entries = { 'tokens.json': file('tokens.json', single) };
  mockFetch = jest.fn(async (url: string, init: RequestInit) => {
    const parsed = new URL(url);
    if (init.method === 'POST') return response({ commit: { sha: 'written' } }, writeStatus);
    if (parsed.pathname.endsWith('/branches/main')) return response({ name: 'main', commit: { id: head, timestamp: '2026-11-11T00:00:00Z' } });
    if (parsed.pathname.endsWith('/branches')) return response(parsed.searchParams.get('page') === '1' ? [{ name: 'main' }] : []);
    if (url === api) return response({ default_branch: 'main', empty: false, permissions: { push: true } }, repoStatus);
    const path = decodeURIComponent(parsed.pathname.split('/contents/')[1] || '');
    return response(entries[path], pathStatus);
  });
  global.fetch = mockFetch;
});

it('requires an explicit HTTPS installation URL and preserves subpaths', () => {
  expect(normalizeGiteaUrl('https://git.example.test/gitea///')).toBe(baseUrl);
  [
    'http://host',
    'https://user:pass@host',
    'https://host?q=x',
    'https://host/#fragment',
    'https://host/api/v1',
  ].forEach((url) => expect(() => normalizeGiteaUrl(url)).toThrow());
  expect(getGiteaCompareUrl(baseUrl, 'a b', 'репо', 'main', 'feature/a b')).toBe(
    `${baseUrl}/a%20b/%D1%80%D0%B5%D0%BF%D0%BE/compare/main...feature%2Fa%20b`,
  );
});

it('pins reads to a commit and keeps authorization on the configured installation', async () => {
  const storage = client();
  expect(await storage.read()).toEqual(
    expect.arrayContaining([{
      type: 'tokenSet', path: 'tokens.json', name: 'global', data: tokenSet,
    }]),
  );
  expect(storage.lastCommitSha).toBe('revision');
  const [url, init] = mockFetch.mock.calls[2];
  expect(url).toBe(`${api}/contents/tokens.json?ref=revision`);
  expect(init).toMatchObject({ credentials: 'omit', redirect: 'error', headers: { Authorization: 'token secret' } });
});

it('distinguishes missing token path from inaccessible repository and branch', async () => {
  pathStatus = 404;
  expect(await client().read()).toEqual([]);
  repoStatus = 404;
  await expect(client().read()).rejects.toMatchObject({ code: 'not-found' });
  repoStatus = 200;
  mockFetch
    .mockImplementationOnce(async () => response({ default_branch: 'main', empty: false }))
    .mockImplementationOnce(async () => response({}, 404));
  await expect(client().read()).rejects.toMatchObject({ code: 'not-found' });
});

it('retains themes, metadata and Unicode token content on save/retrieve', async () => {
  const storage = client();
  entries['tokens.json'] = file(
    'tokens.json',
    JSON.stringify({ основа: tokenSet, $themes: [], $metadata: { tokenSetOrder: ['основа'] } }),
  );
  const result = await storage.retrieve();
  expect(result).toMatchObject({ status: 'success', metadata: { tokenSetOrder: ['основа'] } });
  await storage.save(
    { tokens: {}, themes: [], metadata: { tokenSetOrder: ['основа'] } } as Parameters<typeof storage.save>[0],
    { storeTokenIdInJsonEditor: false },
  );
  const body = JSON.parse(mockFetch.mock.calls.find(([, init]) => init.method === 'POST')[1].body);
  expect(body.files[0]).toMatchObject({ operation: 'update', sha: 'blob' });
  expect(Buffer.from(body.files[0].content, 'base64').toString('utf8')).toContain('основа');
});

it('creates one atomic mutation with safe scoped deletions while preserving unrelated JSON and links', async () => {
  entries = {
    tokens: [
      { type: 'file', path: 'tokens/old.json' },
      { type: 'file', path: 'tokens/package.json' },
      { type: 'dir', path: 'tokens/nested' },
      { type: 'symlink', path: 'tokens/link.json' },
    ],
    'tokens/old.json': file('tokens/old.json', JSON.stringify(tokenSet), 'old-sha'),
    'tokens/package.json': file('tokens/package.json', '{"settings":{"value":1}}'),
    'tokens/nested': [{ type: 'file', path: 'tokens/nested/keep.json' }],
    'tokens/nested/keep.json': file('tokens/nested/keep.json', JSON.stringify(tokenSet), 'keep-sha'),
  };
  const storage = client('tokens').enableMultiFile();
  await storage.writeChangeset(
    { 'tokens/new.json': JSON.stringify(tokenSet), 'tokens/nested/keep.json': JSON.stringify(tokenSet) },
    'message',
    'main',
  );
  const posts = mockFetch.mock.calls.filter(([, init]) => init.method === 'POST');
  expect(posts).toHaveLength(1);
  expect(JSON.parse(posts[0][1].body)).toEqual({
    branch: 'main',
    message: 'message',
    files: [
      {
        operation: 'create',
        path: 'tokens/new.json',
        content: Buffer.from(JSON.stringify(tokenSet)).toString('base64'),
      },
      { operation: 'delete', path: 'tokens/old.json', sha: 'old-sha' },
    ],
  });
});

it('does not commit unchanged contents or touch neighboring single files', async () => {
  await client().writeChangeset({ 'tokens.json': single }, 'message', 'main');
  expect(mockFetch.mock.calls.some(([, init]) => init.method === 'POST')).toBe(false);
});

it('rejects stale revisions and changes between snapshot and mutation', async () => {
  head = 'new-revision';
  await expect(client().writeChangeset({ 'tokens.json': '{}' }, 'message', 'main')).rejects.toMatchObject({
    code: 'conflict',
  });
  head = 'revision';
  const previous = mockFetch.getMockImplementation()!;
  let branchReads = 0;
  mockFetch.mockImplementation(async (url, init) => {
    if (url.endsWith('/branches/main')) {
      branchReads += 1;
      if (branchReads > 1) head = 'raced';
    }
    return previous(url, init);
  });
  await expect(client().writeChangeset({ 'tokens.json': '{}' }, 'message', 'main')).rejects.toMatchObject({
    code: 'conflict',
  });
  expect(mockFetch.mock.calls.some(([, init]) => init.method === 'POST')).toBe(false);
});

it.each([401, 403, 404, 409, 422, 429])('keeps readable HTTP %s failures specific', async (status) => {
  repoStatus = status;
  await expect(client().read()).rejects.toMatchObject({ status });
});

it('blocks ambiguous writes across client recreation until a successful read', async () => {
  const path = `uncertain-${instance}.json`;
  entries[path] = file(path, single);
  writeStatus = 500;
  await expect(client(path).writeChangeset({ [path]: '{}' }, 'message', 'main')).rejects.toMatchObject({
    code: 'uncertain',
  });
  const calls = mockFetch.mock.calls.length;
  await expect(client(path).writeChangeset({ [path]: '{}' }, 'message', 'main')).rejects.toMatchObject({
    code: 'uncertain',
  });
  expect(mockFetch).toHaveBeenCalledTimes(calls);
  await client(path).read();
  writeStatus = 201;
  await expect(client(path).writeChangeset({ [path]: '{}' }, 'message', 'main')).resolves.toBe(true);
});

it('rejects malformed content and never follows a download URL', async () => {
  entries['tokens.json'] = { ...file('tokens.json', 'invalid-json'), download_url: 'https://attacker.test' };
  await expect(client().read()).rejects.toMatchObject({ code: 'malformed' });
  expect(mockFetch.mock.calls.every(([url]) => url.startsWith(api))).toBe(true);
});

it('paginates branches even when the server returns fewer than the requested limit', async () => {
  const previous = mockFetch.getMockImplementation()!;
  mockFetch.mockImplementation(async (url, init) => {
    if (url.includes('/branches?')) {
      const pages: Record<string, { name: string }[]> = { 1: [{ name: 'main' }], 2: [{ name: 'feature/a' }] };
      return response(pages[new URL(url).searchParams.get('page')!] || []);
    }
    return previous(url, init);
  });
  expect(await client().fetchBranches()).toEqual(['main', 'feature/a']);
});

it('keeps Pro gating of directory writes', async () => {
  await expect(client('tokens').write([], { storeTokenIdInJsonEditor: false })).rejects.toThrow();
});

it('encodes slash-containing branch refs and Unicode path segments', async () => {
  const storage = client('токены/a b.json').selectBranch('feature/a b');
  entries['токены/a b.json'] = file('токены/a b.json', single);
  const previous = mockFetch.getMockImplementation()!;
  mockFetch.mockImplementation(async (url, init) => {
    if (url.endsWith('/branches/feature%2Fa%20b')) return response({ name: 'feature/a b', commit: { id: 'revision' } });
    return previous(url, init);
  });
  await storage.read();
  expect(mockFetch.mock.calls.map(([url]) => url)).toContain(`${api}/contents/%D1%82%D0%BE%D0%BA%D0%B5%D0%BD%D1%8B/a%20b.json?ref=revision`);
});

it('requires an initialized repository', async () => {
  mockFetch.mockResolvedValueOnce(response({ default_branch: 'main', empty: true }));
  await expect(client().read()).rejects.toThrow();
});

it('does not guess the revision when reconnecting without a known baseline', async () => {
  const storage = new GiteaTokenStorage('secret', 'owner', 'repo', baseUrl).changePath('tokens.json');
  await expect(storage.writeChangeset({ 'tokens.json': '{}' }, 'message', 'main')).rejects.toMatchObject({ code: 'conflict' });
});

it('preserves server-enforced stale SHA and protected branch failures', async () => {
  writeStatus = 422;
  await expect(client().writeChangeset({ 'tokens.json': '{}' }, 'message', 'main')).rejects.toMatchObject({ code: 'conflict', status: 422 });
  writeStatus = 403;
  await expect(client().writeChangeset({ 'tokens.json': '{}' }, 'message', 'main')).rejects.toMatchObject({ code: 'permission', status: 403 });
});

it('reports uncertain writes when a successful response lacks a commit', async () => {
  const path = `malformed-write-${instance}.json`;
  entries[path] = file(path, single);
  const previous = mockFetch.getMockImplementation()!;
  mockFetch.mockImplementation(async (url, init) => (init.method === 'POST' ? response({}) : previous(url, init)));
  await expect(client(path).writeChangeset({ [path]: '{}' }, 'message', 'main')).rejects.toMatchObject({ code: 'uncertain' });
  expect(mockFetch.mock.calls.filter(([, init]) => init.method === 'POST')).toHaveLength(1);
});

it('does not retry a write after a network timeout', async () => {
  const path = `timeout-${instance}.json`;
  entries[path] = file(path, single);
  const previous = mockFetch.getMockImplementation()!;
  mockFetch.mockImplementation(async (url, init) => {
    if (init.method === 'POST') throw new TypeError('Failed to fetch');
    return previous(url, init);
  });
  await expect(client(path).writeChangeset({ [path]: '{}' }, 'message', 'main')).rejects.toMatchObject({ code: 'uncertain' });
  expect(mockFetch.mock.calls.filter(([, init]) => init.method === 'POST')).toHaveLength(1);
});

it('does not claim a network failure proves disabled CORS', async () => {
  mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));
  await expect(client().read()).rejects.toMatchObject({ code: 'transport' });
  expect(mockFetch).toHaveBeenCalledTimes(2);
});

it('uses the explicit source branch when atomically creating a new branch', async () => {
  const storage = new GiteaTokenStorage('secret', 'owner', 'repo', baseUrl, 'revision', 'main').changePath('tokens.json').selectBranch('new/branch');
  await storage.writeChangeset({ 'tokens.json': '{}' }, 'message', 'new/branch', true);
  const post = mockFetch.mock.calls.find(([, init]) => init.method === 'POST');
  expect(JSON.parse(post[1].body)).toMatchObject({ branch: 'main', new_branch: 'new/branch' });
});

it.each([null, [], 'repository', {}, { default_branch: '', empty: false }, { default_branch: 'main', empty: false, permissions: null }, { default_branch: 'main', empty: false, permissions: { push: 'yes' } }])('classifies malformed repository metadata %j without changing the baseline', async (payload) => {
  mockFetch.mockResolvedValueOnce(response(payload));
  const storage = client();
  await expect(storage.read()).rejects.toMatchObject({ code: 'malformed' });
  expect(storage.lastCommitSha).toBeUndefined();
});

it.each([null, [], 'branch', {}, { name: 'main', commit: null }, { name: 'main', commit: { id: 12 } }, { name: 'other', commit: { id: 'revision' } }])('classifies malformed branch metadata %j without accepting a revision', async (payload) => {
  const previous = mockFetch.getMockImplementation()!;
  mockFetch.mockImplementation(async (url, init) => (url.endsWith('/branches/main') ? response(payload) : previous(url, init)));
  const storage = client();
  await expect(storage.read()).rejects.toMatchObject({ code: 'malformed' });
  expect(storage.lastCommitSha).toBeUndefined();
});

it.each([null, {}, [null], [{}], [{ name: 12 }], [{ name: '' }], [{ name: 'main' }, { name: 'main' }]])('rejects malformed branch pages %j instead of silently returning an incomplete list', async (payload) => {
  const previous = mockFetch.getMockImplementation()!;
  mockFetch.mockImplementation(async (url, init) => (url.includes('/branches?') ? response(payload) : previous(url, init)));
  await expect(client().fetchBranches()).rejects.toMatchObject({ code: 'malformed' });
});

it.each([null, {}, { commit: null }, { commit: { sha: 12 } }, { commit: { sha: '' } }])('blocks repeat batch writes after malformed acknowledgement %j until a successful read', async (payload) => {
  const path = `malformed-batch-${instance}.json`;
  entries[path] = file(path, single);
  const previous = mockFetch.getMockImplementation()!;
  mockFetch.mockImplementation(async (url, init) => (init.method === 'POST' ? response(payload, 201) : previous(url, init)));
  await expect(client(path).writeChangeset({ [path]: '{}' }, 'message', 'main')).rejects.toMatchObject({ code: 'uncertain' });
  const calls = mockFetch.mock.calls.length;
  await expect(client(path).writeChangeset({ [path]: '{}' }, 'message', 'main')).rejects.toMatchObject({ code: 'uncertain' });
  expect(mockFetch).toHaveBeenCalledTimes(calls);
  expect(mockFetch.mock.calls.filter(([, init]) => init.method === 'POST')).toHaveLength(1);
  // A failed reconciliation cannot release the guard.
  mockFetch.mockResolvedValueOnce(response(null));
  await expect(client(path).read()).rejects.toMatchObject({ code: 'malformed' });
  await expect(client(path).writeChangeset({ [path]: '{}' }, 'message', 'main')).rejects.toMatchObject({ code: 'uncertain' });
  await client(path).read();
  mockFetch.mockImplementation(previous);
  await expect(client(path).writeChangeset({ [path]: '{}' }, 'message', 'main')).resolves.toBe(true);
});

it.each([null, {}, { name: 'feature', commit: null }, { name: 'feature', commit: { id: 12 } }, { name: 'other', commit: { id: 'revision' } }])('blocks repeat branch creation after malformed acknowledgement %j until a successful read', async (payload) => {
  const path = `malformed-branch-${instance}.json`;
  entries[path] = file(path, single);
  const previous = mockFetch.getMockImplementation()!;
  mockFetch.mockImplementation(async (url, init) => (init.method === 'POST' ? response(payload, 201) : previous(url, init)));
  await expect(client(path).createBranch('feature')).rejects.toMatchObject({ code: 'uncertain' });
  const calls = mockFetch.mock.calls.length;
  await expect(client(path).createBranch('feature')).rejects.toMatchObject({ code: 'uncertain' });
  expect(mockFetch).toHaveBeenCalledTimes(calls);
  await client(path).read();
  mockFetch.mockImplementation(async (url, init) => (init.method === 'POST' ? response({ name: 'feature', commit: { id: 'revision' } }, 201) : previous(url, init)));
  await expect(client(path).createBranch('feature')).resolves.toBe(true);
});

it.each([[null], [{ type: 'file' }], [{ type: 'file', path: 12 }]])('classifies malformed directory entries %j without attempting a write', async (payload) => {
  entries.tokens = payload;
  await expect(client('tokens').read()).rejects.toMatchObject({ code: 'malformed' });
  expect(mockFetch.mock.calls.some(([, init]) => init.method === 'POST')).toBe(false);
});

it('rejects repeated branch pages rather than accepting duplicate or partial results', async () => {
  const previous = mockFetch.getMockImplementation()!;
  mockFetch.mockImplementation(async (url, init) => (url.includes('/branches?') ? response([{ name: 'main' }]) : previous(url, init)));
  await expect(client().fetchBranches()).rejects.toMatchObject({ code: 'malformed' });
  expect(mockFetch.mock.calls.filter(([url]) => url.includes('/branches?'))).toHaveLength(2);
});

it('rejects an unexpectedly paginated contents listing without accepting a partial read', async () => {
  const previous = mockFetch.getMockImplementation()!;
  mockFetch.mockImplementation(async (url, init) => (url.includes('/contents/')
    ? response(entries['tokens.json'], 200, { link: '<https://git.example.test/next>; rel="next"' })
    : previous(url, init)));
  const storage = client();
  await expect(storage.read()).rejects.toMatchObject({ code: 'malformed' });
  expect(storage.lastCommitSha).toBeUndefined();
});

it('rejects a malformed nested file response instead of accepting a partial directory read', async () => {
  entries.tokens = [{ type: 'file', path: 'tokens/global.json' }];
  entries['tokens/global.json'] = null;
  const storage = client('tokens');
  await expect(storage.read()).rejects.toMatchObject({ code: 'malformed' });
  expect(storage.lastCommitSha).toBeUndefined();
});

it('does not read token contents through a configured symlink', async () => {
  entries['tokens.json'] = { type: 'symlink', path: 'tokens.json', target: 'outside/tokens.json' };
  await expect(client().read()).resolves.toEqual([]);
  expect(mockFetch.mock.calls.some(([url]) => url.includes('/outside/'))).toBe(false);
});

it.each(['source-sha', 'remote-change'])('uses the non-default source revision for a new push branch (head: %s)', async (sourceHead) => {
  head = 'main-sha';
  const previous = mockFetch.getMockImplementation()!;
  mockFetch.mockImplementation(async (url, init) => (
    url.endsWith('/branches/feature%2Fsource')
      ? response({ name: 'feature/source', commit: { id: sourceHead } })
      : previous(url, init)
  ));
  const storage = new GiteaTokenStorage('secret', 'owner', 'repo', baseUrl, 'source-sha', 'feature/source')
    .changePath('tokens.json').selectBranch('feature/new');
  const write = storage.writeChangeset({ 'tokens.json': '{}' }, 'message', 'feature/new', true);
  if (sourceHead !== 'source-sha') {
    await expect(write).rejects.toMatchObject({ code: 'conflict' });
    expect(mockFetch.mock.calls.some(([, init]) => init.method === 'POST')).toBe(false);
    return;
  }
  await expect(write).resolves.toBe(true);
  const post = mockFetch.mock.calls.find(([, init]) => init.method === 'POST');
  expect(JSON.parse(post[1].body)).toMatchObject({ branch: 'feature/source', new_branch: 'feature/new' });
  expect(mockFetch.mock.calls.some(([url]) => url.endsWith('/branches/main'))).toBe(false);
});
