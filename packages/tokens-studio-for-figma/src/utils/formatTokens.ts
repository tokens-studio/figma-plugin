import set from 'set-value';
import { expand } from '@/utils/expand';
import { AnyTokenList } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import removeTokenId from './removeTokenId';
import { convertTokenToFormat } from './convertTokenToFormat';
import { getGroupTypeName } from './stringifyTokens';

type Options = {
  tokens: Record<string, AnyTokenList>;
  tokenSets: string[];
  resolvedTokens: AnyTokenList;
  includeAllTokens?: boolean;
  includeParent?: boolean;
  expandTypography?: boolean;
  expandShadow?: boolean;
  expandComposition?: boolean;
  expandBorder?: boolean;
  storeTokenIdInJsonEditor?: boolean
};

export default function formatTokens({
  tokens,
  tokenSets,
  resolvedTokens: _resolvedTokens,
  includeAllTokens = false,
  includeParent = true,
  expandTypography = false,
  expandShadow = false,
  expandComposition = false,
  expandBorder = false,
  storeTokenIdInJsonEditor = false,
}: Options) {
  const nestUnderParent = includeAllTokens ? true : includeParent;

  const tokenObj = {};
  tokenSets.forEach((tokenSet) => {
    tokens[tokenSet]?.forEach((token) => {
      const { name, ...tokenWithoutName } = removeTokenId(token, !storeTokenIdInJsonEditor);

      const convertedToFormat = convertTokenToFormat(tokenWithoutName);
      // set type of group level
      if (token.inheritTypeLevel) {
        const nameToSet = getGroupTypeName(token.name, token.inheritTypeLevel);
        set(tokenObj, nestUnderParent ? [tokenSet, nameToSet].join('.') : nameToSet, token.type, { merge: true });
      }
      if (
        (token.type === TokenTypes.TYPOGRAPHY && expandTypography)
        || (token.type === TokenTypes.BOX_SHADOW && expandShadow)
        || (token.type === TokenTypes.COMPOSITION && expandComposition)
        || (token.type === TokenTypes.BORDER && expandBorder)
      ) {
        if (typeof token.value === 'string') {
          // If the original token value is a string (alias), keep it as an alias
          // Do not resolve it even when expand options are enabled
          set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, convertedToFormat);
        } else {
          // For object values, expand them into individual properties
          const expanded = expand(tokenWithoutName.value);
          const expandedToFormat = convertTokenToFormat(expanded, true);

          set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, { ...expandedToFormat });
        }
      } else {
        set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, convertedToFormat);
      }
    });
  });

  return JSON.stringify(tokenObj, null, 2);
}
