import { store } from '@/app/store';
import { useAuthStore } from '@/app/store/useAuthStore';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { fetchProjectDataRest } from '@/utils/tokensStudio/fetchProjectDataRest';
import { notifyToUI } from '@/plugin/notifiers';
import type { StudioSimpleCollection } from '@/types/StudioSimpleView';
import {
  addSimpleCollection,
  addSimpleMode,
  copySimpleModeValues,
  deleteSimpleCollection,
  deleteSimpleMode,
  renameSimpleCollection,
  renameSimpleMode,
  reorderSimpleModes,
  setSimpleDefaultMode,
} from './simpleViewActions';

jest.mock('@/utils/tokensStudio/fetchProjectDataRest', () => ({ fetchProjectDataRest: jest.fn() }));
jest.mock('@/plugin/notifiers', () => ({ notifyToUI: jest.fn() }));
jest.spyOn(console, 'error').mockImplementation(() => {});

const collection: StudioSimpleCollection = {
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
};
const [light, dark] = collection.modes;

type Sent = { method: string; path: string; query: string; body: unknown };
let sent: Sent[] = [];
let respond: (request: Sent) => { status: number; body: unknown } = () => ({ status: 200, body: { data: {} } });

function mockFetch() {
  global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const request = {
      method: init?.method ?? 'GET',
      path: url.pathname,
      query: url.search,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    };
    sent.push(request);
    const { status, body } = respond(request);
    return { ok: status < 400, status, json: async () => body } as Response;
  }) as any;
}

function connect({ simple }: { simple: boolean }) {
  store.dispatch.uiState.setApiData({
    provider: StorageProviderType.TOKENS_STUDIO_OAUTH, id: 'p1', orgId: 'o1', branch: 'main', changeSetId: 'cs1', name: 'Northwind',
  } as any);
  store.dispatch.tokenState.setStudioSimpleView({ projectId: 'p1', active: simple, collections: simple ? [collection] : [] });
}

const writes = () => sent.map(({ method, path, body }) => [method, path, body]);

