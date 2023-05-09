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
  StorageTypeCredentials,
} from '@/types/StorageType';

const mockRetrieve = jest.fn();
const mockSave = jest.fn();

// Hide log calls unless they are expected
jest.spyOn(console, 'error').mockImplementation(() => { });

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

  const readWriteContext = { ...context, flow: GenericVersionedStorageFlow.READ_WRITE };

  const readOnlyContext = { ...context, flow: GenericVersionedStorageFlow.READ_ONLY };

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

    const response = await updateGenericVersionedTokens({
      tokens: tokens as Record<string, SingleToken[]>, themes: themes as ThemeObjectsList, context, updatedAt, oldUpdatedAt, dispatch: mockStore.dispatch,
    });

    expect(response).toEqual({
      tokens: {
        global: [
          {
            value: '#ffffff',
            type: 'color',
            name: 'black',
          },
        ],
      },
      status: 'success',
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
        tokenSetOrder: [
          'global',
        ],
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

    expect(response).toEqual({
      status: 'failure',
      errorMessage: 'Remote version is newer than local version',

    });
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

  describe('when READ_ONLY', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('does not pull from or push to the remote', async () => {
      const mockStore = createMockStore({});
      const updatedAt = '2022-09-20T08:43:03.844Z';
      const oldUpdatedAt = '2022-09-20T07:43:03.844Z';

      mockRetrieve.mockResolvedValue({
        metadata: {
          updatedAt: '2022-09-21T07:43:03.844Z',
        },
      });

      expect(
        await updateGenericVersionedTokens({
          tokens: tokens as Record<string, SingleToken[]>,
          themes: themes as ThemeObjectsList,
          context: readOnlyContext,
          updatedAt,
          oldUpdatedAt,
          dispatch: mockStore.dispatch,
        }),
      ).toEqual(null);

      expect(mockRetrieve).not.toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe('when READ_WRITE', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('return old data when remote data is older', async () => {
      const mockStore = createMockStore({});
      const updatedAt = '2022-09-20T08:43:03.844Z';
      const oldUpdatedAt = '2022-09-20T07:43:03.844Z';

      mockRetrieve.mockResolvedValue({
        metadata: {
          updatedAt: '2022-09-19T07:43:03.844Z',
        },
      });
      mockSave.mockResolvedValueOnce(true);

      await updateGenericVersionedTokens({
        tokens: tokens as Record<string, SingleToken[]>,
        themes: themes as ThemeObjectsList,
        context: readWriteContext,
        updatedAt,
        oldUpdatedAt,
        dispatch: mockStore.dispatch,
      });

      expect(mockSave).toHaveBeenCalledWith({
        tokens,
        themes,
        metadata: {
          tokenSetOrder: ['global'],
          updatedAt: '2022-09-20T08:43:03.844Z',
          version: pjs.plugin_version,
        },
      });

      expect(JSON.parse(mockStore.getState().tokenState.lastSyncedState)).toEqual([
        tokens,
        themes,
        {
          tokenSetOrder: ['global'],
        },
      ]);
    });

    it('requires ID to be set', async () => {
      const mockStore = createMockStore({});
      const updatedAt = '2022-09-20T08:43:03.844Z';
      const oldUpdatedAt = '2022-09-20T07:43:03.844Z';

      const { id, ...contextMissingId } = readWriteContext;

      expect(
        await updateGenericVersionedTokens({
          tokens: tokens as Record<string, SingleToken[]>,
          themes: themes as ThemeObjectsList,
          context: contextMissingId,
          updatedAt,
          oldUpdatedAt,
          dispatch: mockStore.dispatch,
        }),
      ).toEqual({
        status: 'failure',
        errorMessage: 'Error: Missing Generic Versioned Storage ID',
      });
    });

    it('saves even when oldUpdatedAt is unset', async () => {
      const mockStore = createMockStore({});
      const updatedAt = '2022-09-20T08:43:03.844Z';

      mockRetrieve.mockResolvedValue({
        metadata: {
          updatedAt: '2022-09-19T07:43:03.844Z',
        },
      });
      mockSave.mockResolvedValueOnce(true);

      await updateGenericVersionedTokens({
        tokens: tokens as Record<string, SingleToken[]>,
        themes: themes as ThemeObjectsList,
        context: readWriteContext,
        updatedAt,
        dispatch: mockStore.dispatch,
      });

      expect(mockSave).toHaveBeenCalledWith({
        tokens,
        themes,
        metadata: {
          tokenSetOrder: ['global'],
          updatedAt: '2022-09-20T08:43:03.844Z',
          version: pjs.plugin_version,
        },
      });

      expect(JSON.parse(mockStore.getState().tokenState.lastSyncedState)).toEqual([
        tokens,
        themes,
        {
          tokenSetOrder: ['global'],
        },
      ]);
    });
  });

  describe('when READ_WRITE_CREATE', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('saves lastSyncedState when updating', async () => {
      const mockStore = createMockStore({});
      const updatedAt = '2022-09-20T08:43:03.844Z';

      mockRetrieve.mockResolvedValue({
        metadata: {
          updatedAt: '2022-09-19T07:43:03.844Z',
        },
      });
      mockSave.mockResolvedValueOnce(true);

      await updateGenericVersionedTokens({
        tokens: tokens as Record<string, SingleToken[]>,
        themes: themes as ThemeObjectsList,
        context,
        updatedAt,
        dispatch: mockStore.dispatch,
      });

      expect(mockSave).toHaveBeenCalledWith({
        tokens,
        themes,
        metadata: {
          tokenSetOrder: ['global'],
          updatedAt: '2022-09-20T08:43:03.844Z',
          version: pjs.plugin_version,
        },
      });

      expect(JSON.parse(mockStore.getState().tokenState.lastSyncedState)).toEqual([
        tokens,
        themes,
        {
          tokenSetOrder: ['global'],
        },
      ]);
    });

    it('updates remote even if retrieve returns null', async () => {
      const mockStore = createMockStore({});
      const updatedAt = '2022-09-20T08:43:03.844Z';

      mockRetrieve.mockResolvedValue(null);
      mockSave.mockResolvedValueOnce(true);

      await updateGenericVersionedTokens({
        tokens: tokens as Record<string, SingleToken[]>,
        themes: themes as ThemeObjectsList,
        context,
        updatedAt,
        dispatch: mockStore.dispatch,
      });

      expect(mockSave).toHaveBeenCalledWith({
        tokens,
        themes,
        metadata: {
          tokenSetOrder: ['global'],
          updatedAt: '2022-09-20T08:43:03.844Z',
          version: pjs.plugin_version,
        },
      });

      expect(JSON.parse(mockStore.getState().tokenState.lastSyncedState)).toEqual([
        tokens,
        themes,
        {
          tokenSetOrder: ['global'],
        },
      ]);
    });

    it('notify updating error when remote data is newer', async () => {
      const mockStore = createMockStore({});
      const updatedAt = '2022-09-20T08:43:03.844Z';
      const oldUpdatedAt = '2022-09-20T07:43:03.844Z';

      mockRetrieve.mockResolvedValue({
        metadata: {
          updatedAt: '2022-09-21T07:43:03.844Z',
        },
      });
      mockSave.mockResolvedValue(true);
      await updateGenericVersionedTokens({
        tokens: tokens as Record<string, SingleToken[]>,
        themes: themes as ThemeObjectsList,
        context: context as Partial<StorageTypeCredentials>,
        updatedAt,
        oldUpdatedAt,
        dispatch: mockStore.dispatch,
      });
      expect(
        await updateGenericVersionedTokens({
          tokens: tokens as Record<string, SingleToken[]>,
          themes: themes as ThemeObjectsList,
          context: context as Partial<StorageTypeCredentials>,
          updatedAt,
          oldUpdatedAt,
          dispatch: mockStore.dispatch,
        }),
      ).toEqual({
        status: 'failure',
        errorMessage: ErrorMessages.REMOTE_VERSION_NEWER,
      });
    });

    it('return error message when there is a error while retrieving the data', async () => {
      const mockStore = createMockStore({});
      const updatedAt = '2022-09-20T08:43:03.844Z';
      const oldUpdatedAt = '2022-09-20T07:43:03.844Z';

      mockRetrieve.mockResolvedValue({
        status: 'failure',
        errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR,
      });
      expect(
        await updateGenericVersionedTokens({
          tokens: tokens as Record<string, SingleToken[]>,
          themes: themes as ThemeObjectsList,
          context: context as Partial<StorageTypeCredentials>,
          updatedAt,
          oldUpdatedAt,
          dispatch: mockStore.dispatch,
        }),
      ).toEqual({
        status: 'failure',
        errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR,
      });
    });

    it('return generic error message when there is a error while retrieving the data and no message is supplied', async () => {
      const mockStore = createMockStore({});
      const updatedAt = '2022-09-20T08:43:03.844Z';
      const oldUpdatedAt = '2022-09-20T07:43:03.844Z';

      mockRetrieve.mockResolvedValue({
        status: 'failure',
      });
      expect(
        await updateGenericVersionedTokens({
          tokens: tokens as Record<string, SingleToken[]>,
          themes: themes as ThemeObjectsList,
          context: context as Partial<StorageTypeCredentials>,
          updatedAt,
          oldUpdatedAt,
          dispatch: mockStore.dispatch,
        }),
      ).toEqual({
        status: 'failure',
        errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR,
      });
    });

    it('return error message when there is a error while saving the data', async () => {
      const mockStore = createMockStore({});
      const updatedAt = '2022-09-20T08:43:03.844Z';
      const oldUpdatedAt = '2022-09-20T07:43:03.844Z';
      mockRetrieve.mockResolvedValue({
        status: 'failure',
      });
      mockSave.mockResolvedValue(false);
      expect(
        await updateGenericVersionedTokens({
          tokens: tokens as Record<string, SingleToken[]>,
          themes: themes as ThemeObjectsList,
          context: context as Partial<StorageTypeCredentials>,
          updatedAt,
          oldUpdatedAt,
          dispatch: mockStore.dispatch,
        }),
      ).toEqual({
        status: 'failure',
        errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR,
      });
    });
  });
});
