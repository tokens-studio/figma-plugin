import React from 'react';
import { styled } from '@/stitches.config';

const StyledTextarea = styled('textarea', {
  border: 0,
  height: '100%',
  width: '100%',
  backgroundColor: '$bgDefault',
  fontSize: '$xsmall',
  padding: '$3',
  borderRadius: '$default',
  fontFamily: '$mono',
  resize: 'none',
  '&:focus': {
    backgroundColor: '$bgSubtle',
    outline: 'none',
  },
  variants: {
    border: {
      true: {
        border: '1px solid $borderMuted',
      },
    },
  },
});

function Textarea({
  id,
  name,
  rows = 2,
  value,
  placeholder,
  isDisabled = false,
  onChange,
  css,
  border,
}: {
  id?: string;
  name?: string;
  rows?: number;
  value: string;
  placeholder?: string;
  isDisabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  css?: any;
  border?: boolean
}) {
  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(event);
    }
  }, [onChange]);

  return (
    <StyledTextarea
      data-cy={id}
      data-testid={id}
      name={name}
      spellCheck={false}
      rows={rows}
      placeholder={placeholder}
      css={css}
      value={value}
      disabled={isDisabled}
      border={border}
      onChange={handleChange}
    />
  );
}

export default Textarea;
