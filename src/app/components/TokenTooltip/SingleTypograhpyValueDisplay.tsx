import React from 'react';
import { TokenTypograpyValue } from '@/types/values';
import TooltipProperty from './TooltipProperty';
import Stack from '../Stack';

type Props = {
  value: TokenTypograpyValue
  rawValue: TokenTypograpyValue
};

export const SingleTypographyValueDisplay: React.FC<Props> = ({ value, rawValue }) => (
  <Stack direction="column" align="start" gap={1}>
    <TooltipProperty label="Font" value={value.fontFamily} rawValue={rawValue?.fontFamily} />
    <TooltipProperty label="Weight" value={value.fontWeight} rawValue={rawValue?.fontWeight} />
    <TooltipProperty label="Size" value={value.fontSize} rawValue={rawValue?.fontSize} />
    <TooltipProperty label="Line height" value={value.lineHeight} rawValue={rawValue?.lineHeight} />
    <TooltipProperty label="Tracking" value={value.letterSpacing} rawValue={rawValue?.letterSpacing} />
    <TooltipProperty label="Paragraph spacing" value={value.paragraphSpacing} rawValue={rawValue?.paragraphSpacing} />
    <TooltipProperty label="Text case" value={value.textCase} rawValue={rawValue?.textCase} />
    <TooltipProperty label="Text decoration" value={value.textDecoration} rawValue={rawValue?.textDecoration} />
  </Stack>
);
