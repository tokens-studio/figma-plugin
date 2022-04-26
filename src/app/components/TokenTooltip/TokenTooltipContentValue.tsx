import React, { useEffect } from 'react';
import { useUIDSeed } from 'react-uid';
import useTokens from '../../store/useTokens';
import { SingleToken, SingleTypographyToken } from '@/types/tokens';
import { SingleShadowValueDisplay } from './SingleShadowValueDisplay';
import { TokensContext } from '@/context';
import { isSingleBoxShadowToken, isSingleTypographyToken } from '@/utils/is';
import { SingleTypographyValueDisplay } from './SingleTypograhpyValueDisplay';
import { TokenBoxshadowValue } from '@/types/values';

type Props = {
  token: SingleToken;
  shouldResolve?: boolean;
  tokenIsShadowOrTypographyAlias?: boolean;
};

// Returns token value in display format
export const TokenTooltipContentValue: React.FC<Props> = ({ token, shouldResolve = false, tokenIsShadowOrTypographyAlias = false }) => {
  useEffect(()=> {
    console.log("tokenIsShadowOrTypographyAlias", tokenIsShadowOrTypographyAlias,"token", token, "shouldResolve", shouldResolve)
  }, [])
  const seed = useUIDSeed();
  const tokensContext = React.useContext(TokensContext);
  let nameToLookFor: String ;
  const tokenValueString = String(token.value);
  if (tokenIsShadowOrTypographyAlias && tokenValueString.charAt(0) === '$') nameToLookFor = tokenValueString.slice(1, tokenValueString.length);
  if (tokenIsShadowOrTypographyAlias && tokenValueString.charAt(0) === '{') nameToLookFor = tokenValueString.slice(1, tokenValueString.length - 1);

  const { getTokenValue } = useTokens();
  const valueToCheck = React.useMemo(() => (
    (shouldResolve && tokenIsShadowOrTypographyAlias
      ? getTokenValue(nameToLookFor, tokensContext.resolvedTokens)?.value
      : shouldResolve 
        ? getTokenValue(token.name, tokensContext.resolvedTokens)?.value
        : token.value)
  ), [token, getTokenValue, shouldResolve, tokensContext.resolvedTokens]);
  console.log("valuetockh", valueToCheck, 'token', token)
  if (isSingleTypographyToken(token)) {
    return (
      <SingleTypographyValueDisplay
        // @TODO strengthen type checking here
        value={valueToCheck as SingleTypographyToken['value']}
        shouldResolve={shouldResolve}
      />
    );
  }

  if (isSingleBoxShadowToken(token)) {
    if (Array.isArray(valueToCheck)) {
      return (
        <div>
          {valueToCheck.map((t) => (
            <SingleShadowValueDisplay
              key={seed(t)}
              shadow={t}
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
    return <div>{JSON.stringify(valueToCheck, null, 2)}</div>;
  }

  return <div>{valueToCheck}</div>;
};
