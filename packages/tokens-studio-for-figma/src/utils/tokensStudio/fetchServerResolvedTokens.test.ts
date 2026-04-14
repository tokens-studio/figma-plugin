import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList } from '@/types/tokens';
import { fetchServerResolvedTokens } from './fetchServerResolvedTokens';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const BASE_OPTIONS = {
  apiBaseUrl: 'https://api.tokens.studio',
  projectId: 'proj-123',
  changeSetId: 'cs-456',
  authToken: 'test-token',
  themeSelections: { Mode: 'Dark' },
};

// Typed fixture matching AnyTokenList element requirements
const RAW_TOKENS: Record<string, AnyTokenList> = {
  'core/colors': [
    {
      name: 'color.primary', value: '{core.red.500}', type: TokenTypes.COLOR,
    },
    {
      name: 'core.red.500', value: '#FF0000', type: TokenTypes.COLOR,
    },
  ] as AnyTokenList,
};

describe('fetchServerResolvedTokens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('returns null on a 4xx response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });

    const result = await fetchServerResolvedTokens(BASE_OPTIONS, RAW_TOKENS);
    expect(result).toBeNull();
  });

  it('returns null on a 5xx response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' });

    const result = await fetchServerResolvedTokens(BASE_OPTIONS, RAW_TOKENS);
    expect(result).toBeNull();
  });

  it('returns null on a network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));

    const result = await fetchServerResolvedTokens(BASE_OPTIONS, RAW_TOKENS);
    expect(result).toBeNull();
  });

  it('returns null when server response is not an object', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });

    const result = await fetchServerResolvedTokens(BASE_OPTIONS, RAW_TOKENS);
    expect(result).toBeNull();
  });

  it('maps flat server response { tokenName: resolvedValue } to ResolveTokenValuesResult[]', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        'color.primary': '#FF0000',
        'color.secondary': '#0000FF',
      }),
    });

    const result = await fetchServerResolvedTokens(BASE_OPTIONS, RAW_TOKENS);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);

    const primary = result!.find((t) => t.name === 'color.primary');
    expect(primary).toBeDefined();
    expect(primary!.value).toBe('#FF0000');
    expect(primary!.failedToResolve).toBe(false);
    expect(primary!.type).toBe(TokenTypes.COLOR);
  });

  it('maps nested { data: { tokens: {...} } } server response shape', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          tokens: {
            'color.primary': '#FF0000',
          },
        },
      }),
    });

    const result = await fetchServerResolvedTokens(BASE_OPTIONS, RAW_TOKENS);
    expect(result).toHaveLength(1);
    expect(result![0].name).toBe('color.primary');
    expect(result![0].value).toBe('#FF0000');
  });

  it('sets rawValue to the original alias reference', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 'color.primary': '#FF0000' }),
    });

    const result = await fetchServerResolvedTokens(BASE_OPTIONS, RAW_TOKENS);
    const primary = result!.find((t) => t.name === 'color.primary');
    expect(primary!.rawValue).toBe('{core.red.500}');
  });

  it('sends POST request with correct URL, auth header, and body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await fetchServerResolvedTokens(BASE_OPTIONS, RAW_TOKENS);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.tokens.studio/api/v1/projects/proj-123/resolved_tokens',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          change_set_id: 'cs-456',
          theme_selections: { Mode: 'Dark' },
        }),
      }),
    );
  });
});
