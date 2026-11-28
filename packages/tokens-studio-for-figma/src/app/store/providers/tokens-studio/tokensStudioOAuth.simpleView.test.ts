import { store } from '@/app/store';
import { useAuthStore } from '@/app/store/useAuthStore';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { fetchProjectDataRest } from '@/utils/tokensStudio/fetchProjectDataRest';
import { notifyToUI } from '@/plugin/notifiers';
import { pushToTokensStudioOAuth, reloadStudioProject } from './tokensStudioOAuth';

jest.mock('@/utils/tokensStudio/fetchProjectDataRest', () => ({ fetchProjectDataRest: jest.fn() }));
jest.mock('@/plugin/notifiers', () => ({ notifyToUI: jest.fn() }));
jest.mock('@/app/store/updateSources', () => jest.fn());
jest.spyOn(console, 'error').mockImplementation(() => {});

const api = {
  provider: StorageProviderType.TOKENS_STUDIO_OAUTH, id: 'p1', orgId: 'o1', branch: 'main', changeSetId: 'cs1', name: 'Northwind',
} as any;

const simpleProject = {
  tokens: {
    'Color-mode/Light': [{
      name: 'bg', value: '#fff', type: 'color', $extensions: { id: 't1' },
    }],
    'Color-mode/Dark': [],
  },
  themes: [
    {
      id: 'o-light', name: 'Light', group: 'Color-mode', selectedTokenSets: { 'Color-mode/Light': 'enabled' },
    },
    {
      id: 'o-dark', name: 'Dark', group: 'Color-mode', selectedTokenSets: { 'Color-mode/Light': 'enabled', 'Color-mode/Dark': 'enabled' },
    },
  ],
  tokenSets: { 'Color-mode/Light': { id: 's-light', isDynamic: false }, 'Color-mode/Dark': { id: 's-dark', isDynamic: false } },
  themeGroups: { 'Color-mode': { id: 'g1' } },
  tokenSetOrder: ['Color-mode/Light', 'Color-mode/Dark'],
  changeSetId: 'cs1',
  simpleView: {
    projectId: 'p1',
    active: true,
    collections: [{
      id: 'g1',
      name: 'Color-mode',
      defaultModeId: 'o-light',
      modes: [
        {
          id: 'o-light', name: 'Light', tokenSetId: 's-light', tokenSetName: 'Color-mode/Light',
        },
        {
          id: 'o-dark', name: 'Dark', tokenSetId: 's-dark', tokenSetName: 'Color-mode/Dark',
        },
      ],
    }],
  },
};

function refuse(error: Record<string, unknown>) {
  global.fetch = jest.fn(async () => ({ ok: false, status: 422, json: async () => ({ errors: [error] }) })) as any;
}

describe('Tokens Studio pushes and Simple view refusals', () => {
  beforeEach(() => {
    jest.mocked(notifyToUI).mockReset();
    jest.mocked(fetchProjectDataRest).mockReset().mockResolvedValue(simpleProject as any);
    useAuthStore.setState({
      oauthTokens: {
        accessToken: 'token', refreshToken: 'refresh', tokenType: 'Bearer', expiresAt: Date.now() + 60 * 60 * 1000,
      },
    });
    store.dispatch.uiState.setApiData(api);
  });

  it('words a refused token create in the plugin\'s terms and pulls the project again', async () => {
    refuse({
      code: 'project_in_simple_mode',
      detail: 'This project is in Simple view, where every token exists in the default mode of its collection. \'fg\' isn\'t in the default mode of \'Color-mode\'. Create the token for every mode (POST theme_groups/:id/tokens) or in the default mode first.',
      meta: { rule: 'value_without_token' },
    });

    const result = await pushToTokensStudioOAuth({
      context: api,
      action: 'CREATE_TOKEN',
      data: {
        name: 'fg', value: '#111', type: 'color', token_set_id: 's-dark',
      },
    });
    await reloadStudioProject();

    expect(result).toBeNull();
    expect(notifyToUI).toHaveBeenCalledWith(expect.stringMatching(/^This project uses Simple view in Tokens Studio, where every token exists in its collection's default mode/), { error: true });
    expect(notifyToUI).not.toHaveBeenCalledWith(expect.stringContaining('POST'), expect.anything());
    expect(fetchProjectDataRest).toHaveBeenCalledWith('token', expect.any(String), 'p1', 'main');
    expect(store.getState().tokenState.studioSimpleView).toEqual(simpleProject.simpleView);
  });

  it('keeps today\'s message and pulls nothing for any other refusal', async () => {
    refuse({ code: 'theme_group_limit_reached', detail: 'Your plan includes 1 theme group. Upgrade to add more.' });

    await pushToTokensStudioOAuth({ context: api, action: 'CREATE_TOKEN', data: { name: 'fg' } });

    expect(notifyToUI).toHaveBeenCalledWith('Failed to sync: API error: 422 Your plan includes 1 theme group. Upgrade to add more.', { error: true });
    expect(fetchProjectDataRest).not.toHaveBeenCalled();
  });

  it('replaces the plugin\'s copy with the project and keeps the active themes that still exist', async () => {
    store.dispatch.tokenState.setTokenData({
      values: { 'Color-mode/Light': [], 'Brand/Default': [] } as any,
      themes: simpleProject.themes as any,
      activeTheme: { 'Color-mode': 'o-dark' },
    });

    await reloadStudioProject();

    const { tokenState } = store.getState();
    expect(Object.keys(tokenState.tokens)).toEqual(['Color-mode/Light', 'Color-mode/Dark']);
    expect(tokenState.activeTheme).toEqual({ 'Color-mode': 'o-dark' });
    expect(tokenState.tokenSetMetadata).toEqual(simpleProject.tokenSets);
    expect(tokenState.remoteData.metadata?.themeGroupsData).toEqual(simpleProject.themeGroups);
  });

  it('ignores a pull that comes back after the user switched project', async () => {
    jest.mocked(fetchProjectDataRest).mockImplementationOnce(async () => {
      store.dispatch.uiState.setApiData({ ...api, id: 'p2' });
      return simpleProject as any;
    });
    store.dispatch.tokenState.setStudioSimpleView(null);

    await reloadStudioProject();

    expect(store.getState().tokenState.studioSimpleView).toBeNull();
  });

  it('pulls once more when a reload is asked for while one runs, so a later write is not missed', async () => {
    let finishFirst: (value: any) => void = () => {};
    const withSepia = {
      ...simpleProject,
      tokens: { ...simpleProject.tokens, 'Color-mode/Sepia': [] },
    };
    jest.mocked(fetchProjectDataRest)
      .mockImplementationOnce(() => new Promise((resolve) => { finishFirst = resolve; }))
      .mockResolvedValueOnce(withSepia as any);

    const first = reloadStudioProject();
    // Two writes land while the first pull runs: one more pull covers both.
    const second = reloadStudioProject();
    const third = reloadStudioProject();
    expect(third).toBe(second);
    await Promise.resolve();
    finishFirst(simpleProject);
    await Promise.all([first, second, third]);

    expect(fetchProjectDataRest).toHaveBeenCalledTimes(2);
    expect(Object.keys(store.getState().tokenState.tokens)).toContain('Color-mode/Sepia');
  });

  it('pulls once when nothing else asks for a reload meanwhile', async () => {
    await reloadStudioProject();

    expect(fetchProjectDataRest).toHaveBeenCalledTimes(1);
  });
});
