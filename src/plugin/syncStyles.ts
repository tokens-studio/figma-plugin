import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import {
  AnyTokenList, SingleBoxShadowToken, SingleColorToken, SingleTypographyToken,
} from '@/types/tokens';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { isMatchingStyle } from '@/utils/is/isMatchingStyle';
import compareStyleValueWithTokenValue from './compareStyleWithToken';
import updateStyles from './updateStyles';

export default async function syncStyles(tokens: Record<string, AnyTokenList>) {
  const effectStyles = figma.getLocalEffectStyles();
  const paintStyles = figma.getLocalPaintStyles();
  const textStyles = figma.getLocalTextStyles();
  const allStyles = [...effectStyles, ...paintStyles, ...textStyles];

  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  // styleSet store all possible styles which could be created from current tokens
  const styleSet: Record<string, SingleColorToken | SingleBoxShadowToken | SingleTypographyToken> = {};
  themeInfo.themes.forEach((theme) => {
    Object.entries(theme.selectedTokenSets).forEach(([tokenSet, value]) => {
      if (value === TokenSetStatus.ENABLED) {
        tokens[tokenSet].forEach((token) => {
          if (token.type === TokenTypes.COLOR || token.type === TokenTypes.BOX_SHADOW || token.type === TokenTypes.TYPOGRAPHY) {
            const pathName = convertTokenNameToPath(token.name, theme.name);
            styleSet[pathName] = token;
          }
        });
      }
    });
  });

  allStyles.forEach((style) => {
    if (!Object.keys(styleSet).some((pathName) => isMatchingStyle(pathName, style))) {
      style.remove();
    }
    if (!compareStyleValueWithTokenValue(style, styleSet[style.name])) {
      // updateStyle();
    }
  });
}
