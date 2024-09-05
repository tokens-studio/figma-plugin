import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import { StartupMessage } from '@/types/AsyncMessages';
import { createMockStore } from '../../../../../../tests/config/setupTest';
import { saveStorageInformationFactory } from '../saveStorageInformationFactory';

describe('saveStorageInformationFactory', () => {
  it('should work', async () => {
    const mockStore = createMockStore({});
    const mockParams = {
      storageType: AVAILABLE_PROVIDERS.GITHUB,
      localApiProviders: [
        {
          provider: AVAILABLE_PROVIDERS.GITHUB,
        },
      ],
    } as unknown as StartupMessage;
    const mockSetStorageFn = jest.fn();

    const fn = saveStorageInformationFactory(mockStore.dispatch, mockParams, {
      setStorageType: mockSetStorageFn,
    });
    await fn();

    expect(mockSetStorageFn).toBeCalledTimes(1);
    expect(mockSetStorageFn).toBeCalledWith({
      provider: AVAILABLE_PROVIDERS.GITHUB,
    });
    expect(mockStore.getState().uiState.apiProviders).toEqual(mockParams.localApiProviders);
  });
});
