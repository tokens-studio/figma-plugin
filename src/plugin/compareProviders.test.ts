import {StorageProviderType} from '../../types/api';
import {MessageFromPluginTypes} from '../../types/messages';
import compareProvidersWithStored from './compareProviders';

describe('compareProvidersWithStored', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    const matching = {provider: StorageProviderType.JSONBIN, id: '123', secret: '456', name: 'dummy'};
    const other = {provider: StorageProviderType.ARCADE, id: '122', secret: '456', name: 'dummy 2'};

    it('calls postMessage with true if one matches', () => {
        compareProvidersWithStored(JSON.stringify([matching, other]), {
            provider: StorageProviderType.JSONBIN,
            id: '123',
        });

        expect(figma.ui.postMessage).toHaveBeenCalledWith({
            type: MessageFromPluginTypes.API_CREDENTIALS,
            status: true,
            credentials: matching,
        });
    });

    it('calls postMessage with false, if no providers exist', () => {
        compareProvidersWithStored(null, {
            provider: StorageProviderType.JSONBIN,
            id: '999',
        });

        expect(figma.ui.postMessage).toHaveBeenCalledWith({
            type: MessageFromPluginTypes.API_CREDENTIALS,
            status: false,
        });
    });
});
