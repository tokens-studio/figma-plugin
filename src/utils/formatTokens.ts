import set from 'set-value';
import { expand } from '@/utils/expand';
import { AnyTokenList } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';

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
              set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, tokenWithoutName);
            } else {
              const expanded = expand(resolvedToken?.value);
              set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, { ...expanded });
            }
          } else {
            set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, tokenWithoutName);
          }
        } else {
          const expanded = expand(tokenWithoutName.value);
          set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, { ...expanded });
        }
      } else {
        set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, tokenWithoutName);
      }
    });
  });

  return JSON.stringify(tokenObj, null, 2);
}
