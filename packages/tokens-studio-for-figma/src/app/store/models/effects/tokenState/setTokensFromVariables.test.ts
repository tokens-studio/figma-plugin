import { setTokensFromVariables } from './setTokensFromVariables';
import { notifyThemePushFailures, pushThemeToTokensStudioOAuth } from './utils/pushThemeToTokensStudioOAuth';
import { pushToTokensStudioOAuth } from '@/app/store/providers/tokens-studio/tokensStudioOAuth';
import { store } from '@/app/store';
import { StorageProviderType } from '@/constants/StorageProviderType';

jest.mock('@/app/store/providers/tokens-studio/tokensStudioOAuth', () => ({
  pushToTokensStudioOAuth: jest.fn(),
}));

jest.mock('./utils/pushThemeToTokensStudioOAuth', () => ({
  pushThemeToTokensStudioOAuth: jest.fn(),
  notifyThemePushFailures: jest.fn(),
}));

jest.mock('@/app/store', () => ({
  store: { getState: jest.fn() },
}));

const mockPush = jest.mocked(pushToTokensStudioOAuth);
const mockPushTheme = jest.mocked(pushThemeToTokensStudioOAuth);
const mockNotifyFailures = jest.mocked(notifyThemePushFailures);
const mockGetState = jest.mocked(store.getState);

const newTheme = {
  id: 'local-id', name: 'dark', group: 'mode', selectedTokenSets: { core: 'enabled' },
};
const updatedTheme = {
  id: 'server-id', name: 'light', group: 'mode', selectedTokenSets: { core: 'enabled' },
};

const setState = ({ provider = StorageProviderType.TOKENS_STUDIO_OAUTH, changeSetId = 'change-set-1' } = {}) => {
  mockGetState.mockReturnValue({
    uiState: { api: { provider, id: 'project-1', changeSetId } },
    tokenState: {
      importedTokens: {
        newTokens: [
          {
            name: 'color.primary', value: '#ffffff', type: 'color', parent: 'core',
          },
          {
            name: 'space.sm', value: '4', type: 'dimension', parent: 'existing',
          },
          // A token without a set can't be created in Studio.
          { name: 'orphan', value: '1', type: 'number' },
        ],
      },
      tokenSetMetadata: { existing: { id: 'set-existing' } },
      importedThemes: { newThemes: [newTheme], updatedThemes: [updatedTheme] },
    },
  } as any);
};

