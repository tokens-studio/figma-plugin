import React from 'react';
import { Checkbox, Label } from '@tokens-studio/ui';

export const LabelledCheckbox = ({
  label, id, checked, onChange, name,
}: { label: string; id: string; checked: boolean; onChange: any, name?: string }) => (
  <>
    {/* TODO, checkbox needs the name prop from the DS pr */}
    {/* @ts-ignore next-line */}
    <Checkbox name={name} id={id} checked={checked} onCheckedChange={onChange} />
    <Label css={{ fontWeight: '$sansRegular' }} htmlFor={id}>{label}</Label>
  </>

);
