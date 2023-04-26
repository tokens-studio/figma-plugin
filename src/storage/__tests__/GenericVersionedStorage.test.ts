import { TokenTypes } from '@/constants/TokenTypes';
import * as pjs from '../../../package.json';
import { mockFetch } from '../../../tests/__mocks__/fetchMock';
import { GenericVersionedStorage } from '../GenericVersionedStorage';
import { GenericVersionedStorageFlow } from '@/types/StorageType';

describe('GenericVersionedStorage', () => {
  const url = 'https://api.example.io/v3/b';

  const defaultHeaderName = 'X-ADD-HEADER';
  const defaultHeaderValue = 'zzxxcc';

  const defaultHeaders = [{
    name: defaultHeaderName,
    value: defaultHeaderValue,
  }];

  it('can create a new bin', async () => {
    const updatedAt = new Date().toISOString();

    const headers = [{
      name: 'X-API-KEY',
      value: 'aabbccddeeff',
    }];
    await GenericVersionedStorage.create(url, updatedAt, GenericVersionedStorageFlow.READ_WRITE_CREATE, headers);
    expect(mockFetch).toBeCalledWith(url, {
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
        ['X-API-KEY', 'aabbccddeeff'],
      ]),
    });
  });

  it('should throw an error when there is an error during creation', async () => {
    const errorText = 'An error occurred';
    mockFetch.mockImplementationOnce(() => ({
      ok: false,
      statusText: errorText,
    }));
    await expect(async () => GenericVersionedStorage.create(url, '', GenericVersionedStorageFlow.READ_WRITE_CREATE)).rejects.toThrow(errorText);
  });

  it('can read GenericVersioned data', async () => {
    const unixTime = 1666785400000;
    const date = new Date(unixTime);
    mockFetch.mockImplementationOnce(() => (
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          version: '1',
          updatedAt: unixTime,
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
        }),
      })
    ));

    const storage = new GenericVersionedStorage(url, GenericVersionedStorageFlow.READ_WRITE_CREATE, defaultHeaders);
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
        updatedAt: date.toISOString(),
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

  it('can parse date as an iso string', async () => {
    const date = new Date(1666785400000);
    mockFetch.mockImplementationOnce(() => (
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          version: '1',
          updatedAt: date.toISOString(),
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
        }),
      })
    ));

    const storage = new GenericVersionedStorage(url, GenericVersionedStorageFlow.READ_WRITE_CREATE, defaultHeaders);
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
        updatedAt: date.toISOString(),
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

  it('can write to GenericVersioned endpoint', async () => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(Date.UTC(2022, 5, 15, 10, 0, 0));

    const storage = new GenericVersionedStorage(url, GenericVersionedStorageFlow.READ_WRITE_CREATE, defaultHeaders);
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

    expect(mockFetch).toBeCalledWith(url, {
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
        [defaultHeaderName, defaultHeaderValue],
      ]),
    });
  });

  it('throws on write error', async () => {
    const errorText = 'Something went wrong';
    mockFetch.mockImplementationOnce(() => ({
      ok: false,
      statusText: errorText,
    }));
    const storage = new GenericVersionedStorage(url, GenericVersionedStorageFlow.READ_WRITE_CREATE, defaultHeaders);
    await expect(async () => storage.write([])).rejects.toThrow(errorText);
  });
});
