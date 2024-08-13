import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUIDSeed } from 'react-uid';
import { SingleTypographyToken } from '@/types/tokens';
import { styled } from '@/stitches.config';
import Box from './Box';

type Props = {
  value: SingleTypographyToken['value']
};

const StyledPropertyItem = styled('div', {
  color: '$fgMuted',
  marginBottom: '$2',
});

const StyledValueItem = styled('div', {
  marginBottom: '$2',
});

export const ResolvedTypographyValueDisplay: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({ value }) => {
  const seed = useUIDSeed();

  const { t } = useTranslation(['tokens']);

  const properties = {
    fontFamily: t('font.fontFamily'),
    fontWeight: t('font.fontWeight'),
    fontSize: t('font.fontSize'),
    lineHeight: t('font.lineHeight'),
    letterSpacing: t('font.letterSpacing'),
    paragraphSpacing: t('font.paragraphSpacing'),
    paragraphIndent: t('font.paragraphIndent'),
    textDecoration: t('font.textDecoration'),
    textCase: t('font.textCase'),
  };

  return (
    <Box css={{
      display: 'flex', backgroundColor: '$bgSubtle', padding: '$4', fontSize: '$xsmall',
    }}
    >
      <Box css={{ display: 'grid', marginRight: '$6' }}>
        {Object.values(properties).map((value) => (
          <StyledPropertyItem key={seed(value)}>{value}</StyledPropertyItem>
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
