import React from 'react';
import { SingleToken } from '@/types/tokens';
import Box from './Box';
import Heading from './Heading';
import InspectorTokenSingle from './InspectorTokenSingle';
import { Properties } from '@/constants/Properties';
import { SelectionGroup } from '@/types';

export default function InspectorTokenGroup({ group, resolvedTokens }: { group: [Properties, SelectionGroup[]], resolvedTokens: SingleToken[] }) {
  const [groupKey, groupValue] = group;
  const groupToDisplay = React.useMemo(() => {
    const localStyleIndex = groupValue.findIndex((g) => !!g.resolvedValue);
    const tokenIndex = groupValue.findIndex((g) => !g.resolvedValue);
    const checkIfBothTokenAndStyleApplied = localStyleIndex > -1 && tokenIndex > -1;
    return checkIfBothTokenAndStyleApplied ? groupValue.filter((g) => !g.resolvedValue) : groupValue;
  }, [groupValue]);

  return (
    <Box
      css={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginBottom: '$3',
      }}
      key={`${groupKey}`}
    >
      <Heading size="small">{groupKey}</Heading>
      {groupToDisplay.map((uniqueToken) => <InspectorTokenSingle key={`${uniqueToken.category}-${uniqueToken.value}`} token={uniqueToken} resolvedTokens={resolvedTokens} />)}
    </Box>
  );
}
