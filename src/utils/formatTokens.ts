import set from 'set-value';
import { expand } from '@/utils/expand';
import { AnyTokenList } from '@/types/tokens';

type Options = {
  tokens: Record<string, AnyTokenList>;
  tokenSets: string[];
  includeAllTokens?: boolean;
  includeParent?: boolean;
  expandTypography?: boolean;
  expandShadow?: boolean;
};

export default function formatTokens({
  tokens,
  tokenSets,
  includeAllTokens = false,
  includeParent = true,
  expandTypography = false,
  expandShadow = false,
}: Options) {
  const nestUnderParent = includeAllTokens ? true : includeParent;
  const tokenObj = {};

  tokenSets.forEach((tokenSet) => {
    tokens[tokenSet].forEach((token) => {
      const { name, ...tokenWithoutName } = token;
      if (
        (token.type === 'typography' && expandTypography)
        || (token.type === 'boxShadow' && expandShadow)
      ) {
        const expanded = expand(tokenWithoutName.value);
        set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, { ...expanded });
      } else {
        set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, tokenWithoutName);
      }
    });
  });

  return JSON.stringify(tokenObj, null, 2);
}
