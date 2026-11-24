import type { ThemeObject } from '@/types';
import { sanitizeTokenSetName } from '@/app/store/models/effects/tokenState/utils/sanitizeForStudio';

// Tokens Studio stores a theme group "Brand Core" as "Brand-Core".
const normalizeGroup = (group: string) => group.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Whether a set is the one a variables import creates for the theme: "<collection>/<mode>". Any other set
// the theme selects (a shared source set, for example) has nothing to do with the theme's Figma mode.
export function isThemeOwnTokenSet(
  tokenSet: string,
  theme: Pick<ThemeObject, 'name' | 'group' | '$figmaIsExtension' | '$figmaParentCollectionId'>,
): boolean {
  if (!theme.group || !theme.name) return false;
  const set = sanitizeTokenSetName(tokenSet);
  const modeSuffix = `/${sanitizeTokenSetName(theme.name)}`;
  if (!set.endsWith(modeSuffix)) return false;

  const collection = set.slice(0, -modeSuffix.length);
  if (!collection) return false;
  if (collection === sanitizeTokenSetName(theme.group)) return true;

  const normalizedCollection = normalizeGroup(collection);
  const normalizedGroup = normalizeGroup(theme.group);
  if (!normalizedCollection) return false;
  if (normalizedCollection === normalizedGroup) return true;
  // An extended collection's group is "<parent collection>/<collection>", its set only "<collection>/<mode>".
  return Boolean(theme.$figmaIsExtension || theme.$figmaParentCollectionId) && normalizedGroup.endsWith(`-${normalizedCollection}`);
}
