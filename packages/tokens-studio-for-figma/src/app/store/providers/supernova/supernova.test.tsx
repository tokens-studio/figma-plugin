import { renderHook } from '@testing-library/react';
import { useSupernova } from './supernova';
import { AllTheProviders } from '../../../../../tests/config/setupTest';
import { notifyToUI } from '@/plugin/notifiers';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeCredentials } from '@/types/StorageType';

jest.mock('@/plugin/notifiers', () => ({
  notifyToUI: jest.fn(),
}));

describe('useSupernova with an unsupported URL', () => {
  const context = {
    provider: StorageProviderType.SUPERNOVA,
    internalId: 'supernova',
    name: 'supernova',
    designSystemUrl: 'https://www.app.supernova.io/acme/123-name/x/y',
    mapping: '{}',
    secret: 'secret',
  } as Extract<StorageTypeCredentials, { provider: StorageProviderType.SUPERNOVA }>;
  const failure = { status: 'failure', errorMessage: 'Unsupported Supernova URL' };

  const renderSupernova = () => renderHook(() => useSupernova(), { wrapper: AllTheProviders }).result.current;

  it('returns a failure when pushing', async () => {
    await expect(renderSupernova().pushTokensToSupernova(context)).resolves.toEqual(failure);
  });

  it('returns a failure and notifies when syncing', async () => {
    await expect(renderSupernova().syncTokensWithSupernova(context)).resolves.toEqual(failure);
    expect(notifyToUI).toHaveBeenCalledWith('Unsupported Supernova URL', { error: true });
  });
});
