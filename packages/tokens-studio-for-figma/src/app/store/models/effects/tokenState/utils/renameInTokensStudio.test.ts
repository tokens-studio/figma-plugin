import {
  renameThemeGroupsInTokensStudio, renameTokenSetsInTokensStudio, updateTokensInTokensStudio,
} from './renameInTokensStudio';
import { pushToTokensStudioOAuth } from '@/app/store/providers/tokens-studio/tokensStudioOAuth';
import { store } from '@/app/store';

jest.mock('@/app/store/providers/tokens-studio/tokensStudioOAuth', () => ({
  pushToTokensStudioOAuth: jest.fn(),
}));

jest.mock('@/app/store', () => ({
  store: { getState: jest.fn() },
}));

const mockPush = jest.mocked(pushToTokensStudioOAuth);
const mockGetState = jest.mocked(store.getState);
const context = { id: 'project-1', changeSetId: 'change-set-1' };

const setState = (tokenState: Record<string, unknown>) => mockGetState.mockReturnValue({ tokenState } as any);
const pushed = (action: string) => mockPush.mock.calls.filter(([args]: any) => args.action === action).map(([args]: any) => args.data);

describe('renameTokenSetsInTokensStudio', () => {
  let dispatch: any;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = { tokenState: { setTokenSetMetadata: jest.fn() } };
  });

  it('renames a set Studio has under the old name and moves its id in tokenSetMetadata', async () => {
    setState({ tokenSetMetadata: { 'Brand/Dark': { id: 'set-dark', isDynamic: false }, core: { id: 'set-core' } }, remoteData: {} });
    mockPush.mockResolvedValue({ data: {} });

    const renamed = await renameTokenSetsInTokensStudio(context, [['Brand/Dark', 'Brand/Night']], dispatch);

    expect(renamed).toEqual([['Brand/Dark', 'Brand/Night']]);
    expect(pushed('UPDATE_TOKEN_SET')).toEqual([{ id: 'set-dark', name: 'Brand/Night' }]);
    expect(dispatch.tokenState.setTokenSetMetadata).toHaveBeenCalledWith({
      core: { id: 'set-core' }, 'Brand/Night': { id: 'set-dark', isDynamic: false },
    });
  });

  it('leaves sets alone that Studio doesn\'t have, or whose new name is taken', async () => {
    setState({
      tokenSetMetadata: {},
      remoteData: { metadata: { tokenSetsData: { 'Brand/Dark': { id: 'set-dark' }, 'Brand/Night': { id: 'set-night' } } } },
    });

    const renamed = await renameTokenSetsInTokensStudio(context, [['Missing/Set', 'Missing/Renamed'], ['Brand/Dark', 'Brand/Night']], dispatch);

    expect(renamed).toEqual([]);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('reports no rename when Studio refuses it', async () => {
    setState({ tokenSetMetadata: { 'Brand/Dark': { id: 'set-dark' } }, remoteData: {} });
    mockPush.mockResolvedValue(null);

    await expect(renameTokenSetsInTokensStudio(context, [['Brand/Dark', 'Brand/Night']], dispatch)).resolves.toEqual([]);
    expect(dispatch.tokenState.setTokenSetMetadata).not.toHaveBeenCalled();
  });
});

