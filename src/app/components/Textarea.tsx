import React from 'react';
import { styled } from '@/stitches.config';

const StyledTextarea = styled('textarea', {
  border: 0,
  height: '100%',
  '&:focus': {
    backgroundColor: '$bgSubtle',
  },
});

function Textarea({
  rows = 2,
  value,
  placeholder,
  isDisabled = false,
  onChange,
  css,
}: {
  rows?: number;
  value: string;
  placeholder?: string;
  isDisabled?: boolean;
  onChange?: Function;
  css?: any;
}) {
  return (
    <StyledTextarea
      spellCheck={false}
      rows={rows}
      placeholder={placeholder}
      css={css}
      value={value}
      disabled={isDisabled}
      onChange={(event) => onChange && onChange(event.target.value, event)}
    />
  );
}

export default Textarea;
