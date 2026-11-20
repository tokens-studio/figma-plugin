import { deleteTheme } from './deleteTheme';
import { pushToTokensStudioOAuth } from '../../../providers/tokens-studio/tokensStudioOAuth';
import { store } from '@/app/store';
import { StorageProviderType } from '@/constants/StorageProviderType';

jest.mock('../../../providers/tokens-studio/tokensStudioOAuth', () => ({
  pushToTokensStudioOAuth: jest.fn(),
}));

jest.mock('@/app/store', () => ({
  store: { getState: jest.fn() },
}));

const mockPush = jest.mocked(pushToTokensStudioOAuth);
const mockGetState = jest.mocked(store.getState);

const light = { id: 'light', name: 'Light', group: 'Mode' };
const dark = { id: 'dark', name: 'Dark', group: 'Mode' };
const metadata = { themeGroupsData: { Mode: { id: 'group-1' } } };

const rootState = (themes: unknown[]) => ({
  uiState: { api: { provider: StorageProviderType.TOKENS_STUDIO_OAUTH, id: 'project-1' } },
  tokenState: { themes },
});

describe('deleteTheme', () => {
  let dispatch: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockResolvedValue({});
    dispatch = {
      tokenState: {
        removeTheme: jest.fn(),
        updateDocument: jest.fn(),
        setRemoteMetadata: jest.fn(),
      },
    };
  });

  it("removes the group in Tokens Studio when its last theme is deleted, so it doesn't use up the plan's limit", async () => {
    mockGetState.mockReturnValue({ tokenState: { themes: [], remoteData: { metadata } } } as any);

    await deleteTheme(dispatch)('light', rootState([light]));

    expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({ action: 'DELETE_THEME', data: { id: 'light' } }));
    expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({ action: 'DELETE_THEME_GROUP_IF_EMPTY', data: { id: 'group-1' } }));
    expect(dispatch.tokenState.setRemoteMetadata).toHaveBeenCalledWith({ themeGroupsData: {} });
  });

  it('keeps the group while it still has themes', async () => {
    mockGetState.mockReturnValue({ tokenState: { themes: [dark], remoteData: { metadata } } } as any);

    await deleteTheme(dispatch)('light', rootState([light, dark]));

    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('leaves the group alone when deleting the theme failed', async () => {
    mockPush.mockResolvedValueOnce(null);
    mockGetState.mockReturnValue({ tokenState: { themes: [], remoteData: { metadata } } } as any);

    await deleteTheme(dispatch)('light', rootState([light]));

    expect(mockPush).toHaveBeenCalledTimes(1);
  });
});
