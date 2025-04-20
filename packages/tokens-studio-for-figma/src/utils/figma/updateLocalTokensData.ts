import * as pjs from '../../../package.json';
import { ThemeObjectsList, UsedTokenSetsMap } from '@/types';
import { AnyTokenList } from '@/types/tokens';
import {
  ActiveThemeProperty,
  CheckForChangesProperty,
  ThemesProperty, TokenFormatProperty, UpdatedAtProperty, UsedTokenSetProperty, ValuesProperty, VersionProperty,
} from '@/figmaStorage';
import { CollapsedTokenSetsProperty } from '@/figmaStorage/CollapsedTokenSetsProperty';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { StorageProviderType } from '@/types/StorageType';
import { ClientStorageProperty } from '@/figmaStorage/ClientStorageProperty';

type Payload = {
  tokens: Record<string, AnyTokenList>
  themes: ThemeObjectsList
  usedTokenSets: UsedTokenSetsMap
  activeTheme: Record<string, string>
  updatedAt: string
  checkForChanges: boolean
  collapsedTokenSets: string[]
  tokenFormat: TokenFormatOptions
  storageProvider: StorageProviderType
  storageSize: number
};

export async function updateLocalTokensData(payload: Payload) {
  await VersionProperty.write(pjs.version);
  // Check storage size and storage method
  if (payload.storageSize && payload.storageSize < 100 && payload.storageProvider === StorageProviderType.LOCAL) {
    await ClientStorageProperty.write('tokens/themes', payload.themes);
    await ClientStorageProperty.write('tokens/values', payload.tokens); // will help with migration of sharedPluginData to clientstorage as well
    await ThemesProperty.write(payload.themes);
    await ValuesProperty.write(payload.tokens);
  } else {
    await ValuesProperty.write({});
    await ThemesProperty.write([]);
    await ClientStorageProperty.write('tokens/themes', payload.themes);
    await ClientStorageProperty.write('tokens/values', payload.tokens);
  }
  await UsedTokenSetProperty.write(payload.usedTokenSets);
  await UpdatedAtProperty.write(payload.updatedAt);
  await ActiveThemeProperty.write(payload.activeTheme);
  await CheckForChangesProperty.write(payload.checkForChanges);
  await CollapsedTokenSetsProperty.write(payload.collapsedTokenSets);
  await TokenFormatProperty.write(payload.tokenFormat);
}
