import { notifyThemePushFailures, pushThemeToTokensStudioOAuth } from './pushThemeToTokensStudioOAuth';
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
      'Couldn\'t create theme group "Colors": the theme group could not be found or created.',
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
  it('also removes themes mirrored into extension groups', async () => {
    mockGetState.mockReturnValue({
      tokenState: {
        remoteData: { metadata: { themeGroupsData: { Colors: { id: 'group-1' } }, tokenSetsData: {} } },
        themes: [localTheme, {
          id: 'child-theme', name: 'Dark', group: 'Extended', $figmaParentThemeId: 'local-hash-id',
        }],
      },
    } as any);
    mockPush.mockRejectedValueOnce(new RestApiError(422, 'Your plan includes 2 options per theme group. Upgrade to add more.', 'theme_option_limit_reached'));

    await pushThemeToTokensStudioOAuth(newThemePayload, rootState, dispatch);

    expect(dispatch.tokenState.removeTheme).toHaveBeenCalledWith('child-theme');
    expect(dispatch.tokenState.removeTheme).toHaveBeenCalledWith('local-hash-id');
  });

  it('hands the failure back without a message when the caller reports them together', async () => {
    setStoreState({ Colors: { id: 'group-1' } });
    mockPush.mockRejectedValueOnce(new RestApiError(422, 'Your plan includes 2 options per theme group. Upgrade to add more.', 'theme_option_limit_reached'));

    const result = await pushThemeToTokensStudioOAuth(newThemePayload, rootState, dispatch, { notifyOnFailure: false });

    expect(result).toEqual({
      ok: false,
      failure: {
        themeName: 'Dark',
        action: 'create',
        reason: 'Your plan includes 2 options per theme group. Upgrade to add more.',
      },
    });
    expect(notifyToUI).not.toHaveBeenCalled();
    // The theme is still taken back out locally — only the message waits for the others.
    expect(dispatch.tokenState.removeTheme).toHaveBeenCalledWith('local-hash-id');
  });

  it('creates a theme with token set names, which is what Studio maps to ids on create', async () => {
    mockGetState.mockReturnValue({
      tokenState: {
        remoteData: {
          metadata: { themeGroupsData: { Colors: { id: 'group-1' } }, tokenSetsData: { global: { id: 'set-uuid' } } },
        },
        themes: [localTheme],
      },
    } as any);
    mockPush.mockResolvedValueOnce({ data: { id: 'server-theme-id' } });

    await pushThemeToTokensStudioOAuth(newThemePayload, rootState, dispatch);

    expect(pushCalls('CREATE_THEME')[0][0].data.selected_token_sets).toEqual({ global: 'enabled' });
  });

  it('updates a theme with token set ids', async () => {
    mockGetState.mockReturnValue({
      tokenState: {
        remoteData: {
          metadata: { themeGroupsData: { Colors: { id: 'group-1' } }, tokenSetsData: { global: { id: 'set-uuid' } } },
        },
        themes: [localTheme],
      },
    } as any);
    mockPush.mockResolvedValueOnce({ data: {} });

    await pushThemeToTokensStudioOAuth({ ...newThemePayload, id: 'server-theme-id' }, rootState, dispatch);

    expect(pushCalls('UPDATE_THEME')[0][0].data.selected_token_sets).toEqual({ 'set-uuid': 'enabled' });
  });

  it('finds the existing group when the plan limit refuses re-creating it, and saves the edit', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ id: 'existing-group', attributes: { name: 'Colors' } }] }),
    }) as any;
    mockPush
      .mockRejectedValueOnce(new RestApiError(422, 'Your plan includes 1 theme group. Upgrade to add more.', 'theme_group_limit_reached'))
      .mockResolvedValueOnce({ data: {} });

    const result = await pushThemeToTokensStudioOAuth({ ...newThemePayload, id: 'server-theme-id' }, rootState, dispatch);

    expect(result).toEqual({ ok: true });
    expect(pushCalls('UPDATE_THEME')[0][0].data.theme_group_id).toBe('existing-group');
    expect(notifyToUI).not.toHaveBeenCalled();
  });

  it('refuses an ungrouped theme up front instead of sending it', async () => {
    const result = await pushThemeToTokensStudioOAuth({ name: 'Dark', selectedTokenSets: {} }, rootState, dispatch);

    expect(result.ok).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('rolls back the new theme, not an earlier synced theme with the same name', async () => {
    const syncedTheme = { ...localTheme, id: 'server-dark' };
    mockGetState.mockReturnValue({
      tokenState: {
        remoteData: { metadata: { themeGroupsData: { Colors: { id: 'group-1' } }, tokenSetsData: {} }, themes: [syncedTheme] },
        themes: [syncedTheme, localTheme],
      },
    } as any);
    mockPush.mockRejectedValueOnce(new RestApiError(422, "A theme option with the name 'Dark' already exists in this theme group"));

    await pushThemeToTokensStudioOAuth(newThemePayload, rootState, dispatch);

    expect(dispatch.tokenState.removeTheme).toHaveBeenCalledWith('local-hash-id');
    expect(dispatch.tokenState.removeTheme).not.toHaveBeenCalledWith('server-dark');
  });

  it('removes a group it created when the theme for it is refused', async () => {
    mockPush
      .mockResolvedValueOnce({ data: { id: 'new-group' } })
      .mockRejectedValueOnce(new RestApiError(422, 'At least one token set must be enabled'));

    await pushThemeToTokensStudioOAuth(newThemePayload, rootState, dispatch);

    expect(pushCalls('DELETE_THEME_GROUP_IF_EMPTY')[0][0].data).toEqual({ id: 'new-group' });
    expect(dispatch.tokenState.removeTheme).toHaveBeenCalledWith('local-hash-id');
  });
});

describe('notifyThemePushFailures', () => {
  const failure = (themeName: string, reason: string) => ({ themeName, action: 'create' as const, reason });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('says nothing when every theme was saved', () => {
    notifyThemePushFailures([]);
    expect(notifyToUI).not.toHaveBeenCalled();
  });

  it('names the theme when only one failed', () => {
    notifyThemePushFailures([failure('Dark', 'Your plan includes 2 options per theme group. Upgrade to add more.')]);

    expect(notifyToUI).toHaveBeenCalledTimes(1);
    expect(notifyToUI).toHaveBeenCalledWith(
      'Couldn\'t create theme "Dark": Your plan includes 2 options per theme group. Upgrade to add more.',
      { error: true },
    );
  });

  it('sums up an import where several themes hit the same limit', () => {
    const reason = 'Your plan includes 2 options per theme group. Upgrade to add more.';
    notifyThemePushFailures([failure('Dark', reason), failure('Light', reason), failure('Dim', reason)]);

    expect(notifyToUI).toHaveBeenCalledTimes(1);
    expect(notifyToUI).toHaveBeenCalledWith(
      `Couldn't save 3 themes in Tokens Studio: ${reason}`,
      { error: true },
    );
  });

  it('leads with the first reason when they differ', () => {
    notifyThemePushFailures([failure('Dark', 'Limit reached.'), failure('Light', 'Theme name is required')]);

    expect(notifyToUI).toHaveBeenCalledTimes(1);
    expect(notifyToUI).toHaveBeenCalledWith(
      'Couldn\'t save 2 themes in Tokens Studio. First problem: Limit reached.',
      { error: true },
    );
  });
});
