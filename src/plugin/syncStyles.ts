import { SyncOption } from '@/app/store/useTokens';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
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
import { transformValue } from './helpers';
import setColorValuesOnTarget from './setColorValuesOnTarget';
import setEffectValuesOnTarget from './setEffectValuesOnTarget';
import setTextValuesOnTarget from './setTextValuesOnTarget';
import updateStyles from './updateStyles';

export default async function syncStyles(tokens: AnyTokenList, settings: Record<SyncOption, boolean>) {
  const effectStyles = figma.getLocalEffectStyles();
  const paintStyles = figma.getLocalPaintStyles();
  const textStyles = figma.getLocalTextStyles();
  const allStyles = [...effectStyles, ...paintStyles, ...textStyles];

  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const activeThemeObject = themeInfo.activeTheme
    ? themeInfo.themes.find(({ id }) => id === themeInfo.activeTheme)
    : null;
  // styleSet store all possible styles which could be created from current tokens
  console.log('tokens', tokens)
  const styleSet: Record<string, SingleToken<true, { path: string }>> = {};
  themeInfo.themes.forEach((theme) => {
    Object.entries(theme.selectedTokenSets).forEach(([tokenSet, value]) => {
      if (value === TokenSetStatus.ENABLED) {
        tokens.forEach((token) => {
          if (token.internal__Parent === tokenSet) {
            const pathName = convertTokenNameToPath(token.name, theme.name);
            styleSet[pathName] = {
              ...token,
              path: pathName,
              value: typeof token.value === 'string' ? transformValue(token.value, token.type) : token.value,
            } as SingleToken<true, { path: string }>;
          }
        });
      }
    });
  });

  const styleIdsToRemove: string[] = [];
  console.log('styleSet', styleSet, 'setting', settings, 'all', allStyles);
  allStyles.forEach((style) => {
    console.log('style', style, 'boolea', !Object.keys(styleSet).some((pathName) => isMatchingStyle(pathName, style)));

    if (settings.removeStyle && !Object.keys(styleSet).some((pathName) => isMatchingStyle(pathName, style))) {
      console.log('style', style);
      style.remove();
      styleIdsToRemove.push(style.id);
    }
    // console.log('!compareStyleValueWithTokenValue(style, styleSet[style.name])', !compareStyleValueWithTokenValue(style, styleSet[style.name]))
    // if (!compareStyleValueWithTokenValue(style, styleSet[style.name])) {
    //   console.log('update')
    //   if (style.type === 'PAINT' && styleSet[style.name].type === TokenTypes.COLOR) {
    //     console.log('paint', styleSet[style.name])
    //     setColorValuesOnTarget(style, styleSet[style.name] as SingleColorToken);
    //   }
    //   if (style.type === 'TEXT' && styleSet[style.name].type === TokenTypes.TYPOGRAPHY) {
    //     console.log('text', styleSet[style.name])
    //     setTextValuesOnTarget(style, styleSet[style.name] as SingleTypographyToken);
    //   }
    //   if (style.type === 'EFFECT' && styleSet[style.name].type === TokenTypes.BOX_SHADOW) {
    //     console.log('effect', styleSet[style.name])
    //     setEffectValuesOnTarget(style, styleSet[style.name] as SingleBoxShadowToken);
    //   }
    // }
  });
  // create styles for renamed tokens
  const tokenToCreate: SingleToken[] = [];
  if (settings.renameStyle && activeThemeObject) {
    Object.entries(activeThemeObject.selectedTokenSets).forEach(([tokenSet, value]) => {
      if (value === TokenSetStatus.ENABLED) {
        tokens.forEach((token) => {
          if (token.internal__Parent === tokenSet) {
            tokenToCreate.push(token);
          }
        });
      }
    });
  }
  console.log('token', tokenToCreate);
  console.log('figmaStyleReferences', activeThemeObject?.$figmaStyleReferences)
  const styleIdsToCreate = await updateStyles(tokenToCreate, true, { prefixStylesWithThemeName: true });
  console.log('styleIdsToCreate', styleIdsToCreate);
  return {
    styleIdsToRemove,
    styleIdsToCreate,
  };
}
