import React from 'react';
import { useUIDSeed } from 'react-uid';
import useTokens from '../../store/useTokens';
import { SingleToken } from '@/types/tokens';
import { SingleShadowValueDisplay } from './SingleShadowValueDisplay';
import { TokensContext } from '@/context';
import { isSingleBoxShadowToken, isSingleTypographyToken, isSingleCompositionToken } from '@/utils/is';
import { SingleTypographyValueDisplay } from './SingleTypograhpyValueDisplay';
import { TokenBoxshadowValue, TokenTypograpyValue } from '@/types/values';
import { SingleCompositionValueDisplay } from './SingleCompositionValueDisplay';
import TooltipProperty from './TooltipProperty';

type Props = {
  token: SingleToken;
};

// Returns token value in display format
export const TokenTooltipContentValue: React.FC<Props> = ({ token }) => {
  const seed = useUIDSeed();
  const tokensContext = React.useContext(TokensContext);
  const { getTokenValue } = useTokens();
  const resolvedValue = React.useMemo(() => getTokenValue(token.name, tokensContext.resolvedTokens)?.value, [token, getTokenValue, tokensContext.resolvedTokens]);
  console.log('Token', token, tokensContext.resolvedTokens, resolvedValue);

  if (isSingleTypographyToken(token)) {
    return (
      <SingleTypographyValueDisplay
        value={token.value as TokenTypograpyValue}
        rawValue={resolvedValue as TokenTypograpyValue}
      />
    );
  }

  if (isSingleCompositionToken(token)) {
    return (
      resolvedValue ? (
        <div>
          {Object.entries(resolvedValue).map(([property, value], index) => (
            <SingleCompositionValueDisplay
              key={seed(index)}
              property={property}
              value={value}
            />
          ))}
        </div>
      ) : null
    );
  }

  if (isSingleBoxShadowToken(token)) {
    if (Array.isArray(resolvedValue) && Array.isArray(token.value)) {
      return (
        <div>
          {resolvedValue.map((t, index) => (
            <SingleShadowValueDisplay
              key={seed(t)}
              shadow={t as TokenBoxshadowValue}
              rawValue={Array.isArray(token.value) ? token.value[index] as TokenBoxshadowValue : null}
            />
          ))}
        </div>
      );
    }

    return (
      <SingleShadowValueDisplay
        // @TODO strengthen type checking here
        shadow={token.value as TokenBoxshadowValue}
        rawValue={resolvedValue as TokenBoxshadowValue}
      />
    );
  }

  if (typeof token.value !== 'string' && typeof token.value !== 'number') {
    return (
      <TooltipProperty value={JSON.stringify(token.value, null, 2)} />
    );
  }

  if (resolvedValue && typeof resolvedValue !== 'string' && typeof resolvedValue !== 'number') {
    return (
      <TooltipProperty value={token.value} rawValue={JSON.stringify(token.value, null, 2)} />
    );
  }

  return (
    <TooltipProperty value={token.value} rawValue={resolvedValue} />
  );
};
