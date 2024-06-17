import React, { useState } from 'react';
import {
  Heading, RadioGroup, RadioIndicator, RadioItem, RadioItemBefore,
  Stack,
  Text,
} from '@tokens-studio/ui';
import { AnyTokenList, SingleToken } from '@/types/tokens';
import Box from '../Box';
// import ResolveDuplicateTokenSingle from './ResolveDuplicateTokenSingle';

function ResolveDuplicateTokenSingle({ token }: { token: SingleToken }) {
  // const { getTokenValue } = useTokens();
  // const duplicateResolvedTokens = resolvedTokens.filter((t) => t.name === token.name);
  // const resolvedToken = duplicateResolvedTokens[index];
  return (
    <>
      {/* <></> */}
      {/* <Stack css={{ width: '$8' }}>
        <InspectorResolvedToken token={resolvedToken as any} />
      </Stack> */}
      <Box
        css={{
          background: '$bgSubtle',
          fontSize: '$small',
          padding: '$2 $3',
          borderRadius: '$small',
          // minWidth: '$9',
        }}
      >
        <Text>
          {token.value as string}
        </Text>
      </Box>
    </>
  );
}

export default function ResolveDuplicateTokenGroup({ set, group, tokens }: { set: string, group: [string, SingleToken[]] }) {
  const [groupKey, groupValue] = group;
  const [checkedToken, setCheckedToken] = useState(`${groupKey}-0`);

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
      <Stack direction="row" css={{ marginBottom: '$4' }}>
        <Heading size="small" css={{ minWidth: '$9' }}>Token: </Heading>
        <Heading size="small">{groupKey}</Heading>
      </Stack>
      <Stack direction="row">
        <Heading size="small" css={{ minWidth: '$9' }}>Value: </Heading>
        <RadioGroup
          onValueChange={(value) => setCheckedToken(value)}
          value={checkedToken}
          css={{ gap: 0 }}
        >
          {groupValue.map((uniqueToken, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <RadioItem key={`${uniqueToken.name}-${i}`} value={`${uniqueToken.name}-${i}`}>
              <RadioItemBefore data-state={checkedToken === `${uniqueToken.name}-${i}` ? 'checked' : 'unchecked'}>
                <RadioIndicator />
              </RadioItemBefore>
              <ResolveDuplicateTokenSingle token={uniqueToken} />
            </RadioItem>
            // <ResolveDuplicateTokenSingle key={`${uniqueToken.name}-${uniqueToken.value}`} token={uniqueToken} resolvedTokens={resolvedTokens} />
          ))}
        </RadioGroup>
      </Stack>
    </Box>
  );
}
