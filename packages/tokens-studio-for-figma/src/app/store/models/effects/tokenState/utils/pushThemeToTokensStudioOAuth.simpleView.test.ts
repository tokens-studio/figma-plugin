import { pushThemeToTokensStudioOAuth } from './pushThemeToTokensStudioOAuth';
import { pushToTokensStudioOAuth } from '@/app/store/providers/tokens-studio/tokensStudioOAuth';
import { notifyToUI } from '@/plugin/notifiers';
import { store } from '@/app/store';
import { RestApiError } from '@/utils/tokensStudio/restApi';
import { StorageProviderType } from '@/constants/StorageProviderType';

jest.mock('@/app/store/providers/tokens-studio/tokensStudioOAuth', () => ({
  pushToTokensStudioOAuth: jest.fn(),
}));
jest.mock('@/plugin/notifiers', () => ({ notifyToUI: jest.fn() }));
jest.mock('@/app/store', () => ({ store: { getState: jest.fn() } }));
jest.mock('@/app/store/useAuthStore', () => ({
  useAuthStore: { getState: () => ({ oauthTokens: { accessToken: 'token' } }) },
}));

const api = {
  provider: StorageProviderType.TOKENS_STUDIO_OAUTH, id: 'project-1', changeSetId: 'change-set-1', orgId: 'org-1',
};
const rootState = { uiState: { api } };
const newTheme = { name: 'Dark', group: 'Colors', selectedTokenSets: { 'Colors/Dark': 'enabled' } };
const localTheme = { id: 'local-id', ...newTheme };

const mockPush = jest.mocked(pushToTokensStudioOAuth);
const mockGetState = jest.mocked(store.getState);
const actions = () => mockPush.mock.calls.map(([args]) => args.action);

const setState = (simple: boolean, metadata: Record<string, any> = { themeGroupsData: {}, tokenSetsData: {} }) => {
  mockGetState.mockReturnValue({
    uiState: { api },
    tokenState: {
      remoteData: { metadata, themes: [] },
      themes: [localTheme],
      studioSimpleView: simple ? { projectId: 'project-1', active: true, collections: [] } : null,
    },
  } as any);
};

describe('pushThemeToTokensStudioOAuth and Simple view', () => {
  let dispatch: any;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = {
      tokenState: {
        removeTheme: jest.fn(), updateDocument: jest.fn(), setRemoteMetadata: jest.fn(), updateTheme: jest.fn(),
      },
    };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [] }) }) as any;
  });

  it('creates no group or theme in a Simple project, and takes the local theme back out', async () => {
    setState(true);

    const result = await pushThemeToTokensStudioOAuth(newTheme, rootState, dispatch);

    expect(result.ok).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
    expect(dispatch.tokenState.removeTheme).toHaveBeenCalledWith('local-id');
    expect(notifyToUI).toHaveBeenCalledWith(expect.stringContaining('Add the mode in Manage themes'), { error: true });
  });

  it('still saves an existing mode\'s variable references in a Simple project', async () => {
    setState(true, { themeGroupsData: { Colors: { id: 'g1' } }, tokenSetsData: { 'Colors/Dark': { id: 's-dark' } } });
    mockPush.mockResolvedValueOnce({ data: { id: 'o-dark' } });

    const result = await pushThemeToTokensStudioOAuth(
      { ...newTheme, id: 'o-dark', $figmaVariableReferences: { bg: 'VariableID:1' } },
      rootState,
      dispatch,
    );

    expect(result.ok).toBe(true);
    expect(actions()).toEqual(['UPDATE_THEME']);
    expect(mockPush.mock.calls[0][0].data).toEqual(expect.objectContaining({
      id: 'o-dark',
      theme_group_id: 'g1',
      // The selection Studio derived, sent back as it is: Studio accepts an unchanged selection.
      selected_token_sets: { 's-dark': 'enabled' },
      figma_variable_references: { bg: 'VariableID:1' },
    }));
  });

  it('deletes a collection it made when the theme is refused because the project turned Simple', async () => {
    // The plugin's copy still says Advanced; Studio already answers as a Simple project.
    setState(false);
    mockPush
      .mockResolvedValueOnce({ data: { id: 'g-new' }, meta: { theme_option_id: 'o-default', token_set_id: 's-default' } })
      .mockRejectedValueOnce(new RestApiError(422, 'This project is in Simple view: a mode is created with its own token set (create_set: true)', 'simple_view_requires_create_set'))
      .mockResolvedValueOnce({});

    const result = await pushThemeToTokensStudioOAuth(newTheme, rootState, dispatch);

    expect(result.ok).toBe(false);
    expect(mockPush.mock.calls.map(([args]) => [args.action, args.data?.id])).toEqual([
      ['CREATE_THEME_GROUP', undefined],
      ['CREATE_THEME', undefined],
      ['DELETE_THEME_GROUP', 'g-new'],
    ]);
    // The plugin's wording, not Studio's API detail.
    expect(notifyToUI).toHaveBeenCalledWith(expect.stringContaining('This project uses Simple view in Tokens Studio now'), { error: true });
    expect(notifyToUI).not.toHaveBeenCalledWith(expect.stringContaining('create_set'), expect.anything());
  });

  it('keeps today\'s cleanup in an Advanced project: the group goes only if it is empty', async () => {
    setState(false);
    mockPush
      .mockResolvedValueOnce({ data: { id: 'g-new' } })
      .mockRejectedValueOnce(new RestApiError(422, 'At least one token set must be Enabled or Source'))
      .mockResolvedValueOnce({});

    await pushThemeToTokensStudioOAuth(newTheme, rootState, dispatch);

    expect(actions()).toEqual(['CREATE_THEME_GROUP', 'CREATE_THEME', 'DELETE_THEME_GROUP_IF_EMPTY']);
    expect(notifyToUI).toHaveBeenCalledWith('Couldn\'t create theme "Dark": At least one token set must be Enabled or Source', { error: true });
  });
});
