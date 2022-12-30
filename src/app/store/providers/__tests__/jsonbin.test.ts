import { ThemeObjectsList } from '@/types';
import { StorageTypeCredentials } from '@/types/StorageType';
import { SingleToken } from '@/types/tokens';
import { updateJSONBinTokens } from '../jsonbin';
import * as pjs from '../../../../../package.json';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { createMockStore } from '../../../../../tests/config/setupTest';

const mockRetrieve = jest.fn();
const mockSave = jest.fn();

jest.mock('../../../../storage/JSONBinTokenStorage', () => ({
  JSONBinTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
      save: mockSave,
    }
  )),
}));

jest.mock('../../../../plugin/notifiers', (() => ({
  notifyToUI: jest.fn(),
})));

describe('jsonbin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const tokens = {
    global: [
      {
        value: '#ffffff',
        type: 'color',
        name: 'black',
      },
    ],
  };
  const themes = [
    {
      id: 'light',
      name: 'Light',
      selectedTokenSets: {
        global: 'enabled',
      },
    },
  ];
  const context = {
    name: 'six7',
    id: 'six7/figma-tokens',
    provider: 'jsonbin',
    secret: 'jsonbin',
  };
  it('return old data when remote data is older', async () => {
    const mockStore = createMockStore({});
    const updatedAt = '2022-09-20T08:43:03.844Z';
    const oldUpdatedAt = '2022-09-20T07:43:03.844Z';

    mockRetrieve.mockImplementationOnce(() => Promise.resolve({
      metadata: {
        updatedAt: '2022-09-19T07:43:03.844Z',
      },
    }));
    mockSave.mockImplementationOnce(() => Promise.resolve(true));
    expect(await updateJSONBinTokens({
      tokens: tokens as Record<string, SingleToken[]>, themes: themes as ThemeObjectsList, context: context as Partial<StorageTypeCredentials>, updatedAt, oldUpdatedAt, dispatch: mockStore.dispatch,
    })).toEqual({
      tokens: {
        global: [
          {
            value: '#ffffff',
            type: 'color',
            name: 'black',
          },
        ],
      },
      themes: [
        {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {
            global: 'enabled',
          },
        },
      ],
      metadata: {
        tokenSetOrder: ['global'],
        updatedAt: '2022-09-20T08:43:03.844Z',
        version: pjs.plugin_version,
      },
    });
  });

  it('notify updating error when remote data is newer', async () => {
    const mockStore = createMockStore({});
    const updatedAt = '2022-09-20T08:43:03.844Z';
    const oldUpdatedAt = '2022-09-20T07:43:03.844Z';

    mockRetrieve.mockImplementation(() => Promise.resolve({
      metadata: {
        updatedAt: '2022-09-21T07:43:03.844Z',
      },
    }));
    mockSave.mockImplementation(() => Promise.resolve(true));
    await updateJSONBinTokens({
      tokens: tokens as Record<string, SingleToken[]>, themes: themes as ThemeObjectsList, context: context as Partial<StorageTypeCredentials>, updatedAt, oldUpdatedAt, dispatch: mockStore.dispatch,
    });
    expect(await updateJSONBinTokens({
      tokens: tokens as Record<string, SingleToken[]>, themes: themes as ThemeObjectsList, context: context as Partial<StorageTypeCredentials>, updatedAt, oldUpdatedAt, dispatch: mockStore.dispatch,
    })).toEqual(null);
  });

  it('return error message when there is a error while retrieving the data', async () => {
    const mockStore = createMockStore({});
    const updatedAt = '2022-09-20T08:43:03.844Z';
    const oldUpdatedAt = '2022-09-20T07:43:03.844Z';

    mockRetrieve.mockImplementation(() => Promise.resolve({
      status: 'failure',
      errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR,
    }));
    expect(await updateJSONBinTokens({
      tokens: tokens as Record<string, SingleToken[]>, themes: themes as ThemeObjectsList, context: context as Partial<StorageTypeCredentials>, updatedAt, oldUpdatedAt, dispatch: mockStore.dispatch,
    })).toEqual({
      status: 'failure',
      errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR,
    });
  });
});
