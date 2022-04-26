import React from 'react';
import { useUIDSeed } from 'react-uid';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import { isSingleBoxShadowToken, isSingleTypographyToken } from '@/utils/is';
import { TokensContext } from '@/context';
import { SingleTypographyToken } from '@/types/tokens';
import { TokenBoxshadowValue } from '@/types/values';
import Box from './Box';
import { ResolvedShadowValueDisplay } from './ResolvedShadowValueDisplay';
import { ResolvedTypograhpyValueDisplay } from './ResolvedTypograhpyValueDisplay';


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

  if (selectedToken && isSingleTypographyToken(selectedToken)) {
    return (
      <ResolvedTypograhpyValueDisplay value={valueToCheck as SingleTypographyToken['value']}/>
    );
  }

  if (selectedToken && isSingleBoxShadowToken(selectedToken)) {
    if (Array.isArray(valueToCheck)) {
      return (
        <div>
          {valueToCheck.map((t, index) => (
            <ResolvedShadowValueDisplay
              key={seed(t)}
              shadow={t}
              index={index}
            />
          ))}
        </div>
      );
    }

    return (
      <ResolvedShadowValueDisplay
        shadow={valueToCheck as TokenBoxshadowValue}
        index={1}
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
