import set from 'set-value';
import { expand } from '@/utils/expand';
import { AnyTokenList } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';

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
};

export default function formatTokens({
  tokens,
  tokenSets,
  resolvedTokens,
  includeAllTokens = false,
  includeParent = true,
  expandTypography = false,
  expandShadow = false,
  expandComposition = false,
  expandBorder = false,
}: Options) {
  const nestUnderParent = includeAllTokens ? true : includeParent;
  const tokenObj = {};
  tokenSets.forEach((tokenSet) => {
    tokens[tokenSet]?.forEach((token) => {
      const { name, ...tokenWithoutName } = token;

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
          const resolvedToken = resolvedTokens.find((t) => t.name === name);
          if (resolvedToken) {
            if (typeof resolvedToken.value === 'string') {
              set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, convertedToFormat);
            } else {
              const expanded = expand(resolvedToken?.value);
              const expandedToFormat = convertTokenToFormat(expanded, true);
              set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, { ...expandedToFormat });
            }
          } else {
            set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, convertedToFormat);
          }
        } else {
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
