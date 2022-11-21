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

export const StyledDownshiftInput = React.forwardRef<HTMLInputElement, Props>(({
  type,
  name,
  value,
  placeholder,
  suffix,
  onChange,
  onBlur,
  ...inputProps
}, ref) => (
  <StyledInput
    ref={ref}
    hasSuffix={!!suffix}
    type={type}
    name={name}
    value={value}
    placeholder={placeholder}
    onChange={onChange}
    onBlur={onBlur}
    {...inputProps}
  />
));
