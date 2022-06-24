import React from 'react';
import Box from '../Box';
import Stack from '../Stack';
import { TokenBoxshadowValue } from '@/types/values';
import TooltipProperty from './TooltipProperty';

type Props = {
  shadow: TokenBoxshadowValue
  rawValue: TokenBoxshadowValue | null
};

// @TODO: Figure out how to display resolved shadow value without seeming duplicative / like we do for typography a shorthand

export const SingleShadowValueDisplay: React.FC<Props> = ({ shadow, rawValue }) => (
  <Box>
    <Box css={{ display: 'flex', color: '$fgToolTip' }}>{shadow.type}</Box>
    <Stack direction="column" gap={1}>
      <TooltipProperty label="x" value={shadow.x} rawValue={rawValue?.x} />
      <TooltipProperty label="y" value={shadow.y} rawValue={rawValue?.y} />
      <TooltipProperty label="Blur" value={shadow.blur} rawValue={rawValue?.blur} />
      <TooltipProperty label="Spread" value={shadow.spread} rawValue={rawValue?.spread} />
      <TooltipProperty label="Color" value={shadow.color} rawValue={rawValue?.color} />
    </Stack>
  </Box>
);
