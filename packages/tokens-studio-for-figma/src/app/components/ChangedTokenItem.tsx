import React from 'react';
import { useTranslation } from 'react-i18next';
import Stack from './Stack';
import Text from './Text';
import { ImportToken } from '@/types/tokens';
import { StyledDiff } from './StyledDiff';

export default function ChangedTokenItem({
  token,
}: {
  token: ImportToken;
}) {
  const { t } = useTranslation(['general']);

  return (
    <Stack direction="row" justify="between" css={{ padding: '$2 0' }}>
      <Stack direction={token.importType === 'REMOVE' ? 'row' : 'column'} gap={1} justify="between" css={{ width: '100%' }}>
        <Text bold size="small" css={{ wordBreak: 'break-word' }}>{token.name}</Text>
        {
          ((token.importType === 'UPDATE' && token.oldValue) || token.importType === 'NEW') && (
            <Stack direction="row" align="center" justify="between" gap={3}>
              <Text size="small">{t('value')}</Text>
              <Stack direction="row" align="center" gap={1} css={{ maxWidth: '60%' }}>
                {token.oldValue ? (
                  <StyledDiff type="danger">
                    {typeof token.oldValue === 'object' ? JSON.stringify(token.oldValue) : token.oldValue}
                  </StyledDiff>
                ) : null}
                <StyledDiff type="success">
                  {typeof token.value === 'object' ? JSON.stringify(token.value) : token.value}
                </StyledDiff>
              </Stack>
            </Stack>
          )
        }
        {((token.importType === 'UPDATE' && token.oldDescription) || (token.importType === 'NEW' && token.description)) && (
        <Stack direction="row" align="start" justify="between" gap={1}>
          <Text size="small">{t('description')}</Text>
          <Stack direction="column" align="end" gap={1} css={{ maxWidth: '60%' }}>
            {token.oldDescription ? (
              <StyledDiff type="danger">
                {token.oldDescription}
              </StyledDiff>
            ) : null}
            <StyledDiff type="success">
              {token.description}
            </StyledDiff>
          </Stack>
        </Stack>
        )}
        {
          token.importType === 'REMOVE' && (
            <StyledDiff type="danger">
              {t('removed')}
            </StyledDiff>
          )
        }
      </Stack>
    </Stack>
  );
}
