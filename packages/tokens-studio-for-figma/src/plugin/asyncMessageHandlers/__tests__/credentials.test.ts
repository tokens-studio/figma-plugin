import type { StorageProviderType } from '@sync-providers/types';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { updateCredentials } from '@/utils/credentials';
import { credentials } from '../credentials';

jest.mock('@/utils/credentials', (() => ({
  updateCredentials: jest.fn(),
})));

describe('credentials', () => {
  it('should update credentials', async () => {
    await credentials({
      type: AsyncMessageTypes.CREDENTIALS,
      credential: {
        branch: 'main',
        filePath: 'tokens.json',
        id: 'six7/figma-tokens',
        internalId: '1234',
        name: 'general',
        provider: AVAILABLE_PROVIDERS.GITHUB as StorageProviderType.GITHUB,
        secret: 'ghp_2345',
      },
    });
    expect(updateCredentials).toBeCalledWith({
      branch: 'main',
      filePath: 'tokens.json',
      id: 'six7/figma-tokens',
      internalId: '1234',
      name: 'general',
      provider: 'github',
      secret: 'ghp_2345',
    });
  });
});
