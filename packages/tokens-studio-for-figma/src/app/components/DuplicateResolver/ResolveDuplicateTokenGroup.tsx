import React from 'react';
import { Heading } from '@tokens-studio/ui';
import { SingleToken } from '@/types/tokens';
import Box from '../Box';
import ResolveDuplicateTokenSingle from './ResolveDuplicateTokenSingle';
// import { Properties } from '@/constants/Properties';
// import { SelectionGroup } from '@/types';

export default function ResolveDuplicateTokenGroup({ group, resolvedTokens }: { group: [string, SingleToken[]], resolvedTokens: SingleToken[] }) {
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
      {groupValue.map((uniqueToken) => <ResolveDuplicateTokenSingle key={`${uniqueToken.name}-${uniqueToken.value}`} token={uniqueToken} resolvedTokens={resolvedTokens} />)}
    </Box>
  );
}