describe('Simple view theme management', () => {
  beforeEach(() => {
    sent = [];
    respond = () => ({ status: 200, body: { data: {} } });
    mockFetch();
    jest.mocked(notifyToUI).mockReset();
    jest.mocked(fetchProjectDataRest).mockReset().mockResolvedValue(null);
    useAuthStore.setState({
      oauthTokens: {
        accessToken: 'token', refreshToken: 'refresh', tokenType: 'Bearer', expiresAt: Date.now() + 60 * 60 * 1000,
      },
    });
    connect({ simple: true });
  });

  it('adds a collection, then pulls the project for its Default mode and set', async () => {
    await addSimpleCollection('Density');

    expect(writes()).toEqual([['POST', '/api/v1/projects/p1/theme_groups', { theme_group: { name: 'Density' } }]]);
    expect(sent[0].query).toBe('?change_set_id=cs1');
    expect(fetchProjectDataRest).toHaveBeenCalledWith('token', expect.any(String), 'p1', 'main');
    expect(notifyToUI).toHaveBeenCalledWith('Added collection "Density" to Tokens Studio');
  });

  it('marks a write pending until the pull after it is done, also when Studio refuses it', async () => {
    let pendingDuringPull: boolean | undefined;
    jest.mocked(fetchProjectDataRest).mockImplementation(async () => {
      pendingDuringPull = store.getState().tokenState.studioSimpleWritePending;
      return null as any;
    });

    const write = addSimpleMode(collection, 'Sepia');
    expect(store.getState().tokenState.studioSimpleWritePending).toBe(true);
    await write;
    expect(pendingDuringPull).toBe(true);
    expect(store.getState().tokenState.studioSimpleWritePending).toBe(false);

    respond = () => ({ status: 422, body: { errors: [{ code: 'taken', detail: 'Name is taken' }] } });
    await addSimpleMode(collection, 'Sepia');
    expect(store.getState().tokenState.studioSimpleWritePending).toBe(false);
  });

  it('adds a mode with its own set, never seeded from another mode', async () => {
    await addSimpleMode(collection, 'High contrast');

    expect(writes()).toEqual([[
      'POST', '/api/v1/projects/p1/theme_options',
      { theme_option: { theme_group_id: 'g1', name: 'High contrast', create_set: true } },
    ]]);
  });

  it('renames and deletes collections and modes', async () => {
    await renameSimpleCollection(collection, 'Appearance');
    await deleteSimpleCollection(collection);
    await renameSimpleMode(dark, 'Night');
    await deleteSimpleMode(dark);

    expect(writes()).toEqual([
      ['PATCH', '/api/v1/projects/p1/theme_groups/g1', { theme_group: { name: 'Appearance' } }],
      ['DELETE', '/api/v1/projects/p1/theme_groups/g1', undefined],
      ['PATCH', '/api/v1/projects/p1/theme_options/o-dark', { theme_option: { name: 'Night' } }],
      ['DELETE', '/api/v1/projects/p1/theme_options/o-dark', undefined],
    ]);
  });

  it('picks the default mode', async () => {
    await setSimpleDefaultMode(collection, dark);

    expect(writes()).toEqual([
      ['PATCH', '/api/v1/projects/p1/theme_groups/g1', { theme_group: { default_theme_option_id: 'o-dark' } }],
    ]);
  });

  it('reorders modes, and a mode moved to the top becomes the default', async () => {
    await reorderSimpleModes(collection, ['o-dark', 'o-light']);

    expect(writes()).toEqual([
      ['PATCH', '/api/v1/projects/p1/theme_options/reorder', { theme_group_id: 'g1', ordered_ids: ['o-dark', 'o-light'] }],
      ['PATCH', '/api/v1/projects/p1/theme_groups/g1', { theme_group: { default_theme_option_id: 'o-dark' } }],
    ]);
  });

  it('reorders below the default without touching it', async () => {
    await reorderSimpleModes({ ...collection, modes: [...collection.modes, { id: 'o-hc', name: 'HC' }] }, ['o-light', 'o-hc', 'o-dark']);

    expect(writes().map(([method, path]) => `${method} ${path}`)).toEqual(['PATCH /api/v1/projects/p1/theme_options/reorder']);
  });

  it('copies the values of one mode into another', async () => {
    respond = () => ({ status: 200, body: { data: { written_count: 12 } } });

    await copySimpleModeValues(dark, light);

    expect(writes()).toEqual([['POST', '/api/v1/projects/p1/theme_options/o-dark/copy_values', { from_option_id: 'o-light' }]]);
    expect(notifyToUI).toHaveBeenCalledWith('Copied 12 values from "Light" to "Dark"');
  });

  it('words a Studio refusal in the plugin\'s terms and pulls the project again', async () => {
    respond = () => ({
      status: 422,
      body: {
        errors: [{
          code: 'project_not_in_simple_view',
          detail: 'Editing a token in every mode at once needs a project in Simple view. Edit each token with PATCH tokens/:id instead.',
        }],
      },
    });

    const ok = await addSimpleMode(collection, 'Sepia');

    expect(ok).toBe(false);
    expect(notifyToUI).toHaveBeenCalledWith(
      'Couldn\'t add mode "Sepia": This project no longer uses Simple view in Tokens Studio. The project was reloaded: try again.',
      { error: true },
    );
    expect(notifyToUI).not.toHaveBeenCalledWith(expect.stringContaining('PATCH'), expect.anything());
    expect(fetchProjectDataRest).toHaveBeenCalled();
  });

  it('shows Studio\'s own detail for other refusals, such as a name it doesn\'t take', async () => {
    respond = () => ({ status: 422, body: { errors: [{ detail: 'Theme group name must contain only letters, numbers, and hyphens' }] } });

    await addSimpleCollection('Color mode');

    expect(notifyToUI).toHaveBeenCalledWith(
      'Couldn\'t add collection "Color mode": Theme group name must contain only letters, numbers, and hyphens',
      { error: true },
    );
  });

  it('sends nothing for a project that isn\'t in Simple view', async () => {
    connect({ simple: false });

    expect(await addSimpleCollection('Density')).toBe(false);
    expect(await addSimpleMode(collection, 'HC')).toBe(false);
    expect(await reorderSimpleModes(collection, ['o-dark', 'o-light'])).toBe(false);
    expect(sent).toEqual([]);
  });
});
