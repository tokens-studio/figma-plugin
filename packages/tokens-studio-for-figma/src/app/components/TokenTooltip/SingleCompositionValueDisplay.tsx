import React from 'react';
import { SingleToken } from '@/types/tokens';
import TooltipProperty from './TooltipProperty';
import { CompositionTokenValue } from '@/types/CompositionTokenProperty';

type Props = {
  property: string;
  value: SingleToken['value'] | number;
  resolvedValue: CompositionTokenValue | number;
};

export const SingleCompositionValueDisplay: React.FC<Props> = ({ property, value, resolvedValue }) => (
  <TooltipProperty
    label={property}
    value={typeof value === 'string' || typeof value === 'number' ? value : '…'}
    resolvedValue={typeof resolvedValue === 'string' || typeof resolvedValue === 'number' ? resolvedValue : '…'}
  />
);
