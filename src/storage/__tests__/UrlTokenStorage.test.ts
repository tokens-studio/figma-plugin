import { ErrorMessages } from '@/constants/ErrorMessages';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { UrlTokenStorage } from '../UrlTokenStorage';

describe('Test URLTokenStorage', () => {
  const urlTokenStorage = new UrlTokenStorage('', '');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return validation error when the content(s) are invalid', async () => {
    global.fetch = jest.fn(() => (
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(''),
      }) as Promise<Response>
    ));

    const result = await urlTokenStorage.read();
    expect(result).toEqual({
      errorMessage: ErrorMessages.VALIDATION_ERROR,
    });
  });

  it('should return themes and token sets', async () => {
    global.fetch = jest.fn(() => (
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          values: {
            global: {
              colors: {
                background: {
                  type: 'color',
                  value: '#000000',
                },
              },
            },
            light: {
              colors: {
                background: {
                  type: 'color',
                  value: '#ffffff',
                },
              },
            },
          },
          $themes: [{
            id: 'light',
            name: 'Light',
            selectedTokenSets: {
              global: TokenSetStatus.SOURCE,
              light: TokenSetStatus.ENABLED,
            },
          }],
          $metadata: {
            tokenSetOrder: ['light', 'global'],
          },
        }),
      }) as Promise<Response>
    ));

    const result = await urlTokenStorage.read();

    expect(result).toEqual([
      {
        type: 'themes',
        path: '$themes.json',
        data: [
          {
            id: 'light',
            name: 'Light',
            selectedTokenSets: {
              global: TokenSetStatus.SOURCE,
              light: TokenSetStatus.ENABLED,
            },
          },
        ],
      },
      {
        data: {
          tokenSetOrder: ['light', 'global'],
        },
        path: '$metadata.json',
        type: 'metadata',
      },
      {
        name: 'global',
        type: 'tokenSet',
        path: 'global.json',
        data: {
          colors: {
            background: {
              type: 'color',
              value: '#000000',
            },
          },
        },
      },
      {
        name: 'light',
        type: 'tokenSet',
        path: 'light.json',
        data: {
          colors: {
            background: {
              type: 'color',
              value: '#ffffff',
            },
          },
        },
      },
    ]);

    global.fetch = jest.fn(() => (
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          values: {
            global: {
              colors: {
                background: {
                  type: 'color',
                  value: '#000000',
                },
              },
            },
            light: {
              colors: {
                background: {
                  type: 'color',
                  value: '#ffffff',
                },
              },
            },
          },
        }),
      }) as Promise<Response>
    ));

    const result2 = await urlTokenStorage.read();

    expect(result2).toEqual([
      {
        type: 'themes',
        path: '$themes.json',
        data: [],
      },
      {
        data: {},
        path: '$metadata.json',
        type: 'metadata',
      },
      {
        name: 'global',
        type: 'tokenSet',
        path: 'global.json',
        data: {
          colors: {
            background: {
              type: 'color',
              value: '#000000',
            },
          },
        },
      },
      {
        name: 'light',
        type: 'tokenSet',
        path: 'light.json',
        data: {
          colors: {
            background: {
              type: 'color',
              value: '#ffffff',
            },
          },
        },
      },
    ]);
  });

  it('should return empty array when fetching data fail', async () => {
    global.fetch = jest.fn(() => (
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve(''),
      }) as Promise<Response>
    ));

    const result = await urlTokenStorage.read();
    expect(result).toEqual([]);
  });

  it('should support a mixed schema', async () => {
    global.fetch = jest.fn(() => (
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          global: {
            colors: {
              background: {
                type: 'color',
                value: '#000000',
              },
            },
          },
          light: {
            colors: {
              background: {
                type: 'color',
                value: '#ffffff',
              },
            },
          },
          $themes: [{
            id: 'light',
            name: 'Light',
            selectedTokenSets: {
              global: TokenSetStatus.SOURCE,
              light: TokenSetStatus.ENABLED,
            },
          }],
          $metadata: {
            tokenSetOrder: ['light', 'global'],
          },
        }),
      }) as Promise<Response>
    ));

    const result = await urlTokenStorage.read();

    expect(result).toEqual([
      {
        type: 'themes',
        path: '$themes.json',
        data: [
          {
            id: 'light',
            name: 'Light',
            selectedTokenSets: {
              global: TokenSetStatus.SOURCE,
              light: TokenSetStatus.ENABLED,
            },
          },
        ],
      },
      {
        data: {
          tokenSetOrder: ['light', 'global'],
        },
        path: '$metadata.json',
        type: 'metadata',
      },
      {
        name: 'global',
        type: 'tokenSet',
        path: 'global.json',
        data: {
          colors: {
            background: {
              type: 'color',
              value: '#000000',
            },
          },
        },
      },
      {
        name: 'light',
        type: 'tokenSet',
        path: 'light.json',
        data: {
          colors: {
            background: {
              type: 'color',
              value: '#ffffff',
            },
          },
        },
      },
    ]);
  });

  it('should not write', async () => {
    await expect(urlTokenStorage.write()).rejects.toThrow('Not implemented');
  });
});
