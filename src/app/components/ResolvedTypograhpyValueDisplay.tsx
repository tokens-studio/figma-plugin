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

const properties = ['Font', 'Weight', 'Size', 'Line height', 'Letter', 'Paragraph', 'Decoration', 'Text Case'];

export const ResolvedTypograhpyValueDisplay: React.FC<Props> = ({ value }) => {
  const seed = useUIDSeed();

  return (
    <Box css={{
      display: 'flex', backgroundColor: '$bgSubtle', padding: '$4', fontSize: '$xsmall',
    }}
    >
      <Box css={{ display: 'grid', marginRight: '$6' }}>
        {properties.map((property) => (
          <StyledPropertyItem key={seed(property)}>{property}</StyledPropertyItem>
        ))}
      </Box>
      <Box>
        {Object.keys(value).map((key) => (
          <StyledValueItem key={seed(key)}>{value[key]}</StyledValueItem>
        ))}
      </Box>
    </Box>
  );
};
