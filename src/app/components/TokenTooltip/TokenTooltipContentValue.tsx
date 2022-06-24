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
  tokenIsShadowOrTypographyAlias: boolean;
};

// Returns token value in display format
export const TokenTooltipContentValue: React.FC<Props> = ({ token, tokenIsShadowOrTypographyAlias }) => {
  const seed = useUIDSeed();
  const tokensContext = React.useContext(TokensContext);
  const { getTokenValue } = useTokens();
  const valueToCheck = React.useMemo(() => {
    if (tokenIsShadowOrTypographyAlias) {
      let nameToLookFor: string = '';
      const tokenValueString = String(token.value);
      if (tokenIsShadowOrTypographyAlias && tokenValueString.charAt(0) === '$') nameToLookFor = tokenValueString.slice(1, tokenValueString.length);
      if (tokenIsShadowOrTypographyAlias && tokenValueString.charAt(0) === '{') nameToLookFor = tokenValueString.slice(1, tokenValueString.length - 1);
      const tokenValue = getTokenValue(nameToLookFor, tokensContext.resolvedTokens)?.value;
      return tokenValue || token.value;
    }
    return getTokenValue(token.name, tokensContext.resolvedTokens)?.value;
  }, [token, getTokenValue, tokenIsShadowOrTypographyAlias, tokensContext.resolvedTokens]);

  if (isSingleTypographyToken(token)) {
    return (
      <SingleTypographyValueDisplay
        value={token.value as TokenTypograpyValue}
        rawValue={valueToCheck as TokenTypograpyValue}
      />
    );
  }

  if (isSingleCompositionToken(token)) {
    return (
      valueToCheck ? (
        <div>
          {Object.entries(valueToCheck).map(([property, value], index) => (
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
    if (Array.isArray(valueToCheck) && Array.isArray(token.value)) {
      return (
        <div>
          {valueToCheck.map((t, index) => (
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
        rawValue={valueToCheck as TokenBoxshadowValue}
      />
    );
  }

  if (typeof valueToCheck !== 'string' && typeof valueToCheck !== 'number') {
    return (
      <TooltipProperty value={JSON.stringify(valueToCheck, null, 2)} />
    );
  }

  return (
    <TooltipProperty value={token.value} rawValue={valueToCheck} />
  );
};
