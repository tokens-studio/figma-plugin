import React from 'react';
import Stack from './Stack';
import Box from './Box';
import Text from './Text';
import { ImportToken } from '@/types/tokens';

export default function ChangedTokenInfo({
  token,
}: {
  token: ImportToken;
}) {
  return (
    <Stack direction="row" justify="between" css={{ padding: '$2 $4' }}>
      <Stack direction={token.importType === 'REMOVE' ? 'row' : 'column'} gap={1} justify="between" css={{ width: '100%' }}>
        <Text bold size="small">{token.name}</Text>
        {
          ((token.importType === 'UPDATE' && token.oldValue) || token.importType === 'NEW') && (
            <Stack direction="row" align="center" justify="between" gap={1}>
              <Text size="small">Value</Text>
              <Stack direction="row" align="center" gap={1}>
                {token.oldValue ? (
                  <Box css={{
                    padding: '$2',
                    wordBreak: 'break-all',
                    fontWeight: '$bold',
                    borderRadius: '$default',
                    fontSize: '$xsmall',
                    backgroundColor: '$bgDanger',
                    color: '$fgDanger',
                  }}
                  >
                    {typeof token.oldValue === 'object' ? JSON.stringify(token.oldValue) : token.oldValue}
                  </Box>
                ) : null}
                <Box css={{
                  padding: '$2',
                  wordBreak: 'break-all',
                  fontWeight: '$bold',
                  borderRadius: '$default',
                  fontSize: '$xsmall',
                  backgroundColor: '$bgSuccess',
                  color: '$fgSuccess',
                }}
                >
                  {typeof token.value === 'object' ? JSON.stringify(token.value) : token.value}
                </Box>
              </Stack>
            </Stack>
          )
        }
        {((token.importType === 'UPDATE' && token.oldDescription) || (token.importType === 'NEW' && token.description)) && (
        <Stack direction="row" align="start" justify="between" gap={1}>
          <Text size="small">Description</Text>
          <Stack direction="column" align="end" gap={1}>
            {token.oldDescription ? (
              <Box css={{
                padding: '$2',
                wordBreak: 'break-all',
                fontWeight: '$bold',
                borderRadius: '$default',
                fontSize: '$xsmall',
                backgroundColor: '$bgDanger',
                color: '$fgDanger',
              }}
              >
                {token.oldDescription}
              </Box>
            ) : null}
            <Box css={{
              padding: '$2',
              wordBreak: 'break-all',
              fontWeight: '$bold',
              borderRadius: '$default',
              fontSize: '$xsmall',
              backgroundColor: '$bgSuccess',
              color: '$fgSuccess',
            }}
            >
              {token.description}
            </Box>
          </Stack>
        </Stack>
        )}
        {
          token.importType === 'REMOVE' && (
          <Text
            size="small"
            css={{
              padding: '$2',
              wordBreak: 'break-all',
              fontWeight: '$bold',
              borderRadius: '$default',
              fontSize: '$xsmall',
              backgroundColor: '$bgDanger',
              color: '$fgDanger',
            }}
          >
            Removed
          </Text>
          )
        }
      </Stack>
    </Stack>
  );
}
