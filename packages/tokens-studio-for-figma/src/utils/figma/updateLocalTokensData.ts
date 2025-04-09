import * as pjs from '../../../package.json';
import { ThemeObjectsList, UsedTokenSetsMap } from '@/types';
import { AnyTokenList } from '@/types/tokens';
import {
  ActiveThemeProperty,
  CheckForChangesProperty,
  ClientCheckForChangesProperty,
  ClientValuesProperty,
  StorageTypeProperty,
  ThemesProperty, TokenFormatProperty, UpdatedAtProperty, UsedTokenSetProperty, ValuesProperty, VersionProperty,
} from '@/figmaStorage';
import { CollapsedTokenSetsProperty } from '@/figmaStorage/CollapsedTokenSetsProperty';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { StorageProviderType } from '@/constants/StorageProviderType';

type Payload = {
  tokens: Record<string, AnyTokenList>
  themes: ThemeObjectsList
  usedTokenSets: UsedTokenSetsMap
  activeTheme: Record<string, string>
  updatedAt: string
  checkForChanges: boolean
  collapsedTokenSets: string[]
  tokenFormat: TokenFormatOptions
  useClientStorage?: boolean
};

export async function updateLocalTokensData(payload: Payload) {
  await VersionProperty.write(pjs.version);
  await ThemesProperty.write(payload.themes);
  await UsedTokenSetProperty.write(payload.usedTokenSets);
  await UpdatedAtProperty.write(payload.updatedAt);
  await ActiveThemeProperty.write(payload.activeTheme);
  await CollapsedTokenSetsProperty.write(payload.collapsedTokenSets);
  await TokenFormatProperty.write(payload.tokenFormat);

  // Check if we should use client storage
  let useClientStorage = payload.useClientStorage;

  // If not explicitly set, check if user has chosen to use client storage for local storage
  if (useClientStorage === undefined) {
    const forceUseClientStorage = await figma.clientStorage.getAsync('useClientStorageForLocal');
    if (forceUseClientStorage) {
      useClientStorage = true;
    } else {
      // Check storage type
      const storageType = await StorageTypeProperty.read(figma.root);
      useClientStorage = Boolean(storageType && storageType.provider !== StorageProviderType.LOCAL);
    }
  }

  // Store tokens and checkForChanges in the appropriate storage
  if (useClientStorage) {
    await ClientValuesProperty.write(payload.tokens);
    await ClientCheckForChangesProperty.write(payload.checkForChanges);
  } else {
    await ValuesProperty.write(payload.tokens);
    await CheckForChangesProperty.write(payload.checkForChanges);
  }
}
