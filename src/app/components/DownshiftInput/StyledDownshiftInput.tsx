import React from 'react';
import type { GetInputPropsOptions } from 'downshift';
import { StyledInput } from '../Input';

type Props = {
  type: string;
  value?: string;
  placeholder?: string;
  suffix?: React.ReactNode;
  getInputProps: <T>(options?: T) => T & GetInputPropsOptions;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

export const StyledDownshiftInput: React.FC<Props> = ({
  type,
  value,
  placeholder,
  suffix,
  onChange,
  getInputProps,
}) => {
  const { ref, size, ...inputProps } = getInputProps({
    label: type || null,
    name: 'value',
    placeholder,
    value: value || '',
    onChange,
  });

  return (
    <StyledInput
      ref={ref as React.MutableRefObject<HTMLInputElement>}
      hasSuffix={!!suffix}
      {...inputProps}
    />
  );
};
