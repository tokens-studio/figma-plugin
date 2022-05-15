import * as pjs from '../../../package.json';
import { ThemeObjectsList, UsedTokenSetsMap } from '@/types';
import { AnyTokenSet } from '@/types/tokens';
import {
  ActiveThemeProperty,
  ThemesProperty, UpdatedAtProperty, UsedTokenSetProperty, ValuesProperty, VersionProperty,
} from '@/figmaStorage';

type Payload = {
  tokens: AnyTokenSet
  themes: ThemeObjectsList
  usedTokenSets: UsedTokenSetsMap
  activeTheme: string | null
  updatedAt: string
};

export async function updateLocalTokensData(payload: Payload) {
  await VersionProperty.write(pjs.plugin_version);
  await ThemesProperty.write(payload.themes);
  await ValuesProperty.write(payload.tokens); // @TODO check this
  await UsedTokenSetProperty.write(payload.usedTokenSets);
  await UpdatedAtProperty.write(payload.updatedAt);
  await ActiveThemeProperty.write(payload.activeTheme);
}
