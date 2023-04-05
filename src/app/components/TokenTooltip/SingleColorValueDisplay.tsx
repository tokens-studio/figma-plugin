import React from 'react';
import TooltipProperty from './TooltipProperty';
import Stack from '../Stack';
import { ColorModifier } from '@/types/Modifier';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import Box from '../Box';

type Props = {
  value: string;
  resolvedValue: string
  modifier: ColorModifier | undefined;
};

export const SingleColorValueDisplay: React.FC<Props> = ({ value, resolvedValue, modifier }) => (
  <Stack direction="column" align="start" gap={1}>
    <Box css={{ color: '$fgToolTipMuted' }}>
      {
      modifier && (
        modifier.type === ColorModifierTypes.MIX ? (
          <span>{`mix(${modifier.color}, ${modifier.value}) / ${modifier.space}`}</span>
        ) : (
          <span>{`${modifier.type}(${modifier.value}) / ${modifier.space}`}</span>
        )
      )
    }
    </Box>
    <TooltipProperty value={value} resolvedValue={resolvedValue} />
  </Stack>
);
