import React from 'react';

import * as LabelPrimitive from '@radix-ui/react-label';
import { styled } from '@/stitches.config';

const StyledLabel = styled(LabelPrimitive.Root, {
  fontSize: 12,
  fontWeight: 500,
  color: '$textMuted',
  userSelect: 'none',
  pointerEvents: 'none',
  padding: '$3',
  borderRight: '1px solid $border',
  position: 'absolute',
  left: 0,
  top: 0,
  width: '80px',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

const Input = styled('input', {
  all: 'unset',
  borderRadius: '$input',
  padding: '$4 $3',
  paddingLeft: 'calc(80px + $4)',
  fontSize: 12,
  lineHeight: 1,
  color: '$text',
  border: '1px solid $border',
  width: '100%',
  '&:focus': { boxShadow: '$focus' },
});

const Wrapper = styled('div', {
  position: 'relative',
  display: 'flex',
});

type Props = {
  name: string
  label: string
  type: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  value?: string | number
  required?: boolean
  custom?: string
  placeholder?: string
};

function TokenInput({
  name, required = false, label, onChange, custom = '', value, type, placeholder = '',
}: Props) {
  return (
    <Wrapper>
      <StyledLabel htmlFor={name}>{label}</StyledLabel>
      <Input
        spellCheck={false}
        type={type}
        value={value}
        name={name}
        onChange={onChange}
        required={required}
        data-custom={custom}
        placeholder={placeholder}
      />
    </Wrapper>
  );
}

export default TokenInput;
