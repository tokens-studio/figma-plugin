import { exportExtendedCollectionsSelector } from '../exportExtendedCollectionsSelector';
import { isTokensStudioSyncSelector } from '../isTokensStudioSyncSelector';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { RootState } from '@/app/store';

const createState = (exportExtendedCollections: boolean | undefined, provider: StorageProviderType) => ({
  settings: { exportExtendedCollections },
  uiState: { storageType: { provider } },
} as unknown as RootState);

describe('isTokensStudioSyncSelector', () => {
  it('is true only for the Tokens Studio provider', () => {
    expect(isTokensStudioSyncSelector(createState(false, StorageProviderType.TOKENS_STUDIO_OAUTH))).toBe(true);
    expect(isTokensStudioSyncSelector(createState(false, StorageProviderType.GITHUB))).toBe(false);
    expect(isTokensStudioSyncSelector(createState(false, StorageProviderType.LOCAL))).toBe(false);
  });
});

describe('exportExtendedCollectionsSelector', () => {
  it('returns the setting for non-Studio providers', () => {
    expect(exportExtendedCollectionsSelector(createState(true, StorageProviderType.GITHUB))).toBe(true);
    expect(exportExtendedCollectionsSelector(createState(false, StorageProviderType.GITHUB))).toBe(false);
    expect(exportExtendedCollectionsSelector(createState(undefined, StorageProviderType.LOCAL))).toBe(false);
  });

  it('is always false with Tokens Studio sync', () => {
    expect(exportExtendedCollectionsSelector(createState(true, StorageProviderType.TOKENS_STUDIO_OAUTH))).toBe(false);
  });
});
