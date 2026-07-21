import { ThemeObject } from '@/types';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { fetchServerResolvedTokensPerTheme } from './fetchServerResolvedTokensPerTheme';
import * as fetchModule from './fetchServerResolvedTokens';

const CONTEXT = {
  apiBaseUrl: 'https://api.tokens.studio',
  projectId: 'proj-1',
  changeSetId: 'cs-1',
  authToken: 'token',
};

const themes: ThemeObject[] = [
  {
    id: 'light-id',
    name: 'Light',
    group: 'Mode',
    selectedTokenSets: { core: TokenSetStatus.ENABLED, dark: TokenSetStatus.DISABLED },
  },
  {
    id: 'dark-id',
    name: 'Dark',
    group: 'Mode',
    selectedTokenSets: { core: TokenSetStatus.ENABLED, dark: TokenSetStatus.ENABLED },
  },
];

describe('fetchServerResolvedTokensPerTheme', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(fetchModule, 'fetchServerResolvedTokens');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns null when no themes are selected', async () => {
    const result = await fetchServerResolvedTokensPerTheme([], CONTEXT);
    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fetches once per selected theme and keys results by theme.id', async () => {
    fetchSpy.mockImplementation(async ({ themeSelections }) => (
      themeSelections.Mode === 'Light'
        ? { 'color.bg': '#ffffff' }
        : { 'color.bg': '#000000' }
    ));

    const result = await fetchServerResolvedTokensPerTheme([themes[0], themes[1]], CONTEXT);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      'light-id': { 'color.bg': '#ffffff' },
      'dark-id': { 'color.bg': '#000000' },
    });
  });

  it('sends ONLY the target theme\'s own group in themeSelections — no active-theme baseline', async () => {
    fetchSpy.mockResolvedValue({});

    await fetchServerResolvedTokensPerTheme([themes[0], themes[1]], CONTEXT);

    expect(fetchSpy.mock.calls[0][0].themeSelections).toEqual({ Mode: 'Light' });
    expect(fetchSpy.mock.calls[1][0].themeSelections).toEqual({ Mode: 'Dark' });
  });

  it('falls back to theme.name as group key when theme.group is absent (no internal-id leak)', async () => {
    fetchSpy.mockResolvedValue({});
    const ungrouped: ThemeObject = {
      id: 'ungrouped-id',
      name: 'Solo',
      selectedTokenSets: { core: TokenSetStatus.ENABLED },
    };

    await fetchServerResolvedTokensPerTheme([ungrouped], CONTEXT);

    expect(fetchSpy.mock.calls[0][0].themeSelections).toEqual({ Solo: 'Solo' });
  });

  it('passes only ENABLED sets from each theme (excludes DISABLED)', async () => {
    fetchSpy.mockResolvedValue({});

    await fetchServerResolvedTokensPerTheme([themes[0], themes[1]], CONTEXT);

    expect(fetchSpy.mock.calls[0][0].activeSets).toEqual(['core']);
    expect(fetchSpy.mock.calls[1][0].activeSets).toEqual(['core', 'dark']);
  });

  it('returns null (all-or-nothing) when any theme fetch fails, to avoid mixing server-resolved and local resolution across modes', async () => {
    fetchSpy
      .mockResolvedValueOnce({ 'color.bg': '#ffffff' })
      .mockResolvedValueOnce(null);

    const result = await fetchServerResolvedTokensPerTheme([themes[0], themes[1]], CONTEXT);

    expect(result).toBeNull();
  });

  it('returns null when every fetch fails', async () => {
    fetchSpy.mockResolvedValue(null);

    const result = await fetchServerResolvedTokensPerTheme([themes[0], themes[1]], CONTEXT);

    expect(result).toBeNull();
  });

  it('forwards apiBaseUrl / projectId / changeSetId / authToken to the underlying fetch', async () => {
    fetchSpy.mockResolvedValue({});

    await fetchServerResolvedTokensPerTheme([themes[0]], CONTEXT);

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        apiBaseUrl: 'https://api.tokens.studio',
        projectId: 'proj-1',
        changeSetId: 'cs-1',
        authToken: 'token',
      }),
    );
  });
});
