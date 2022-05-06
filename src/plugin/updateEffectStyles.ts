import compact from 'just-compact';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { getEffectStylesKeyMap } from '@/utils/getEffectStylesKeyMap';
import setEffectValuesOnTarget from './setEffectValuesOnTarget';
import type { SinglePathToken } from './updateStyles';

// Iterate over effectTokens to create objects that match figma styles
// @returns A map of token names and their respective style IDs (if created or found)
export default async function updateEffectStyles(effectTokens: SinglePathToken[], shouldCreate = false) {
  const themeInfo = await AsyncMessageChannel.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const activeThemeObject = themeInfo.activeTheme
    ? themeInfo.themes.find(({ id }) => id === themeInfo.activeTheme)
    : null;

  const effectStylesToKeyMap = getEffectStylesKeyMap();
  const tokenToStyleMap: Record<string, string> = {};

  effectTokens.forEach((token) => {
    const possibleStyleNames = [
      token.path,
      compact([activeThemeObject?.name, token.path]).join('/'),
    ];
    const matchingStyleName = possibleStyleNames.find((path) => (
      effectStylesToKeyMap.has(path)
    ));

    if (matchingStyleName) {
      const effectStyle = effectStylesToKeyMap.get(matchingStyleName)!;
      tokenToStyleMap[token.name] = effectStyle.id;
      setEffectValuesOnTarget(effectStyle, token);
    } else if (shouldCreate) {
      const style = figma.createEffectStyle();
      style.name = compact([activeThemeObject?.name, token.path]).join('/');
      tokenToStyleMap[token.name] = style.id;
      setEffectValuesOnTarget(style, token);
    }
  });

  return tokenToStyleMap;
}
