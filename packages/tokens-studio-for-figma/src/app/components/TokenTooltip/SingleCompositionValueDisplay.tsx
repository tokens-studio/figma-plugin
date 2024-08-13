import React from 'react';
import { SingleToken } from '@/types/tokens';
import TooltipProperty from './TooltipProperty';
import { CompositionTokenValue } from '@/types/CompositionTokenProperty';

type Props = {
  property: string;
  value: SingleToken['value'] | number;
  resolvedValue: CompositionTokenValue | number | false;
};

export const SingleCompositionValueDisplay: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({ property, value, resolvedValue }) => {
  const resolvedValueString = (typeof resolvedValue === 'string' || typeof resolvedValue === 'number' || resolvedValue === undefined) ? resolvedValue : '…';
  return (
    <TooltipProperty
      label={property}
      value={typeof value === 'string' || typeof value === 'number' ? value : '…'}
      resolvedValue={(resolvedValue === false) ? undefined : resolvedValueString}
    />
  );
};
