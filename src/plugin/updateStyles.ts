import { SettingsState } from '@/app/store/models/settings';
import { AnyTokenList, SingleToken } from '@/types/tokens';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { transformValue } from './helpers';
import updateColorStyles from './updateColorStyles';
import updateEffectStyles from './updateEffectStyles';
import updateTextStyles from './updateTextStyles';

export type SinglePathToken = SingleToken<true, { path: string }>;

export default async function updateStyles(
  tokens: AnyTokenList,
  shouldCreate = false,
  settings: SettingsState = {} as SettingsState,
): Promise<Record<string, string>> {
  const styleTokens = tokens.map((token) => {
    const slice = settings?.ignoreFirstPartForStyles ? 1 : 0;
    const path = convertTokenNameToPath(token.name, slice);
    return {
      ...token,
      path,
      value: transformValue(token.value, token.type),
    } as SinglePathToken;
  });
  const colorTokens = styleTokens.filter((n) => ['color', 'colors'].includes(n.type));
  const textTokens = styleTokens.filter((n) => ['typography'].includes(n.type));
  const effectTokens = styleTokens.filter((n) => ['boxShadow'].includes(n.type));

  if (!colorTokens && !textTokens && !effectTokens) {
    return {};
  }

  const allStyleIds = {
    ...(colorTokens.length > 0 ? await updateColorStyles(colorTokens, shouldCreate) : {}),
    ...(textTokens.length > 0 ? await updateTextStyles(textTokens, shouldCreate) : {}),
    ...(effectTokens.length > 0 ? await updateEffectStyles(effectTokens, shouldCreate) : {}),
  };
  return allStyleIds;
}
