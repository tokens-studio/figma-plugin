import React from 'react';
import { TokenTypographyValue } from '@/types/values';
import TooltipProperty from './TooltipProperty';
import Stack from '../Stack';

type Props = {
  value: TokenTypographyValue;
  resolvedValue: TokenTypographyValue;
};

export const SingleTypographyValueDisplay: React.FC<Props> = ({ value, resolvedValue }) => (
  <Stack direction="column" align="start" gap={1}>
    {typeof value === 'string' ? (
      <TooltipProperty
        value={value}
      />
    ) : null}
    <TooltipProperty label="Font" value={value.fontFamily} resolvedValue={resolvedValue?.fontFamily} />
    <TooltipProperty label="Weight" value={value.fontWeight} resolvedValue={resolvedValue?.fontWeight} />
    <TooltipProperty label="Size" value={value.fontSize} resolvedValue={resolvedValue?.fontSize} />
    <TooltipProperty label="Line height" value={value.lineHeight} resolvedValue={resolvedValue?.lineHeight} />
    <TooltipProperty label="Tracking" value={value.letterSpacing} resolvedValue={resolvedValue?.letterSpacing} />
    <TooltipProperty
      label="Paragraph spacing"
      value={value.paragraphSpacing}
      resolvedValue={resolvedValue?.paragraphSpacing}
    />
    <TooltipProperty
      label="Paragraph indent"
      value={value.paragraphIndent}
      resolvedValue={resolvedValue?.paragraphIndent}
    />
    <TooltipProperty label="Text case" value={value.textCase} resolvedValue={resolvedValue?.textCase} />
    <TooltipProperty
      label="Text decoration"
      value={value.textDecoration}
      resolvedValue={resolvedValue?.textDecoration}
    />
  </Stack>
);
