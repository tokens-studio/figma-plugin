import React from 'react';
import { SelectionGroup, SingleTokenObject } from '@/types/tokens';
import Box from './Box';
import Heading from './Heading';
import InspectorTokenSingle from './InspectorTokenSingle';
import { Properties } from '@/constants/Properties';
import useTokens from '../store/useTokens';

export default function InspectorTokenGroup({ group, resolvedTokens }: { group: [Properties, SelectionGroup[]], resolvedTokens: SingleTokenObject[] }) {
  const { getTokenValue } = useTokens();

  const [groupKey, groupValue] = group;
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
      {groupValue.map((uniqueToken) => <InspectorTokenSingle key={`${uniqueToken.category}-${uniqueToken.value}`} token={uniqueToken} mappedToken={getTokenValue(uniqueToken.value, resolvedTokens)} />)}
    </Box>
  );
}
