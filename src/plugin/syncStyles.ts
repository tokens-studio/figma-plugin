import { SyncOption } from '@/app/store/useTokens';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenTypes } from '@/constants/TokenTypes';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import {
  AnyTokenList,
  SingleBoxShadowToken,
  SingleColorToken,
  SingleToken,
  SingleTypographyToken,
} from '@/types/tokens';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { isMatchingStyle } from '@/utils/is/isMatchingStyle';
import compareStyleValueWithTokenValue from './compareStyleWithToken';
import { generateTokensToCreate } from './generateTokensToCreate';
import { transformValue } from './helpers';
import setColorValuesOnTarget from './setColorValuesOnTarget';
import setEffectValuesOnTarget from './setEffectValuesOnTarget';
import setTextValuesOnTarget from './setTextValuesOnTarget';
import updateStyles from './updateStyles';

export default async function syncStyles(tokens: Record<string, AnyTokenList>, settings: Record<SyncOption, boolean>) {
  const effectStyles = figma.getLocalEffectStyles();
  const paintStyles = figma.getLocalPaintStyles();
  const textStyles = figma.getLocalTextStyles();
  let allStyles = [...effectStyles, ...paintStyles, ...textStyles];

  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const activeThemeObject = themeInfo.activeTheme
    ? themeInfo.themes.find(({ id }) => id === themeInfo.activeTheme)
    : null;

  // styleSet store all possible styles which could be created from current tokens
  const styleSet: Record<string, SingleToken<true, { path: string }>> = {};
  themeInfo.themes.forEach((theme) => {
    const tokensToCreate = generateTokensToCreate(theme, tokens);
    tokensToCreate.forEach((token) => {
      const pathName = convertTokenNameToPath(token.name, theme.name);
      styleSet[pathName] = {
        ...token,
        path: pathName,
        value: typeof token.value === 'string' ? transformValue(token.value, token.type) : token.value,
      } as SingleToken<true, { path: string }>;
    });
  });

  // Remove any styles that do not have a token that matches its name
  const styleIdsToRemove: string[] = [];
  if (settings.removeStyle) {
    allStyles = allStyles.filter((style) => {
      if (!Object.keys(styleSet).some((pathName) => isMatchingStyle(pathName, style))) {
        style.remove();
        styleIdsToRemove.push(style.id);
        return false;
      }
      return true;
    });
  }

  // Rename styles that are associated with a token and where the token name is different than the style name
  let styleIdsToCreate: Record<string, string> = {};
  if (settings.renameStyle && activeThemeObject) {
    const tokensToCreate = generateTokensToCreate(activeThemeObject, tokens);
    styleIdsToCreate = await updateStyles(tokensToCreate, true, { prefixStylesWithThemeName: true });
  }

  // Update all different style values
  allStyles.forEach((style) => {
    if (!compareStyleValueWithTokenValue(style, styleSet[style.name])) {
      if (style.type === 'PAINT' && styleSet[style.name].type === TokenTypes.COLOR) {
        setColorValuesOnTarget(style, styleSet[style.name] as SingleColorToken);
      }
      if (style.type === 'TEXT' && styleSet[style.name].type === TokenTypes.TYPOGRAPHY) {
        setTextValuesOnTarget(style, styleSet[style.name] as SingleTypographyToken);
      }
      if (style.type === 'EFFECT' && styleSet[style.name].type === TokenTypes.BOX_SHADOW) {
        setEffectValuesOnTarget(style, styleSet[style.name] as SingleBoxShadowToken);
      }
    }
  });

  return {
    styleIdsToRemove,
    styleIdsToCreate,
  };
}
