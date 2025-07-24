import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUIDSeed } from 'react-uid';
import { SingleBorderToken } from '@/types/tokens';
import { styled } from '@/stitches.config';
import Box from './Box';

type Props = {
  value: SingleBorderToken['value']
};

const StyledPropertyItem = styled('div', {
  color: '$fgMuted',
  marginBottom: '$2',
});

const StyledValueItem = styled('div', {
  marginBottom: '$2',
});

export const ResolvedBorderValueDisplay: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({ value }) => {
  const seed = useUIDSeed();
  const { t } = useTranslation(['tokens']);
  const properties = {
    color: t('border.color'),
    width: t('border.width'),
    style: t('border.style'),
  };

  return (
    <Box css={{
      display: 'flex', backgroundColor: '$bgSubtle', padding: '$4', fontSize: '$xsmall',
    }}
    >
      <Box css={{ display: 'grid', marginRight: '$6' }}>
        {Object.values(properties).map((v) => (
          <StyledPropertyItem key={seed(v)}>{v}</StyledPropertyItem>
        ))}

      </Box>
      <Box>
        {Object.keys(properties).map((key) => (
          <StyledValueItem key={seed(key)}>
            {value[key as keyof typeof value]}
            &nbsp;
          </StyledValueItem>
        ))}
      </Box>
    </Box>
  );
};
