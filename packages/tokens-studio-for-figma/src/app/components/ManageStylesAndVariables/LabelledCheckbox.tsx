import React from 'react';
import { Checkbox, Label, Stack } from '@tokens-studio/ui';

export const LabelledCheckbox = ({
  label, id, checked, onChange, name, disabled,
}: { label: string; id: string; checked: boolean; onChange: any, name?: string, disabled?: boolean }) => (
  <>
    {/* TODO, checkbox needs the name prop from the DS pr */}
    {/* @ts-ignore next-line */}
    <Stack direction="row" gap={2} css={{ alignItems: 'center', opacity: disabled ? 0.5 : 1 }}>
      <Checkbox name={name} id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} />
      <Label css={{ fontWeight: '$sansRegular', fontSize: '$xsmall', cursor: disabled ? 'not-allowed' : 'pointer' }} htmlFor={id}>{label}</Label>
    </Stack>
  </>
);
