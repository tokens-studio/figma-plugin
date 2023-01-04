import React from 'react';
import type { GetInputPropsOptions } from 'downshift';
import { StyledInput } from '../Input';

type Props = {
  type: string;
  name?: string;
  value?: string;
  placeholder?: string;
  suffix?: React.ReactNode;
  getInputProps: <T>(options?: T) => T & GetInputPropsOptions;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.ChangeEventHandler<HTMLInputElement>;
};

export const StyledDownshiftInput: React.FC<Props> = ({
  type,
  name,
  value,
  placeholder,
  suffix,
  onChange,
  onBlur,
  getInputProps,
}) => {
  const { ref, size, ...inputProps } = getInputProps({
    label: type || null,
    name: name || 'value',
    placeholder,
    value: value || '',
    onChange,
    onBlur,
  });

  return (
    <StyledInput
      ref={ref as React.MutableRefObject<HTMLInputElement>}
      hasSuffix={!!suffix}
      {...inputProps}
    />
  );
};
