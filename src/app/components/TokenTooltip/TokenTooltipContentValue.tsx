import React from 'react';
import { useUIDSeed } from 'react-uid';
import useTokens from '../../store/useTokens';
import { SingleToken } from '@/types/tokens';
import { SingleShadowValueDisplay } from './SingleShadowValueDisplay';
import { TokensContext } from '@/context';
import { isSingleBoxShadowToken, isSingleTypographyToken, isSingleCompositionToken } from '@/utils/is';
import { SingleTypographyValueDisplay } from './SingleTypographyValueDisplay';
import { TokenBoxshadowValue, TokenTypographyValue } from '@/types/values';
import Box from '../Box';
import { SingleCompositionValueDisplay } from './SingleCompositionValueDisplay';

type Props = {
  token: SingleToken;
  shouldResolve: boolean;
  tokenIsShadowOrTypographyAlias: boolean;
};

// Returns token value in display format
export const TokenTooltipContentValue: React.FC<Props> = ({ token, shouldResolve, tokenIsShadowOrTypographyAlias }) => {
  const seed = useUIDSeed();
  const tokensContext = React.useContext(TokensContext);
  const { getTokenValue } = useTokens();
  const valueToCheck = React.useMemo(() => {
    if (shouldResolve && tokenIsShadowOrTypographyAlias) {
      let nameToLookFor: string = '';
      const tokenValueString = String(token.value);
      if (tokenIsShadowOrTypographyAlias && tokenValueString.charAt(0) === '$') nameToLookFor = tokenValueString.slice(1, tokenValueString.length);
      if (tokenIsShadowOrTypographyAlias && tokenValueString.charAt(0) === '{') nameToLookFor = tokenValueString.slice(1, tokenValueString.length - 1);
      const tokenValue = getTokenValue(nameToLookFor, tokensContext.resolvedTokens)?.value;
      return tokenValue || token.value;
    }
    if (shouldResolve) return getTokenValue(token.name, tokensContext.resolvedTokens)?.value;
    return token.value;
  }, [token, getTokenValue, shouldResolve, tokenIsShadowOrTypographyAlias, tokensContext.resolvedTokens]);

  if (isSingleTypographyToken(token)) {
    return (
      <SingleTypographyValueDisplay
        value={valueToCheck as TokenTypographyValue}
        shouldResolve={shouldResolve}
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
    if (Array.isArray(valueToCheck)) {
      return (
        <div>
          {valueToCheck.map((t) => (
            <SingleShadowValueDisplay
              key={seed(t)}
              shadow={t as TokenBoxshadowValue}
            />
          ))}
        </div>
      );
    }

    return (
      <SingleShadowValueDisplay
        // @TODO strengthen type checking here
        shadow={valueToCheck as TokenBoxshadowValue}
      />
    );
  }

  if (typeof valueToCheck !== 'string' && typeof valueToCheck !== 'number') {
    return <Box css={{ color: '$fgToolTipMuted' }}>{JSON.stringify(valueToCheck, null, 2)}</Box>;
  }

  return <Box css={{ color: '$fgToolTipMuted' }}>{valueToCheck}</Box>;
};
