import * as pjs from '../../../package.json';
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
    await ThemesProperty.write(payload.themes);
    await ValuesProperty.write(payload.tokens);
  } else {
    const fileKey = await getFileKey();
    const prefix = `${fileKey}/tokens`;

    await ClientStorageProperty.write(`${prefix}/themes`, fileKey, payload.themes);
    await ClientStorageProperty.write(`${prefix}/values`, fileKey, payload.tokens);
    await ClientStorageProperty.write(`${prefix}/checkForChanges`, fileKey, payload.checkForChanges);
  }
  await UsedTokenSetProperty.write(payload.usedTokenSets);
  await UpdatedAtProperty.write(payload.updatedAt);
  await ActiveThemeProperty.write(payload.activeTheme);
  await CollapsedTokenSetsProperty.write(payload.collapsedTokenSets);
  await TokenFormatProperty.write(payload.tokenFormat);
}
