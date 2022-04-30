import React from 'react';
import { SingleTypographyToken } from '@/types/tokens';
import { styled } from '@/stitches.config';
import Box from './Box';

type Props = {
  value: SingleTypographyToken['value']
};

const StyledPropertyItem = styled('div', {
  color: '$textSubtle',
  marginBottom: '$4',
});

const StyledValueItem = styled('div', {
  marginBottom: '$4',
});

const properties = ['Font', 'Weight', 'Size', 'Line height', 'Letter', 'Paragraph', 'Decoration', 'Text Case'];

export const ResolvedTypograhpyValueDisplay: React.FC<Props> = ({ value }) => {
  return (
    <Box css={{ display: 'flex', backgroundColor: '$bgSubtle', padding: '$4' }}>
      <Box css={{ display: 'grid', marginRight: '$6' }}>
        {
          properties.map((property, index) => {
            return <StyledPropertyItem key={index}>{property}</StyledPropertyItem>
          })
        }
      </Box>
      <Box>
        {
          Object.keys(value).map((key, index) => {
            return <StyledValueItem key={index}>{value[key]}</StyledValueItem>
          })
        }
      </Box>
    </Box>
  );
};
