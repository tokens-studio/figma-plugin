import { fetchProjectDataRest } from './fetchProjectDataRest';

const API = 'https://studio.test';

type Routes = Record<string, unknown | (() => Response)>;

function mockStudio(routes: Routes) {
  global.fetch = jest.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const path = url.replace(API, '').split('?')[0];
    const route = routes[path];
    if (route === undefined) {
      return {
        ok: false, status: 404, statusText: 'Not Found', json: async () => ({}),
      } as Response;
    }
    if (typeof route === 'function') return (route as () => Response)();
    return { ok: true, status: 200, json: async () => route } as Response;
  }) as any;
}

const base = (projectResponse: unknown | (() => Response)): Routes => ({
  '/api/v1/projects/p1/branches': { data: [{ id: 'b1', attributes: { name: 'main', change_set_id: 'cs1', is_default: true } }] },
  '/api/v1/projects/p1/tokens': { data: [] },
  '/api/v1/projects/p1/token_sets': {
    data: [
      { id: 's-light', attributes: { name: 'Color-mode/Light', order_index: 0 } },
      { id: 's-dark', attributes: { name: 'Color-mode/Dark', order_index: 1 } },
    ],
  },
  '/api/v1/projects/p1/theme_groups': {
    data: [{ id: 'g1', attributes: { name: 'Color-mode', order_index: 0, effective_default_theme_option_id: 'o-light' } }],
  },
  '/api/v1/projects/p1/theme_options': {
    data: [
      {
        id: 'o-light',
        attributes: {
          name: 'Light', order_index: 0, own_token_set_id: 's-light', selected_token_sets: { 's-light': 'enabled' },
        },
        relationships: { theme_group: { data: { id: 'g1' } } },
      },
      {
        id: 'o-dark',
        attributes: {
          name: 'Dark', order_index: 1, own_token_set_id: 's-dark', selected_token_sets: { 's-light': 'enabled', 's-dark': 'enabled' },
        },
        relationships: { theme_group: { data: { id: 'g1' } } },
      },
    ],
  },
  '/api/v1/projects/p1': projectResponse,
});

describe('fetchProjectDataRest: Simple view', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reads a Simple project with its collections and modes on every pull', async () => {
    mockStudio(base({ data: { id: 'p1', attributes: { name: 'Northwind', themes_simple_view_active: true } } }));

    const data = await fetchProjectDataRest('token', API, 'p1', 'main');

    expect(data?.simpleView).toEqual({
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
    });
    // The themes the plugin shows are the same as for any other project.
    expect(data?.themes.map((theme) => theme.selectedTokenSets)).toEqual([
      { 'Color-mode/Light': 'enabled' },
      { 'Color-mode/Light': 'enabled', 'Color-mode/Dark': 'enabled' },
    ]);
  });

  it('treats a project without the field as not Simple', async () => {
    mockStudio(base({ data: { id: 'p1', attributes: { name: 'Northwind' } } }));

    const data = await fetchProjectDataRest('token', API, 'p1', 'main');

    expect(data?.simpleView).toEqual({ projectId: 'p1', active: false, collections: [] });
    expect(data?.themes).toHaveLength(2);
  });

  it('keeps the pull going as not Simple when the project read fails', async () => {
    mockStudio(base(() => ({
      ok: false, status: 500, statusText: 'Server Error', json: async () => ({}),
    } as Response)));

    const data = await fetchProjectDataRest('token', API, 'p1', 'main');

    expect(data).not.toBeNull();
    expect(data?.simpleView.active).toBe(false);
  });
});
