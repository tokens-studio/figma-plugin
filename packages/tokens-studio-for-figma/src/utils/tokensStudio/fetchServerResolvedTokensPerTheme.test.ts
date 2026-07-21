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
  {
    id: 'base-id',
    name: 'Base',
    group: 'Foundation',
    selectedTokenSets: { foundation: TokenSetStatus.ENABLED },
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
    const result = await fetchServerResolvedTokensPerTheme([], { 'Mode': 'light-id' }, themes, CONTEXT);
    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fetches once per selected theme and keys results by theme.id', async () => {
    fetchSpy.mockImplementation(async ({ themeSelections }) => (
      themeSelections.Mode === 'Light'
        ? { 'color.bg': '#ffffff' }
        : { 'color.bg': '#000000' }
    ));

    const result = await fetchServerResolvedTokensPerTheme(
      [themes[0], themes[1]],
      { Mode: 'light-id' },
      themes,
      CONTEXT,
    );

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      'light-id': { 'color.bg': '#ffffff' },
      'dark-id': { 'color.bg': '#000000' },
    });
  });

  it('forces the target theme option for that theme, even when activeTheme picks another option in the same group', async () => {
    fetchSpy.mockResolvedValue({});

    await fetchServerResolvedTokensPerTheme(
      [themes[0], themes[1]],
      { Mode: 'light-id' }, // active theme picks Light for Mode
      themes,
      CONTEXT,
    );

    const selections = fetchSpy.mock.calls.map((c) => c[0].themeSelections);
    expect(selections[0]).toEqual({ Mode: 'Light' });
    expect(selections[1]).toEqual({ Mode: 'Dark' });
  });

  it('layers active-theme selections for OTHER groups so the server has full context', async () => {
    fetchSpy.mockResolvedValue({});

    await fetchServerResolvedTokensPerTheme(
      [themes[1]], // export only Dark from group "Mode"
      { Mode: 'light-id', Foundation: 'base-id' },
      themes,
      CONTEXT,
    );

    expect(fetchSpy.mock.calls[0][0].themeSelections).toEqual({
      Mode: 'Dark', // target theme's group overridden
      Foundation: 'Base', // other group carried over from activeTheme
    });
  });

  it('passes only ENABLED sets from each theme (excludes DISABLED)', async () => {
    fetchSpy.mockResolvedValue({});

    await fetchServerResolvedTokensPerTheme(
      [themes[0], themes[1]],
      {},
      themes,
      CONTEXT,
    );

    expect(fetchSpy.mock.calls[0][0].activeSets).toEqual(['core']);
    expect(fetchSpy.mock.calls[1][0].activeSets).toEqual(['core', 'dark']);
  });

  it('skips null results from failed fetches and keeps the rest', async () => {
    fetchSpy
      .mockResolvedValueOnce({ 'color.bg': '#ffffff' })
      .mockResolvedValueOnce(null);

    const result = await fetchServerResolvedTokensPerTheme(
      [themes[0], themes[1]],
      {},
      themes,
      CONTEXT,
    );

    expect(result).toEqual({ 'light-id': { 'color.bg': '#ffffff' } });
  });

  it('returns null when every fetch fails', async () => {
    fetchSpy.mockResolvedValue(null);

    const result = await fetchServerResolvedTokensPerTheme(
      [themes[0], themes[1]],
      {},
      themes,
      CONTEXT,
    );

    expect(result).toBeNull();
  });

  it('forwards apiBaseUrl / projectId / changeSetId / authToken to the underlying fetch', async () => {
    fetchSpy.mockResolvedValue({});

    await fetchServerResolvedTokensPerTheme([themes[0]], {}, themes, CONTEXT);

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
