import pjs from '../../../package.json';
import { ThemeObjectsList, UsedTokenSetsMap } from '@/types';
import { AnyTokenList } from '@/types/tokens';
import {
  ActiveThemeProperty,
  ThemesProperty, TokenFormatProperty, UpdatedAtProperty, UsedTokenSetProperty, ValuesProperty, VersionProperty, IsCompressedProperty,
} from '@/figmaStorage';
import { CollapsedTokenSetsProperty } from '@/figmaStorage/CollapsedTokenSetsProperty';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { StorageProviderType } from '@/types/StorageType';
import { ClientStorageProperty } from '@/figmaStorage/ClientStorageProperty';
import { getFileKey } from '../../plugin/helpers';

type Payload = {
  tokens: Record<string, AnyTokenList>
  themes: ThemeObjectsList
  compressedTokens: string
  compressedThemes: string
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
  if (payload.storageProvider === StorageProviderType.LOCAL) {
    await IsCompressedProperty.write(true);

    // Only write themes if they've changed
    const currentThemes = await ThemesProperty.read(figma.root, true);
    const themesChanged = !currentThemes || JSON.stringify(currentThemes) !== JSON.stringify(payload.themes);
    if (themesChanged) {
      await ThemesProperty.write(payload.themes);
    }

    // Only write values if they've changed
    const currentValues = await ValuesProperty.read(figma.root, true);
    const valuesChanged = !currentValues || JSON.stringify(currentValues) !== JSON.stringify(payload.tokens);
    if (valuesChanged) {
      await ValuesProperty.write(payload.tokens);
    }
  } else {
    const fileKey = await getFileKey();

    await ClientStorageProperty.write('themes', fileKey, payload.compressedThemes);
    await ClientStorageProperty.write('values', fileKey, payload.compressedTokens);
    await ClientStorageProperty.write('checkForChanges', fileKey, payload.checkForChanges as unknown as string);
  }
  await UsedTokenSetProperty.write(payload.usedTokenSets);
  await UpdatedAtProperty.write(payload.updatedAt);
  await ActiveThemeProperty.write(payload.activeTheme);
  await CollapsedTokenSetsProperty.write(payload.collapsedTokenSets);
  await TokenFormatProperty.write(payload.tokenFormat);
}
