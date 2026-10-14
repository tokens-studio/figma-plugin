import { setThemesFromVariables } from './setThemesFromVariables';
import { notifyThemePushFailures, pushThemeToTokensStudioOAuth } from './utils/pushThemeToTokensStudioOAuth';
import { store } from '@/app/store';
import { StorageProviderType } from '@/constants/StorageProviderType';

jest.mock('./utils/pushThemeToTokensStudioOAuth', () => ({
  pushThemeToTokensStudioOAuth: jest.fn(),
  notifyThemePushFailures: jest.fn(),
}));

jest.mock('@/app/store', () => ({
  store: { getState: jest.fn() },
}));

const mockPush = jest.mocked(pushThemeToTokensStudioOAuth);
const mockNotifyFailures = jest.mocked(notifyThemePushFailures);
const mockGetState = jest.mocked(store.getState);

const newTheme = { id: 'local-id', name: 'Dark', group: 'Colors' };
const updatedTheme = { id: 'server-id', name: 'Light', group: 'Colors' };

const setState = ({
  provider = StorageProviderType.TOKENS_STUDIO_OAUTH,
  changeSetId = 'change-set-1',
  newTokens = [],
}: { provider?: StorageProviderType; changeSetId?: string; newTokens?: any[] } = {}) => {
  mockGetState.mockReturnValue({
    uiState: { api: { provider, changeSetId, id: 'project-1' } },
    tokenState: {
      importedTokens: { newTokens },
      importedThemes: { newThemes: [newTheme], updatedThemes: [updatedTheme] },
    },
  } as any);
};

// The effect fires the pushes without awaiting them, so let the microtasks drain.
const flush = () => new Promise((resolve) => {
  setTimeout(resolve, 0);
});

describe('setThemesFromVariables', () => {
  let dispatch: any;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = { tokenState: { updateDocument: jest.fn() } };
    mockPush.mockResolvedValue({ ok: true });
  });

  it('pushes new themes without their local id, then the updated ones', async () => {
    setState();

    setThemesFromVariables(dispatch)([] as any, {});
    await flush();

    expect(dispatch.tokenState.updateDocument).toHaveBeenCalledWith({ updateRemote: true, shouldUpdateNodes: false });
    expect(mockPush).toHaveBeenCalledTimes(2);
    expect(mockPush.mock.calls[0][0]).toEqual({ ...newTheme, id: undefined });
    expect(mockPush.mock.calls[1][0]).toEqual(updatedTheme);
    expect(mockPush.mock.calls[0][3]).toEqual({ notifyOnFailure: false });
    expect(mockNotifyFailures).toHaveBeenCalledWith([]);
  });

  it('reports every refused theme in one message', async () => {
    setState();
    const reason = 'Your plan includes 2 options per theme group. Upgrade to add more.';
    mockPush
      .mockResolvedValueOnce({ ok: false, failure: { themeName: 'Dark', action: 'create', reason } })
      .mockResolvedValueOnce({ ok: false, failure: { themeName: 'Light', action: 'update', reason } });

    setThemesFromVariables(dispatch)([] as any, {});
    await flush();

    expect(mockNotifyFailures).toHaveBeenCalledTimes(1);
    expect(mockNotifyFailures).toHaveBeenCalledWith([
      { themeName: 'Dark', action: 'create', reason },
      { themeName: 'Light', action: 'update', reason },
    ]);
  });

  it.each([
    ['the provider is not Tokens Studio', { provider: StorageProviderType.GITHUB }],
    ['there is no change set', { changeSetId: '' }],
    ['tokens are being imported too, which pushes the themes instead', { newTokens: [{ parent: 'global' }] }],
  ])('pushes nothing when %s', async (_label, state) => {
    setState(state as any);

    setThemesFromVariables(dispatch)([] as any, {});
    await flush();

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockNotifyFailures).not.toHaveBeenCalled();
  });
});
