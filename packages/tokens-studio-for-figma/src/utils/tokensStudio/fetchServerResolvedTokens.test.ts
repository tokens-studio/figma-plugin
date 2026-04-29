import { fetchServerResolvedTokens } from './fetchServerResolvedTokens';

// Mock global fetch
const originalFetch = global.fetch;
const mockFetch = jest.fn();
global.fetch = mockFetch;

const BASE_OPTIONS = {
  apiBaseUrl: 'https://api.tokens.studio',
  projectId: 'proj-123',
  changeSetId: 'cs-456',
  authToken: 'test-token',
  themeSelections: { Mode: 'Dark' },
};

describe('fetchServerResolvedTokens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(Date, 'now').mockReturnValue(1777406477644);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('returns null on a 4xx response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });

    const result = await fetchServerResolvedTokens(BASE_OPTIONS);
    expect(result).toBeNull();
  });

  it('returns null on a 5xx response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' });

    const result = await fetchServerResolvedTokens(BASE_OPTIONS);
    expect(result).toBeNull();
  });

  it('returns null on a network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));

    const result = await fetchServerResolvedTokens(BASE_OPTIONS);
    expect(result).toBeNull();
  });

  it('returns null when response data is not a plain object', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: null }),
    });

    const result = await fetchServerResolvedTokens(BASE_OPTIONS);
    expect(result).toBeNull();
  });

  it('extracts flat map from { data: { tokenName: value } } response shape', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          'color.primary': '#FF0000',
          'color.secondary': '#0000FF',
        },
        meta: { resolved: ['color.primary', 'color.secondary'], unresolved: [], errors: {} },
      }),
    });

    const result = await fetchServerResolvedTokens(BASE_OPTIONS);
    expect(result).not.toBeNull();
    expect(result!['color.primary']).toBe('#FF0000');
    expect(result!['color.secondary']).toBe('#0000FF');
    expect(Object.keys(result!)).toHaveLength(2);
  });

  it('returns null when data is missing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ meta: { resolved: [] } }),
    });

    const result = await fetchServerResolvedTokens(BASE_OPTIONS);
    expect(result).toBeNull();
  });

  it('sends GET request with correct URL, auth header, and query params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: {} }),
    });

    await fetchServerResolvedTokens(BASE_OPTIONS);

    const expectedParams = new URLSearchParams({ 
      change_set_id: 'cs-456', 
      t: '1777406477644',
      Mode: 'Dark',
    });
    expect(mockFetch).toHaveBeenCalledWith(
      `https://api.tokens.studio/api/v1/projects/proj-123/resolved_tokens?${expectedParams.toString()}`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('encodes multiple theme selections as separate query params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: {} }),
    });

    await fetchServerResolvedTokens({
      ...BASE_OPTIONS,
      themeSelections: { foundation: 'base', 'color-scheme': 'blue' },
    });

    const [calledUrl] = mockFetch.mock.calls[0];
    const url = new URL(calledUrl);
    expect(url.searchParams.get('foundation')).toBe('base');
    expect(url.searchParams.get('color-scheme')).toBe('blue');
    expect(url.searchParams.get('change_set_id')).toBe('cs-456');
  });
});
