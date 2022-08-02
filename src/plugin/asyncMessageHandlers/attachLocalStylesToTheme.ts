import compact from 'just-compact';
import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { SingleToken } from '@/types/tokens';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { getEffectStylesKeyMap } from '@/utils/getEffectStylesKeyMap';
import { getPaintStylesKeyMap } from '@/utils/getPaintStylesKeyMap';
import { getTextStylesKeyMap } from '@/utils/getTextStylesKeyMap';

export const attachLocalStylesToTheme: AsyncMessageChannelHandlers[AsyncMessageTypes.ATTACH_LOCAL_STYLES_TO_THEME] = async (msg) => {
  const {
    theme, tokens, category, settings,
  } = msg;
  const figmaStyleReferences = { ...theme.$figmaStyleReferences ?? {} };
  const ignoreFirstPartForStyles = settings?.ignoreFirstPartForStyles;
  const prefixStylesWithThemeName = settings?.prefixStylesWithThemeName;

  const paintToKeyMap = getPaintStylesKeyMap();
  const textStylesToKeyMap = getTextStylesKeyMap();
  const effectStylesToKeyMap = getEffectStylesKeyMap();

  // step 1 list all tokens of the enabled token sets
  let tokensToCreateStylesFor: SingleToken[] = [];
  Object.entries(theme.selectedTokenSets).forEach(([tokenSetName, status]) => {
    if (status === TokenSetStatus.ENABLED) {
      tokensToCreateStylesFor = tokensToCreateStylesFor.concat(tokens[tokenSetName] ?? []);
    }
  });

  // step 2 only include the relevant token types
  const enabledTokenTypes = category === 'all'
    ? [TokenTypes.COLOR, TokenTypes.TYPOGRAPHY, TokenTypes.BOX_SHADOW]
    : compact([
      category === 'colors' ? TokenTypes.COLOR : null,
      category === 'typography' ? TokenTypes.TYPOGRAPHY : null,
      category === 'effects' ? TokenTypes.BOX_SHADOW : null,
    ]);
  tokensToCreateStylesFor = tokensToCreateStylesFor.filter((token) => (
    enabledTokenTypes.includes(token.type)
  ));

  // step 3 find and attach local styles
  const prefix = prefixStylesWithThemeName ? theme.name : null;
  const slice = ignoreFirstPartForStyles ? 1 : 0;
  tokensToCreateStylesFor.forEach((token) => {
    const path = convertTokenNameToPath(token.name, prefix, slice);
    if (token.type === TokenTypes.COLOR) {
      const colorStyle = paintToKeyMap.get(path);
      if (colorStyle) {
        figmaStyleReferences[token.name] = colorStyle.id;
      }
    } else if (token.type === TokenTypes.TYPOGRAPHY) {
      const textStyle = textStylesToKeyMap.get(path);
      if (textStyle) {
        figmaStyleReferences[token.name] = textStyle.id;
      }
    } else if (token.type === TokenTypes.BOX_SHADOW) {
      const effectStyle = effectStylesToKeyMap.get(path);
      if (effectStyle) {
        figmaStyleReferences[token.name] = effectStyle.id;
      }
    }
  });

  return {
    ...theme,
    $figmaStyleReferences: figmaStyleReferences,
  };
};
