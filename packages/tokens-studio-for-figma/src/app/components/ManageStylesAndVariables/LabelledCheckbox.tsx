import React from 'react';
import { Checkbox, Label, Stack } from '@tokens-studio/ui';

export const LabelledCheckbox = ({
  label, id, checked, onChange, name,
}: { label: string; id: string; checked: boolean; onChange: any, name?: string }) => (
  <>
    {/* TODO, checkbox needs the name prop from the DS pr */}
    {/* @ts-ignore next-line */}
    <Stack direction="row" gap={2} css={{ alignItems: 'center' }}>
      <Checkbox name={name} id={id} checked={checked} onCheckedChange={onChange} />
      <Label css={{ fontWeight: '$sansRegular', fontSize: '$xsmall' }} htmlFor={id}>{label}</Label>
    </Stack>
  </>

);
