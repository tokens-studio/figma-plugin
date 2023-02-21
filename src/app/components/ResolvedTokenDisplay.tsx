import React from 'react';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import { isSingleBorderToken, isSingleBoxShadowToken, isSingleTypographyToken } from '@/utils/is';
import { SingleBorderToken, SingleTypographyToken } from '@/types/tokens';
import Box from './Box';
import { ResolvedShadowValueDisplay } from './ResolvedShadowValueDisplay';
import { ResolvedTypographyValueDisplay } from './ResolvedTypographyValueDisplay';
import { TokenBoxshadowValue } from '@/types/values';
import { ResolvedBorderValueDisplay } from './ResolvedBorderValueDisplay';

export default function ResolvedTokenDisplay({
  alias,
  selectedToken,
}: {
  alias: string;
  selectedToken: ResolveTokenValuesResult | null;
}) {
  const valueToCheck = React.useMemo(() => (
    (selectedToken ? selectedToken?.value : alias)
  ), [selectedToken, alias]);

  if (selectedToken && isSingleTypographyToken(selectedToken)) {
    return (
      <ResolvedTypographyValueDisplay
        value={valueToCheck as SingleTypographyToken['value']}
      />
    );
  }

  if (selectedToken && isSingleBoxShadowToken(selectedToken)) {
    if (Array.isArray(valueToCheck)) return <ResolvedShadowValueDisplay shadows={valueToCheck as TokenBoxshadowValue[]} />;
    return <ResolvedShadowValueDisplay shadows={[valueToCheck as TokenBoxshadowValue]} />;
  }

  if (selectedToken && isSingleBorderToken(selectedToken)) {
    return (
      <ResolvedBorderValueDisplay
        value={valueToCheck as SingleBorderToken['value']}
      />
    );
  }

  if (typeof valueToCheck !== 'string' && typeof valueToCheck !== 'number') {
    return <div>{JSON.stringify(valueToCheck, null, 2)}</div>;
  }

  return (
    <Box css={{ display: 'flex', flexDirection: 'column', gap: '$2' }}>
      {valueToCheck}
    </Box>
  );
}