describe('renameThemeGroupsInTokensStudio', () => {
  let dispatch: any;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = { tokenState: { setRemoteMetadata: jest.fn() } };
  });

  const previousThemes = [{ id: 'theme-1', name: 'Light', group: 'Brand' }, { id: 'theme-2', name: 'Dark', group: 'Brand' }] as any;
  const renamedThemes = [{ id: 'theme-1', name: 'Light', group: 'Brand Core' }, { id: 'theme-2', name: 'Dark', group: 'Brand Core' }] as any;

  it('renames the group once, to the name Studio accepts', async () => {
    setState({ remoteData: { metadata: { themeGroupsData: { Brand: { id: 'group-1' }, Other: { id: 'group-2' } } } } });
    mockPush.mockResolvedValue({ data: {} });

    await renameThemeGroupsInTokensStudio(context, previousThemes, renamedThemes, dispatch);

    expect(pushed('UPDATE_THEME_GROUP')).toEqual([{ id: 'group-1', name: 'Brand-Core' }]);
    expect(dispatch.tokenState.setRemoteMetadata).toHaveBeenCalledWith({
      themeGroupsData: { Other: { id: 'group-2' }, 'Brand-Core': { id: 'group-1' } },
    });
  });

  it('does nothing for themes that kept their group or are new', async () => {
    setState({ remoteData: { metadata: { themeGroupsData: { Brand: { id: 'group-1' } } } } });

    await renameThemeGroupsInTokensStudio(context, previousThemes, [
      { id: 'theme-1', name: 'Light', group: 'Brand' },
      { id: 'theme-3', name: 'New', group: 'Elsewhere' },
      { id: 'theme-2', name: 'Dark' },
    ] as any, dispatch);
    await renameThemeGroupsInTokensStudio(context, undefined, undefined, dispatch);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('leaves the group alone when Studio doesn\'t have it, already has the new one, or refuses', async () => {
    setState({ remoteData: { metadata: { themeGroupsData: { 'Brand-Core': { id: 'group-new' } } } } });
    await renameThemeGroupsInTokensStudio(context, previousThemes, renamedThemes, dispatch);
    expect(mockPush).not.toHaveBeenCalled();

    setState({ remoteData: { metadata: { themeGroupsData: { Brand: { id: 'group-1' }, 'Brand-Core': { id: 'group-new' } } } } });
    await renameThemeGroupsInTokensStudio(context, previousThemes, renamedThemes, dispatch);
    expect(mockPush).not.toHaveBeenCalled();

    setState({ remoteData: { metadata: { themeGroupsData: { Brand: { id: 'group-1' } } } } });
    mockPush.mockResolvedValue(null);
    await renameThemeGroupsInTokensStudio(context, previousThemes, renamedThemes, dispatch);
    expect(dispatch.tokenState.setRemoteMetadata).not.toHaveBeenCalled();
  });

  it('copes with no pulled metadata', async () => {
    setState({});

    await renameThemeGroupsInTokensStudio(context, previousThemes, renamedThemes, dispatch);

    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('updateTokensInTokensStudio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends nothing when there is nothing to rename or update', async () => {
    const renamed = await updateTokensInTokensStudio(context, {
      renames: [], updatedTokens: [], newTokens: [], previousTokens: {}, renamedSets: [],
    });

    expect(renamed.size).toBe(0);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('finds a token in a set this import renamed by its old set name', async () => {
    setState({ tokenSetMetadata: { 'Brand/Night': { id: 'set-night' } }, remoteData: {} });
    mockPush.mockResolvedValue({ data: {} });

    const renamed = await updateTokensInTokensStudio(context, {
      renames: [{ set: 'Brand/Night', oldName: 'color.primary', newName: 'color.brand' }],
      updatedTokens: [],
      newTokens: [],
      previousTokens: { 'Brand/Dark': [{ name: 'color.primary', $extensions: { id: 'token-primary' } }] },
      renamedSets: [['Brand/Dark', 'Brand/Night']],
    });

    // No imported token with the new name, so only the name changes.
    expect(pushed('BATCH_UPDATE_TOKENS')).toEqual([[{ token_id: 'token-primary', changes: { name: 'color.brand' } }]]);
    expect(pushed('LIST_TOKENS')).toEqual([]);
    expect(renamed.size).toBe(1);
  });

  it('skips tokens it can\'t find in Studio and tokens without a set', async () => {
    setState({ tokenSetMetadata: { 'Brand/Light': { id: 'set-light' } }, remoteData: {} });
    mockPush.mockImplementation(async ({ action }: any) => (action === 'LIST_TOKENS' ? null : { data: {} }));

    const renamed = await updateTokensInTokensStudio(context, {
      renames: [{ set: 'Brand/Light', oldName: 'gone', newName: 'renamed' }],
      updatedTokens: [{ name: 'orphan', value: 1 }, { name: 'missing', value: 2, parent: 'Brand/Light' }],
      newTokens: [],
      previousTokens: undefined,
      renamedSets: [],
    });

    expect(renamed.size).toBe(0);
    // The token list is fetched once, however many tokens it is needed for.
    expect(pushed('LIST_TOKENS')).toHaveLength(1);
    expect(pushed('BATCH_UPDATE_TOKENS')).toEqual([]);
  });
});
