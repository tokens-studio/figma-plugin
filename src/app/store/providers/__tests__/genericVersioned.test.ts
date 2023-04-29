import { ThemeObjectsList } from '@/types';
import { SingleToken } from '@/types/tokens';
import { updateGenericVersionedTokens } from '../generic/versionedStorage';
import * as pjs from '@/../package.json';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { createMockStore } from '@/../tests/config/setupTest';
import { notifyToUI } from '@/plugin/notifiers';
import {
  StorageProviderType,
  GenericVersionedStorageFlow,
  GenericVersionedStorageType,
} from '@/types/StorageType';

const mockRetrieve = jest.fn();
const mockSave = jest.fn();

jest.mock('@/storage/GenericVersionedStorage', () => ({
  GenericVersionedStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
      save: mockSave,
    }
  )),
}));

jest.mock('@/plugin/notifiers', (() => ({
  notifyToUI: jest.fn(),
})));

describe('Generic Versioned Storage', () => {
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
  const context: GenericVersionedStorageType = {
    internalId: 'test',
    name: 'test',
    id: 'http://test.com',
    flow: GenericVersionedStorageFlow.READ_WRITE_CREATE,
    additionalHeaders: [],
    provider: StorageProviderType.GENERIC_VERSIONED_STORAGE,

  };
  it('return new data when remote data is older', async () => {
    const mockStore = createMockStore({});
    const updatedAt = '2022-09-20T08:43:03.844Z';
    const oldUpdatedAt = '2022-09-20T07:43:03.844Z';
    const remoteUpdatedAt = '2022-09-19T07:43:03.844Z';

    mockRetrieve.mockImplementationOnce(() => Promise.resolve({
      metadata: {
        updatedAt: remoteUpdatedAt,
      },
    }));
    mockSave.mockImplementationOnce(() => Promise.resolve(true));
    expect(await updateGenericVersionedTokens({
      tokens: tokens as Record<string, SingleToken[]>, themes: themes as ThemeObjectsList, context, updatedAt, oldUpdatedAt, dispatch: mockStore.dispatch,
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
        updatedAt,
        version: pjs.plugin_version,
      },
    });
    expect(notifyToUI).not.toHaveBeenCalled();
  });

  it('indicates to the user that new data is available and does not save data when remote is newer', async () => {
    const mockStore = createMockStore({});
    const updatedAt = '2022-09-20T08:43:03.844Z';
    const oldUpdatedAt = '2021-09-20T07:43:03.844Z';
    const RemoteUpdatedAt = '2023-09-20T07:43:03.844Z';

    mockRetrieve.mockImplementationOnce(() => Promise.resolve({
      metadata: {
        updatedAt: RemoteUpdatedAt,
      },
    }));
    mockSave.mockImplementationOnce(() => Promise.resolve(true));

    const response = await updateGenericVersionedTokens({
      tokens: tokens as Record<string, SingleToken[]>, themes: themes as ThemeObjectsList, context, updatedAt, oldUpdatedAt, dispatch: mockStore.dispatch,
    });

    expect(response).toBeUndefined();
    expect(notifyToUI).toHaveBeenCalledWith('Error updating tokens as remote is newer, please update first', { error: true });
    expect(mockSave).not.toBeCalled();
  });

  it('return error message when there is a error while retrieving the data', async () => {
    const mockStore = createMockStore({});
    const updatedAt = '2022-09-20T08:43:03.844Z';
    const oldUpdatedAt = '2022-09-20T07:43:03.844Z';

    mockRetrieve.mockImplementation(() => Promise.resolve({
      status: 'failure',
      errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR,
    }));
    expect(await updateGenericVersionedTokens({
      tokens: tokens as Record<string, SingleToken[]>, themes: themes as ThemeObjectsList, context, updatedAt, oldUpdatedAt, dispatch: mockStore.dispatch,
    })).toEqual({
      status: 'failure',
      errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR,
    });
    expect(notifyToUI).toHaveBeenCalledWith('Error updating Generic Storage, check console (F12) ', { error: true });
  });
});
