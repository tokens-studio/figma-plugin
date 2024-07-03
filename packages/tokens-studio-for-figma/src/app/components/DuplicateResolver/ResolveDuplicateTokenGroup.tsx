import React from 'react';
import {
  Heading, RadioGroup, RadioIndicator, RadioItem, RadioItemBefore,
  Stack,
  Text,
  Tooltip,
} from '@tokens-studio/ui';
import { SingleToken } from '@/types/tokens';
import Box from '../Box';

function ResolveDuplicateTokenSingle({ token }: { token: SingleToken }) {
  return (
    <Tooltip label={`Type: ${token.type}`}>
      <Box
        css={{
          background: '$bgSubtle',
          fontSize: '$small',
          padding: '$2 $3',
          borderRadius: '$small',
          border: (typeof token.value === 'string' && (token.value as string).startsWith('#')) ? `1px solid ${token.value as string}` : undefined,
        }}
      >
        <Text>
          {token.value as string}
        </Text>
      </Box>
    </Tooltip>
  );
}

export default function ResolveDuplicateTokenGroup({
  setName, group, onRadioClick, selectedTokens,
}: {
  setName: string, group: [string, SingleToken[]], onRadioClick: (value: string) => void, selectedTokens: { [key: string]: { [key: string]: number | string } }
}) {
  const [groupKey, groupValue] = group;
  const checkedToken = `${setName}:${groupKey}:${selectedTokens?.[setName]?.[groupKey] || 0}`;

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
        <Heading size="small"><Box as="span" css={{ minWidth: '$9', display: 'inline-flex' }}>Token</Box>{groupKey}</Heading>
      </Stack>
      <Stack direction="row">
        <Heading size="small" css={{ minWidth: '$9' }}>Value</Heading>
        <RadioGroup
          onValueChange={onRadioClick}
          value={checkedToken}
          css={{ gap: '$3' }}
        >
          {groupValue.map((uniqueToken, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <RadioItem key={`${uniqueToken.name}-${i}`} value={`${setName}:${uniqueToken.name}:${i}`} css={{ alignItems: 'center' }}>
              <RadioItemBefore data-state={checkedToken === `${setName}:${uniqueToken.name}:${i}` ? 'checked' : 'unchecked'}>
                <RadioIndicator />
              </RadioItemBefore>
              <ResolveDuplicateTokenSingle token={uniqueToken} />
            </RadioItem>
          ))}
        </RadioGroup>
      </Stack>
    </Box>
  );
}
