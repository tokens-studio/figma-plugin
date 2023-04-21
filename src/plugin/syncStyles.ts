import { SettingsState } from '@/app/store/models/settings';
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

export default async function syncStyles(tokens: Record<string, AnyTokenList>, options: Record<SyncOption, boolean>, settings: SettingsState) {
  const effectStyles = figma.getLocalEffectStyles();
  const paintStyles = figma.getLocalPaintStyles();
  const textStyles = figma.getLocalTextStyles();
  let allStyles = [...effectStyles, ...paintStyles, ...textStyles];

  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  // Filter activeThemes e.g light, desktop
  const activeThemes = themeInfo.themes.filter((theme) => Object.values(themeInfo.activeTheme).some((v) => v === theme.id));
  // Store all figmaStyleReferences through all activeThemes (e.g {color.red: ['s.1234'], color.blue ['s.2345', 's.3456']})
  const figmaStyleReferences: Record<string, string[]> = {};
  activeThemes.forEach((theme) => {
    Object.entries(theme.$figmaStyleReferences ?? {}).forEach(([token, styleId]) => {
      if (!figmaStyleReferences[token]) {
        figmaStyleReferences[token] = [styleId];
      } else {
        figmaStyleReferences[token] = [...figmaStyleReferences[token], styleId];
      }
    });
  });

  // styleSet store all possible styles which could be created from current tokens
  const styleSet: Record<string, SingleToken<true, { path: string }>> = {};
  themeInfo.themes.forEach((theme) => {
    const tokensToCreate = generateTokensToCreate(theme, tokens);
    tokensToCreate.forEach((token) => {
      const pathName = convertTokenNameToPath(token.name, theme.name);
      styleSet[pathName] = {
        ...token,
        path: pathName,
        value: typeof token.value === 'string' ? transformValue(token.value, token.type, settings.baseFontSize) : token.value,
      } as SingleToken<true, { path: string }>;
    });
  });

  // rename styles
  if (options.renameStyle && activeThemes.length > 0) {
    // Filter styles whose name starts with one of activeTheme (e.g light/color/black,  desktop/color/black, we ignore dark/color/black)
    allStyles.filter((style) => activeThemes.map((theme) => `${theme.name}/`).some((n) => style.name.startsWith(n))).forEach((style) => {
      if (figmaStyleReferences) {
        Object.entries(figmaStyleReferences).forEach(([tokenName, styleIds]) => {
          if (styleIds.includes(style.id) && style.name !== tokenName) {
            const newPath = tokenName.split('.').map((part) => part.trim()).join('/');
            const styleNameWithoutTheme = style.name.slice(style.name.indexOf('/') + 1);
            style.name = style.name.replace(styleNameWithoutTheme, newPath);
          }
        });
      }
    });
  }

  // Remove any styles that do not have a token that matches its name
  const styleIdsToRemove: string[] = [];
  if (options.removeStyle) {
    allStyles = allStyles.filter((style) => {
      if (!Object.keys(styleSet).some((pathName) => isMatchingStyle(pathName, style))) {
        if (activeThemes.length > 0 && figmaStyleReferences) {
          if (!Object.entries(figmaStyleReferences).some(([, value]) => value.includes(style.id))) {
            style.remove();
            styleIdsToRemove.push(style.id);
            return false;
          }
        } else {
          style.remove();
          styleIdsToRemove.push(style.id);
          return false;
        }
      }
      return true;
    });
  }

  // Update all different style values
  allStyles.forEach((style) => {
    if (styleSet[style.name] && !compareStyleValueWithTokenValue(style, styleSet[style.name], settings.baseFontSize)) {
      if (style.type === 'PAINT' && styleSet[style.name].type === TokenTypes.COLOR) {
        setColorValuesOnTarget(style, styleSet[style.name] as SingleColorToken);
      }
      if (style.type === 'TEXT' && styleSet[style.name].type === TokenTypes.TYPOGRAPHY) {
        setTextValuesOnTarget(style, styleSet[style.name] as SingleTypographyToken, settings.baseFontSize);
      }
      if (style.type === 'EFFECT' && styleSet[style.name].type === TokenTypes.BOX_SHADOW) {
        setEffectValuesOnTarget(style, styleSet[style.name] as SingleBoxShadowToken, settings.baseFontSize);
      }
    }
  });
  return {
    styleIdsToRemove,
  };
}
