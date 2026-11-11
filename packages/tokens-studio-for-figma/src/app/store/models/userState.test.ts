import { init, RematchStore } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from './index';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { legacyOnlyLicenseSelector } from '@/selectors/legacyOnlyLicenseSelector';

type Store = RematchStore<RootModel, Record<string, never>>;

describe('userState legacy-only license', () => {
  let store: Store;

  beforeEach(() => {
    jest.spyOn(AsyncMessageChannel.ReactInstance, 'message').mockResolvedValue(undefined as any);
    store = init<RootModel>({ models });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('starts without a legacy-only license', () => {
    expect(legacyOnlyLicenseSelector(store.getState())).toBeNull();
  });

  it('records and clears a legacy-only license', () => {
    store.dispatch.userState.setLegacyOnlyLicense({ primaryStatus: 404, primaryReason: 'status' });
    expect(legacyOnlyLicenseSelector(store.getState())).toEqual({ primaryStatus: 404, primaryReason: 'status' });

    store.dispatch.userState.setLegacyOnlyLicense(null);
    expect(legacyOnlyLicenseSelector(store.getState())).toBeNull();
  });

  it('clears it when the license key is removed', async () => {
    store.dispatch.userState.setLegacyOnlyLicense({ primaryStatus: 404, primaryReason: 'status' });

    // No key is stored, so removeLicenseKey skips the detach call and only resets local state.
    await store.dispatch.userState.removeLicenseKey(undefined);

    expect(legacyOnlyLicenseSelector(store.getState())).toBeNull();
  });
});
