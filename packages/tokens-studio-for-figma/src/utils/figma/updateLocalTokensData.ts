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
import { LastModifiedByProperty } from '@/figmaStorage/LastModifiedBy';

type Payload = {
  tokens: Record<string, AnyTokenList>
  themes: ThemeObjectsList
  usedTokenSets: UsedTokenSetsMap
  activeTheme: Record<string, string>
  updatedAt: string
  checkForChanges: boolean
  collapsedTokenSets: string[]
  tokenFormat: TokenFormatOptions
  lastModifiedBy: string
};

export async function updateLocalTokensData(payload: Payload) {
  await VersionProperty.write(pjs.version);
  await ThemesProperty.write(payload.themes);
  await ValuesProperty.write(payload.tokens);
  await UsedTokenSetProperty.write(payload.usedTokenSets);
  await UpdatedAtProperty.write(payload.updatedAt);
  await ActiveThemeProperty.write(payload.activeTheme);
  await CheckForChangesProperty.write(payload.checkForChanges);
  await CollapsedTokenSetsProperty.write(payload.collapsedTokenSets);
  await TokenFormatProperty.write(payload.tokenFormat);
  // console.log('payload.lastModifiedBy in updateLocalTokensData', payload.lastModifiedBy);
  await LastModifiedByProperty.write(payload.lastModifiedBy);
}
