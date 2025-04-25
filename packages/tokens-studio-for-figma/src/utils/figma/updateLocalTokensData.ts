import { compressToUTF16 } from 'lz-string';
import * as pjs from '../../../package.json';
import { ThemeObjectsList, UsedTokenSetsMap } from '@/types';
import { AnyTokenList } from '@/types/tokens';
import {
  ActiveThemeProperty,
  CheckForChangesProperty,
  ThemesProperty, TokenFormatProperty, UpdatedAtProperty, UsedTokenSetProperty, ValuesProperty, VersionProperty, IsCompressedProperty,
} from '@/figmaStorage';
import { CollapsedTokenSetsProperty } from '@/figmaStorage/CollapsedTokenSetsProperty';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';

type Payload = {
  tokens: Record<string, AnyTokenList>
  themes: ThemeObjectsList
  usedTokenSets: UsedTokenSetsMap
  activeTheme: Record<string, string>
  updatedAt: string
  checkForChanges: boolean
  collapsedTokenSets: string[]
  tokenFormat: TokenFormatOptions
};

export async function updateLocalTokensData(payload: Payload) {
  // Compress the data using lz-string
  const compressedTokens = compressToUTF16(JSON.stringify(payload.tokens));
  const compressedThemes = compressToUTF16(JSON.stringify(payload.themes));

  // Save the compressed data - chunking will happen automatically in FigmaStorageProperty
  await ValuesProperty.write(compressedTokens);
  await ThemesProperty.write(compressedThemes);

  // Save other properties
  await VersionProperty.write(pjs.version);
  await IsCompressedProperty.write(true);
  await UsedTokenSetProperty.write(payload.usedTokenSets);
  await UpdatedAtProperty.write(payload.updatedAt);
  await ActiveThemeProperty.write(payload.activeTheme);
  await CheckForChangesProperty.write(payload.checkForChanges);
  await CollapsedTokenSetsProperty.write(payload.collapsedTokenSets);
  await TokenFormatProperty.write(payload.tokenFormat);
}
