import React from 'react';
import { styled } from '@/stitches.config';
import Box from '../Box';
import { SingleToken } from '@/types/tokens';

type Props = {
  property: string;
  value: SingleToken['value'] | number
};

const StyledItemValue = styled('div', {
  fontWeight: '$bold',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  maxWidth: '300px',
});

const StyledItemName = styled('div', {
  flexShrink: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const SingleCompositionValueDisplay: React.FC<Props> = ({ property, value }) => {
  const resolveValue = React.useMemo(() => {
    let returnValue: string = '';
    if (Array.isArray(value)) {
      returnValue = value.reduce<string>((totalAcc, item) => {
        const singleReturnValue = Object.entries(item).reduce<string>((acc, [, propertyValue]) => (
          `${acc}${propertyValue.toString()}/`
        ), '');
        return `${totalAcc}${singleReturnValue},`;
      }, '');
    } else if (typeof value === 'object') {
      returnValue = Object.entries(value).reduce<string>((acc, [, propertyValue]) => (
        `${acc}${propertyValue.toString()}/`
      ), '');
    } else if (typeof value === 'number') {
      returnValue = value.toString();
    } else {
      returnValue = value;
    }
    return returnValue;
  }, [value]);

  return (
    <Box css={{ color: '$fgToolTipMuted', display: 'flex', gap: '$2' }}>
      <StyledItemName>{`${property} : `}</StyledItemName>
      <StyledItemValue>{resolveValue}</StyledItemValue>
    </Box>
  );
};
