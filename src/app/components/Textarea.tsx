import * as React from 'react';
import { styled } from '@/stitches.config';

const StyledTextarea = styled('textarea', {
  border: 0,
  height: '100%',
  width: '100%',
  border: '1px solid $borderMuted',
  backgroundColor: '$bgDefault',
  fontSize: '$xsmall',
  padding: '$3',
  borderRadius: '$default',
  fontFamily: '$mono',
  resize: 'none',
  '&:focus': {
    backgroundColor: '$bgSubtle',
    borderColor: '$border',
    outline: 'none',
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
