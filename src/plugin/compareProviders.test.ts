import { StorageProviderType } from '@/constants/StorageProviderType';
import { MessageFromPluginTypes } from '../types/messages';
import compareProvidersWithStored from './compareProviders';

describe('compareProvidersWithStored', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const firstProvider = {
    provider: StorageProviderType.JSONBIN, id: '123', secret: '456', name: 'dummy',
  };
  const otherProvider = {
    provider: StorageProviderType.GITHUB, id: '122', secret: '456', name: 'dummy 2',
  };

  it('calls postMessage with true if one matches', () => {
    compareProvidersWithStored({ providers: JSON.stringify([firstProvider, otherProvider]), storageType: firstProvider });

    expect(figma.ui.postMessage).toHaveBeenCalledWith({
      type: MessageFromPluginTypes.API_CREDENTIALS,
      status: true,
      credentials: firstProvider,
    });
  });

  it('calls postMessage with false, if no providers exist', () => {
    compareProvidersWithStored({ storageType: firstProvider });

    expect(figma.ui.postMessage).toHaveBeenCalledWith({
      type: MessageFromPluginTypes.API_CREDENTIALS,
      status: false,
    });
  });

  it('calls postMessage with false, if no matching providers exist', () => {
    compareProvidersWithStored({ providers: JSON.stringify([otherProvider]), storageType: firstProvider });

    expect(figma.ui.postMessage).toHaveBeenCalledWith({
      type: MessageFromPluginTypes.API_CREDENTIALS,
      status: false,
    });
  });
});
