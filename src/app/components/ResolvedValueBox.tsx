import React, { useEffect } from 'react';
import { useUIDSeed } from 'react-uid';
import { getAliasValue } from '@/utils/alias';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import { isSingleBoxShadowToken, isSingleTypographyToken } from '@/utils/is';
import { TokenTypes } from '@/constants/TokenTypes';
import { TokensContext } from '@/context';
import { SingleToken, SingleTypographyToken } from '@/types/tokens';
import { TokenBoxshadowValue } from '@/types/values';
import { findReferences } from '../../utils/findReferences';
import useTokens from '../store/useTokens';
import Box from './Box';
import { SingleShadowValueDisplay } from './TokenTooltip/SingleShadowValueDisplay';
import { SingleTypographyValueDisplay } from './TokenTooltip/SingleTypograhpyValueDisplay';
import { EditTokenObject } from '../store/models/uiState';


export default function ResolvedValueBox({
  alias,
  selectedToken,
}: {
  alias: string;
  selectedToken: EditTokenObject | null;
}) {
  const seed = useUIDSeed();
  const tokensContext = React.useContext(TokensContext);
  const valueToCheck = React.useMemo(() => (
    (selectedToken ? selectedToken?.value : alias )
  ), [selectedToken, tokensContext.resolvedTokens, alias]);

  useEffect(() => {
    console.log("tochek", valueToCheck)
  }, [valueToCheck])

  if (selectedToken && isSingleTypographyToken(selectedToken)) {
    console.log("istyop", selectedToken)
    return (
      <SingleTypographyValueDisplay
        // @TODO strengthen type checking here
        value={valueToCheck as SingleTypographyToken['value']}
        shouldResolve={false}
      />
    );
  }

  if (selectedToken && isSingleBoxShadowToken(selectedToken)) {
    console.log("isbox", selectedToken)
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

  // const resolvedValue = React.useMemo(() => {
  //   if (alias) {
  //     return typeof alias === 'object'
  //       ? null
  //       : getAliasValue(alias, resolvedTokens);
  //   }
  //   return null;
  // }, [alias]);

  // const isJson = (str) => {
  //   try {
  //     JSON.parse(str);
  //   } catch (e) {
  //     return false;
  //   }
  //   return true;
  // };

  return (
    <Box css={{
      display: 'flex', flexDirection: 'column', gap: '$2',
    }}>
      {valueToCheck}
    </Box>
  );
}
