import { ThemeObjectsList } from '@/types';
import { GenericVersionedStorageFlow, StorageTypeCredentials } from '@/types/StorageType';
import { SingleToken } from '@/types/tokens';
import { updateGenericVersionedTokens } from '../generic/versionedStorage';
import * as pjs from '../../../../../package.json';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { createMockStore } from '../../../../../tests/config/setupTest';
import { StorageProviderType } from '@/constants/StorageProviderType';

const mockRetrieve = jest.fn();
const mockSave = jest.fn();

jest.mock('../../../../storage/GenericVersionedStorage', () => ({
  GenericVersionedStorage: jest.fn().mockImplementation(() => ({
    retrieve: mockRetrieve,
    save: mockSave,
  })),
}));

jest.mock('../../../../plugin/notifiers', () => ({
  notifyToUI: jest.fn(),
}));

describe.only('genericVersioned', () => {
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

  const context: Partial<StorageTypeCredentials> = {
    name: 'custom',
    id: 'http://localhost:9000',
    provider: StorageProviderType.GENERIC_VERSIONED_STORAGE,
    flow: GenericVersionedStorageFlow.READ_WRITE_CREATE,
    additionalHeaders: [],
  };

  const readWriteContext = { ...context, flow: GenericVersionedStorageFlow.READ_WRITE };

  const readOnlyContext = { ...context, flow: GenericVersionedStorageFlow.READ_ONLY };

  describe('when READ_ONLY', () => {
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

      const contextMissingId = { ...readWriteContext };
      delete contextMissingId.id;

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
        metadata: {
          updatedAt: '2022-09-19T07:43:03.844Z',
        },
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
        errorMessage: ErrorMessages.REMOTE_CREDENTIAL_ERROR,
      });
    });
  });
});
