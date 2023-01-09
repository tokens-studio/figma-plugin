import React from 'react';
import { styled } from '@/stitches.config';

const TriggerButton = styled('button', {
  width: '$5',
  height: '$5',
  borderRadius: '$2',
  border: '1px solid $borderMuted',
  cursor: 'pointer',
});

export default function ColorPickerTrigger({
  onClick, background,
}: { onClick?: () => void, background: string | undefined }) {
  return (
    <TriggerButton
      css={{ background }}
      onClick={onClick}
    />
  );
}