describe('setTokensFromVariables', () => {
  let dispatch: any;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = { tokenState: { setTokenSetMetadata: jest.fn() } };
    mockPush.mockImplementation(async ({ action }: any) => (action === 'CREATE_TOKEN_SET' ? { data: { id: 'set-core' } } : {}));
    mockPushTheme.mockResolvedValue({ ok: true });
  });

  it('does nothing for other storage providers', async () => {
    setState({ provider: StorageProviderType.GITHUB });

    await setTokensFromVariables(dispatch)({} as any, {});

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockPushTheme).not.toHaveBeenCalled();
  });

  it('creates missing token sets, reuses existing ones and batch-creates the tokens', async () => {
    setState();

    await setTokensFromVariables(dispatch)({} as any, {});

    const createSet = mockPush.mock.calls.filter(([args]: any) => args.action === 'CREATE_TOKEN_SET');
    expect(createSet).toHaveLength(1);
    expect(createSet[0][0].data).toEqual({ name: 'core' });
    expect(dispatch.tokenState.setTokenSetMetadata).toHaveBeenCalledWith(expect.objectContaining({
      core: expect.objectContaining({ id: 'set-core', fromVariableImport: true }),
      existing: expect.objectContaining({ id: 'set-existing' }),
    }));

    const batch = mockPush.mock.calls.find(([args]: any) => args.action === 'BATCH_CREATE_TOKENS');
    expect(batch?.[0].data).toEqual([
      expect.objectContaining({ name: 'color.primary', token_set_id: 'set-core' }),
      expect.objectContaining({ name: 'space.sm', token_set_id: 'set-existing' }),
    ]);
  });

  it('reuses the set ids from the last Studio pull when tokenSetMetadata was never filled', async () => {
    // The state of a session whose Studio data came in without replacing the local tokens:
    // tokenSetMetadata is empty while the sets already exist in Studio.
    mockGetState.mockReturnValue({
      uiState: { api: { provider: StorageProviderType.TOKENS_STUDIO_OAUTH, id: 'project-1', changeSetId: 'change-set-1' } },
      tokenState: {
        importedTokens: {
          newTokens: [
            {
              name: 'color.new', value: '#ffffff', type: 'color', parent: 'Colors/Light',
            },
            {
              name: 'Foo', value: '#0099ff', type: 'color', parent: 'New/NEWONE',
            },
          ],
        },
        tokenSetMetadata: {},
        remoteData: { metadata: { tokenSetsData: { 'Colors/Light': { id: 'set-light', isDynamic: false } } } },
        importedThemes: { newThemes: [], updatedThemes: [] },
      },
    } as any);

    await setTokensFromVariables(dispatch)({} as any, {});

    const createSet = mockPush.mock.calls.filter(([args]: any) => args.action === 'CREATE_TOKEN_SET');
    // Only the set Studio doesn't have yet; creating 'Colors/Light' again would be refused as a duplicate.
    expect(createSet.map(([args]: any) => args.data)).toEqual([{ name: 'New/NEWONE' }]);
    expect(dispatch.tokenState.setTokenSetMetadata).toHaveBeenCalledWith(expect.objectContaining({
      'Colors/Light': expect.objectContaining({ id: 'set-light', fromVariableImport: true }),
    }));
    const batch = mockPush.mock.calls.find(([args]: any) => args.action === 'BATCH_CREATE_TOKENS');
    expect(batch?.[0].data).toEqual([
      expect.objectContaining({ name: 'color.new', token_set_id: 'set-light' }),
      expect.objectContaining({ name: 'Foo', token_set_id: 'set-core' }),
    ]);
  });

  it('renames the set and theme group in Studio for a renamed collection and mode', async () => {
    // A live state, so the ids written by the rename are found by the steps after it.
    const state: any = {
      uiState: { api: { provider: StorageProviderType.TOKENS_STUDIO_OAUTH, id: 'project-1', changeSetId: 'change-set-1' } },
      tokenState: {
        renamedCollections: [['Brand/Dark', 'BrandCore/Night']],
        tokens: { 'Brand/Dark': [{ name: 'color.primary', value: '#66b2ff', type: 'color' }] },
        themes: [{ id: 'theme-dark', name: 'Dark', group: 'Brand' }],
        importedTokens: {
          newTokens: [
            // Moved with the set: Studio has it already.
            {
              name: 'color.primary', value: '#66b2ff', type: 'color', parent: 'BrandCore/Night',
            },
            {
              name: 'color.new', value: '#000000', type: 'color', parent: 'BrandCore/Night',
            },
          ],
        },
        tokenSetMetadata: {},
        remoteData: {
          metadata: {
            tokenSetsData: { 'Brand/Dark': { id: 'set-dark', isDynamic: false } },
            themeGroupsData: { Brand: { id: 'group-brand' } },
          },
        },
        importedThemes: { newThemes: [], updatedThemes: [{ id: 'theme-dark', name: 'Night', group: 'BrandCore' }] },
      },
    };
    mockGetState.mockImplementation(() => state);
    dispatch.tokenState.setTokenSetMetadata.mockImplementation((metadata: any) => { state.tokenState.tokenSetMetadata = metadata; });
    dispatch.tokenState.setRemoteMetadata = jest.fn((metadata: any) => { state.tokenState.remoteData.metadata = metadata; });
    mockPush.mockImplementation(async () => ({ data: {} }));

    await setTokensFromVariables(dispatch)({} as any, {});

    const actions = mockPush.mock.calls.map(([args]: any) => args.action);
    expect(actions).not.toContain('CREATE_TOKEN_SET');
    expect(mockPush.mock.calls.find(([args]: any) => args.action === 'UPDATE_TOKEN_SET')?.[0].data)
      .toEqual({ id: 'set-dark', name: 'BrandCore/Night' });
    expect(mockPush.mock.calls.find(([args]: any) => args.action === 'BATCH_CREATE_TOKENS')?.[0].data)
      .toEqual([expect.objectContaining({ name: 'color.new', token_set_id: 'set-dark' })]);
    expect(mockPush.mock.calls.find(([args]: any) => args.action === 'UPDATE_THEME_GROUP')?.[0].data)
      .toEqual({ id: 'group-brand', name: 'BrandCore' });
    expect(state.tokenState.remoteData.metadata.themeGroupsData).toEqual({ BrandCore: { id: 'group-brand' } });
    // The theme update that follows goes to the renamed group.
    expect(mockPushTheme).toHaveBeenCalledWith(expect.objectContaining({ id: 'theme-dark', group: 'BrandCore' }), expect.anything(), dispatch, expect.anything());
  });

  it('pushes the themes after the token sets, new ones without their local id', async () => {
    setState();

    await setTokensFromVariables(dispatch)({} as any, {});

    expect(mockPushTheme).toHaveBeenCalledTimes(2);
    expect(mockPushTheme.mock.calls[0][0]).toEqual(expect.objectContaining({ name: 'dark', id: undefined }));
    expect(mockPushTheme.mock.calls[1][0]).toEqual(expect.objectContaining({ name: 'light', id: 'server-id' }));
    expect(mockPushTheme.mock.calls[0][3]).toEqual({ notifyOnFailure: false });
    expect(mockNotifyFailures).toHaveBeenCalledWith([]);
  });

  it('reports every refused theme in one message', async () => {
    setState();
    const reason = 'Your plan includes 2 options per theme group. Upgrade to add more.';
    mockPushTheme
      .mockResolvedValueOnce({ ok: false, failure: { themeName: 'dark', action: 'create', reason } })
      .mockResolvedValueOnce({ ok: false, failure: { themeName: 'light', action: 'update', reason } });

    await setTokensFromVariables(dispatch)({} as any, {});

    expect(mockNotifyFailures).toHaveBeenCalledTimes(1);
    expect(mockNotifyFailures).toHaveBeenCalledWith([
      { themeName: 'dark', action: 'create', reason },
      { themeName: 'light', action: 'update', reason },
    ]);
  });

  it('pushes nothing without a change set, which the API requires', async () => {
    setState({ changeSetId: '' });

    await setTokensFromVariables(dispatch)({} as any, {});

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockPushTheme).not.toHaveBeenCalled();
  });
});
