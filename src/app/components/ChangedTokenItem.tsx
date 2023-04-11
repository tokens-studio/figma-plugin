import React from 'react';
import Stack from './Stack';
import Text from './Text';
import { ImportToken } from '@/types/tokens';
import { StyledText } from './StyledText';

export default function ChangedTokenItem({
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
                  <StyledText size="small" type="danger">
                    {typeof token.oldValue === 'object' ? JSON.stringify(token.oldValue) : token.oldValue}
                  </StyledText>
                ) : null}
                <StyledText size="small" type="success">
                  {typeof token.value === 'object' ? JSON.stringify(token.value) : token.value}
                </StyledText>
              </Stack>
            </Stack>
          )
        }
        {((token.importType === 'UPDATE' && token.oldDescription) || (token.importType === 'NEW' && token.description)) && (
        <Stack direction="row" align="start" justify="between" gap={1}>
          <Text size="small">Description</Text>
          <Stack direction="column" align="end" gap={1}>
            {token.oldDescription ? (
              <StyledText size="small" type="danger">
                {token.oldDescription}
              </StyledText>
            ) : null}
            <StyledText size="small" type="success">
              {token.description}
            </StyledText>
          </Stack>
        </Stack>
        )}
        {
          token.importType === 'REMOVE' && (
            <StyledText size="small" type="danger">
              Removed
            </StyledText>
          )
        }
      </Stack>
    </Stack>
  );
}
