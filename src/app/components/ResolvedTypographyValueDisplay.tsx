import React from 'react';
import { useUIDSeed } from 'react-uid';
import { SingleTypographyToken } from '@/types/tokens';
import { styled } from '@/stitches.config';
import Box from './Box';

type Props = {
  value: SingleTypographyToken['value']
};

const StyledPropertyItem = styled('div', {
  color: '$textSubtle',
  marginBottom: '$2',
});

const StyledValueItem = styled('div', {
  marginBottom: '$2',
});

const properties = {
  fontFamily: 'Font',
  fontWeight: 'Weight',
  fontSize: 'Size',
  lineHeight: 'Line height',
  letterSpacing: 'Letter',
  paragraphSpacing: 'Paragraph Spacing',
  paragraphIndent: 'Paragraph Indent',
  textDecoration: 'Decoration',
  textCase: 'Text Case',
};

export const ResolvedTypographyValueDisplay: React.FC<Props> = ({ value }) => {
  const seed = useUIDSeed();

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
