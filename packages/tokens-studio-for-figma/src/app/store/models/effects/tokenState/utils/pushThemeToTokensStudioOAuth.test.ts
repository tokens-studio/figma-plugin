import { pushThemeToTokensStudioOAuth } from './pushThemeToTokensStudioOAuth';
import { pushToTokensStudioOAuth } from '@/app/store/providers/tokens-studio/tokensStudioOAuth';
import { notifyToUI } from '@/plugin/notifiers';
import { store } from '@/app/store';
import { RestApiError } from '@/utils/tokensStudio/restApi';
import { StorageProviderType } from '@/constants/StorageProviderType';

jest.mock('@/app/store/providers/tokens-studio/tokensStudioOAuth', () => ({
  pushToTokensStudioOAuth: jest.fn(),
}));

jest.mock('@/plugin/notifiers', () => ({
  notifyToUI: jest.fn(),
}));

jest.mock('@/app/store', () => ({
  store: { getState: jest.fn() },
}));

jest.mock('@/app/store/useAuthStore', () => ({
  useAuthStore: { getState: () => ({ oauthTokens: { accessToken: 'token' } }) },
}));

const localTheme = {
  id: 'local-hash-id', name: 'Dark', group: 'Colors', selectedTokenSets: {},
};

const rootState = {
  uiState: {
    api: {
      provider: StorageProviderType.TOKENS_STUDIO_OAUTH, id: 'project-1', changeSetId: 'change-set-1', orgId: 'org-1',
    },
  },
};

const newThemePayload = { name: 'Dark', group: 'Colors', selectedTokenSets: { global: 'enabled' } };

const mockPush = jest.mocked(pushToTokensStudioOAuth);
const mockGetState = jest.mocked(store.getState);

const pushCalls = (action: string) => mockPush.mock.calls.filter(([args]) => args.action === action);

const setStoreState = (themeGroupsData: Record<string, { id: string }> = {}) => {
  mockGetState.mockReturnValue({
    tokenState: {
      remoteData: { metadata: { themeGroupsData, tokenSetsData: {} } },
      themes: [localTheme],
    },
  } as any);
};

describe('pushThemeToTokensStudioOAuth', () => {
  let dispatch: any;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = {
      tokenState: {
        removeTheme: jest.fn(),
        updateDocument: jest.fn(),
        setRemoteMetadata: jest.fn(),
        updateTheme: jest.fn(),
      },
    };
    setStoreState();
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [] }) }) as any;
  });

  it('reports the plan limit and takes the theme back out when the theme group is refused', async () => {
    mockPush.mockRejectedValueOnce(new RestApiError(422, 'Your plan includes 1 theme group. Upgrade to add more.', 'theme_group_limit_reached'));

    await pushThemeToTokensStudioOAuth(newThemePayload, rootState, dispatch);

    expect(notifyToUI).toHaveBeenCalledWith(
      'Couldn\'t create theme group "Colors": Your plan includes 1 theme group. Upgrade to add more.',
      { error: true },
    );
    expect(dispatch.tokenState.removeTheme).toHaveBeenCalledWith('local-hash-id');
    expect(pushCalls('CREATE_THEME')).toHaveLength(0);
  });

  it('reports the plan limit and takes the theme back out when the theme option is refused', async () => {
    setStoreState({ Colors: { id: 'group-1' } });
    mockPush.mockRejectedValueOnce(new RestApiError(422, 'Your plan includes 2 options per theme group. Upgrade to add more.', 'theme_option_limit_reached'));

    await pushThemeToTokensStudioOAuth(newThemePayload, rootState, dispatch);

    expect(pushCalls('CREATE_THEME')).toHaveLength(1);
    expect(notifyToUI).toHaveBeenCalledWith(
      'Couldn\'t create theme "Dark": Your plan includes 2 options per theme group. Upgrade to add more.',
      { error: true },
    );
    expect(dispatch.tokenState.removeTheme).toHaveBeenCalledWith('local-hash-id');
    expect(dispatch.tokenState.updateTheme).not.toHaveBeenCalled();
  });

  it('keeps using the existing group when the name is already taken', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ id: 'existing-group', attributes: { name: 'Colors' } }] }),
    }) as any;
    // A name clash resolves to null rather than throwing.
    mockPush.mockResolvedValueOnce(null).mockResolvedValueOnce({ data: { id: 'server-theme-id' } });

    await pushThemeToTokensStudioOAuth(newThemePayload, rootState, dispatch);

    expect(dispatch.tokenState.setRemoteMetadata).toHaveBeenCalledWith(expect.objectContaining({
      themeGroupsData: { Colors: { id: 'existing-group' } },
    }));
    expect(pushCalls('CREATE_THEME')[0][0].data.theme_group_id).toBe('existing-group');
    expect(dispatch.tokenState.removeTheme).not.toHaveBeenCalled();
    expect(notifyToUI).not.toHaveBeenCalled();
  });

  it('does not push an ungrouped theme when the group id cannot be resolved', async () => {
    mockPush.mockResolvedValueOnce(null);

    await pushThemeToTokensStudioOAuth(newThemePayload, rootState, dispatch);

    expect(notifyToUI).toHaveBeenCalledWith(
      'Couldn\'t find or create theme group "Colors" in Tokens Studio.',
      { error: true },
    );
    expect(pushCalls('CREATE_THEME')).toHaveLength(0);
    expect(dispatch.tokenState.removeTheme).toHaveBeenCalledWith('local-hash-id');
  });

  it('reports a refused edit but keeps the local change', async () => {
    setStoreState({ Colors: { id: 'group-1' } });
    mockPush.mockRejectedValueOnce(new RestApiError(422, 'Theme name is required'));

    await pushThemeToTokensStudioOAuth({ ...newThemePayload, id: 'server-theme-id' }, rootState, dispatch);

    expect(pushCalls('UPDATE_THEME')).toHaveLength(1);
    expect(notifyToUI).toHaveBeenCalledWith(
      'Couldn\'t update theme "Dark": Theme name is required',
      { error: true },
    );
    expect(dispatch.tokenState.removeTheme).not.toHaveBeenCalled();
  });

  it('swaps in the server id when the theme is created', async () => {
    setStoreState({ Colors: { id: 'group-1' } });
    mockPush.mockResolvedValueOnce({ data: { id: 'server-theme-id' } });

    await pushThemeToTokensStudioOAuth(newThemePayload, rootState, dispatch);

    expect(dispatch.tokenState.updateTheme).toHaveBeenCalledWith({
      oldId: 'local-hash-id',
      theme: expect.objectContaining({ id: 'server-theme-id' }),
    });
    expect(dispatch.tokenState.removeTheme).not.toHaveBeenCalled();
    expect(notifyToUI).not.toHaveBeenCalled();
  });

  it('does nothing for other storage providers', async () => {
    await pushThemeToTokensStudioOAuth(newThemePayload, { uiState: { api: { provider: StorageProviderType.GITHUB } } }, dispatch);

    expect(mockPush).not.toHaveBeenCalled();
  });
});
