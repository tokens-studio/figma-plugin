import { compressToUTF16 } from 'lz-string';
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
import { IsCompressedProperty } from '@/figmaStorage/isCompressedProperty';

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
  await VersionProperty.write(pjs.version);
  await ThemesProperty.write(payload.themes);
  await ValuesProperty.write(compressToUTF16(JSON.stringify(payload.tokens)));
  await IsCompressedProperty.write(true);
  await UsedTokenSetProperty.write(payload.usedTokenSets);
  await UpdatedAtProperty.write(payload.updatedAt);
  await ActiveThemeProperty.write(payload.activeTheme);
  await CheckForChangesProperty.write(payload.checkForChanges);
  await CollapsedTokenSetsProperty.write(payload.collapsedTokenSets);
  await TokenFormatProperty.write(payload.tokenFormat);
}
