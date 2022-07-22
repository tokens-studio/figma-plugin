import { StorageProviderType } from '@/constants/StorageProviderType';
import { StartupMessage } from '@/types/AsyncMessages';
import { createMockStore } from '../../../../../../tests/config/setupTest';
import { saveStorageInforamationFactory } from '../saveStorageInforamationFactory';

describe('saveStorageInformationFactory', () => {
  it('should work', async () => {
    const mockStore = createMockStore({});
    const mockParams = {
      storageType: StorageProviderType.GITHUB,
      localApiProviders: [
        {
          provider: StorageProviderType.GITHUB,
        },
      ],
    } as unknown as StartupMessage;
    const mockSetStorageFn = jest.fn();

    const fn = saveStorageInforamationFactory(mockStore.dispatch, mockParams, {
      setStorageType: mockSetStorageFn,
    });
    await fn();

    expect(mockSetStorageFn).toBeCalledTimes(1);
    expect(mockSetStorageFn).toBeCalledWith({
      provider: StorageProviderType.GITHUB,
    });
    expect(mockStore.getState().uiState.apiProviders).toEqual(mockParams.localApiProviders);
  });
});
