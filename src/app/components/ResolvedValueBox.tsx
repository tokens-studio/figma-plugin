import React from 'react';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import { isSingleBoxShadowToken, isSingleTypographyToken } from '@/utils/is';
import { SingleTypographyToken } from '@/types/tokens';
import Box from './Box';
import { ResolvedShadowValueDisplay } from './ResolvedShadowValueDisplay';
import { ResolvedTypograhpyValueDisplay } from './ResolvedTypograhpyValueDisplay';
import { TokenBoxshadowValue } from '@/types/values';

export default function ResolvedValueBox({
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
      <ResolvedTypograhpyValueDisplay
        value={valueToCheck as SingleTypographyToken['value']}
      />
    );
  }

  if (selectedToken && isSingleBoxShadowToken(selectedToken)) {
    if (Array.isArray(valueToCheck)) return <ResolvedShadowValueDisplay shadows={valueToCheck as TokenBoxshadowValue[]} />;
    return <ResolvedShadowValueDisplay shadows={[valueToCheck as TokenBoxshadowValue]} />;
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
