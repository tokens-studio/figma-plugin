import { ErrorMessages } from '@/constants/ErrorMessages';
import { TokenTypes } from '@/constants/TokenTypes';
import * as pjs from '../../../package.json';
import { mockFetch } from '../../../tests/__mocks__/fetchMock';
import { JSONBinTokenStorage } from '../JSONBinTokenStorage';

describe('JSONBinTokenStorage', () => {
  it('can create a new bin', async () => {
    const updatedAt = new Date().toISOString();
    await JSONBinTokenStorage.create('test', updatedAt, 'secret');
    expect(mockFetch).toBeCalledWith('https://api.jsonbin.io/v3/b', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      body: JSON.stringify({
        version: pjs.plugin_version,
        updatedAt,
        values: {
          options: {},
        },
      }, null, 2),
      headers: new Headers([
        ['Content-Type', 'application/json'],
        ['X-Master-Key', 'secret'],
        ['X-Bin-Name', 'test'],
        ['versioning', 'false'],
      ]),
    });
  });

  it('should return false when there is an error creating a new bin', async () => {
    mockFetch.mockImplementationOnce(() => ({
      ok: false,
    }));
    expect(await JSONBinTokenStorage.create('', '', '')).toEqual(false);
  });

  it('can read JSONBin data', async () => {
    mockFetch.mockImplementationOnce(() => (
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          record: {
            version: '1',
            updatedAt: '2022-06-15T10:00:00.000Z',
            values: {
              global: {
                colors: {
                  red: {
                    type: TokenTypes.COLOR,
                    value: '#ff0000',
                  },
                },
              },
            },
            $themes: [
              {
                id: 'light',
                name: 'Light',
                selectedTokenSets: {},
              },
            ],
          },
        }),
      })
    ));

    const storage = new JSONBinTokenStorage('jsonbinid', 'secret');
    const result = await storage.read();
    expect(result[0]).toEqual({
      type: 'themes',
      path: '$themes.json',
      data: [
        {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {},
        },
      ],
    });
    expect(result[1]).toEqual({
      type: 'metadata',
      path: '$metadata.json',
      data: {
        version: '1',
        updatedAt: '2022-06-15T10:00:00.000Z',
      },
    });
    expect(result[2]).toEqual({
      type: 'tokenSet',
      path: 'global.json',
      name: 'global',
      data: {
        colors: {
          red: {
            type: TokenTypes.COLOR,
            value: '#ff0000',
          },
        },
      },
    });
  });

  it('returns an empty dataset on error', async () => {
    mockFetch.mockImplementationOnce(() => (
      Promise.resolve({
        ok: false,
      })
    ));

    const storage = new JSONBinTokenStorage('jsonbinid', 'secret');
    expect(await storage.read()).toEqual([]);
  });

  it('can write to JSONBin', async () => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(Date.UTC(2022, 5, 15, 10, 0, 0));

    const storage = new JSONBinTokenStorage('jsonbinid', 'secret');
    await storage.write([
      {
        type: 'themes',
        path: '$themes.json',
        data: [
          {
            id: 'dark',
            name: 'Dark',
            selectedTokenSets: {},
          },
        ],
      },
      {
        type: 'tokenSet',
        name: 'global',
        path: 'global.json',
        data: {
          colors: {
            red: {
              type: TokenTypes.COLOR,
              value: '#ff0000',
            },
          },
        },
      },
    ]);

    expect(mockFetch).toBeCalledWith('https://api.jsonbin.io/v3/b/jsonbinid', {
      method: 'PUT',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      body: JSON.stringify({
        version: pjs.plugin_version,
        updatedAt: '2022-06-15T10:00:00.000Z',
        values: {
          global: {
            colors: {
              red: {
                type: TokenTypes.COLOR,
                value: '#ff0000',
              },
            },
          },
        },
        $themes: [
          {
            id: 'dark',
            name: 'Dark',
            selectedTokenSets: {},
          },
        ],
      }),
      headers: new Headers([
        ['Content-Type', 'application/json'],
        ['X-Master-Key', 'secret'],
      ]),
    });
  });

  it('returns false on write error', async () => {
    mockFetch.mockImplementationOnce(() => ({
      ok: false,
    }));
    const storage = new JSONBinTokenStorage('jsonbinid', 'secret');
    expect(await storage.write([])).toEqual(false);
  });

  it('should return validation error when the content(s) are invalid', async () => {
    mockFetch.mockImplementationOnce(() => (
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(''),
      })
    ));

    const storage = new JSONBinTokenStorage('jsonbinid', 'secret');
    expect(await storage.read()).toEqual({
      errorMessage: ErrorMessages.VALIDATION_ERROR,
    });
  });
});
