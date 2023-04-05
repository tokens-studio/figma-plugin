import React from 'react';
import { styled } from '@/stitches.config';

const TriggerButton = styled('button', {
  width: '$5',
  height: '$5',
  borderRadius: '$2',
  border: '1px solid $borderMuted',
  cursor: 'pointer',
  fontSize: 0,
});

type Props = {
  onClick?: () => void;
  background: string | undefined;
};

export const ColorPickerTrigger: React.FC<Props> = ({
  onClick, background,
}) => (
  <TriggerButton
    type="button"
    css={{ background }}
    onClick={onClick}
  />
);
