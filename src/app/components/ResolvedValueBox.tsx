import React, { useEffect } from 'react';
import { useUIDSeed } from 'react-uid';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import { isSingleBoxShadowToken, isSingleTypographyToken } from '@/utils/is';
import { TokensContext } from '@/context';
import { SingleTypographyToken } from '@/types/tokens';
import { TokenBoxshadowValue } from '@/types/values';
import Box from './Box';
import { SingleShadowValueDisplay } from './TokenTooltip/SingleShadowValueDisplay';
import { SingleTypographyValueDisplay } from './TokenTooltip/SingleTypograhpyValueDisplay';


export default function ResolvedValueBox({
  alias,
  selectedToken,
}: {
  alias: string;
  selectedToken: ResolveTokenValuesResult | undefined;
}) {
  const seed = useUIDSeed();
  const tokensContext = React.useContext(TokensContext);
  const valueToCheck = React.useMemo(() => (
    (selectedToken ? selectedToken?.value : alias )
  ), [selectedToken, tokensContext.resolvedTokens, alias]);

  useEffect(() => {
  }, [valueToCheck])

  useEffect(() => {
  }, [selectedToken])

  if (selectedToken && isSingleTypographyToken(selectedToken)) {
    return (
      <SingleTypographyValueDisplay
        value={valueToCheck as SingleTypographyToken['value']}
        shouldResolve={false}
      />
    );
  }

  if (selectedToken && isSingleBoxShadowToken(selectedToken)) {
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
        shadow={valueToCheck as TokenBoxshadowValue}
      />
    );
  }

  if (typeof valueToCheck !== 'string' && typeof valueToCheck !== 'number') {
    return <div>{JSON.stringify(valueToCheck, null, 2)}</div>;
  }

  return (
    <Box css={{
      display: 'flex', flexDirection: 'column', gap: '$2',
    }}>
      {valueToCheck}
    </Box>
  );
}
