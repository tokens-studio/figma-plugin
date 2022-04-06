import React from 'react';
import { styled } from '@/stitches.config';
import IconVisibility from './icons/IconVisibiltyOn';
import IconVisibilityOff from './icons/IconVisibilityOff';
import Box from './Box';
import Stack from './Stack';

type Props = {
  name: string;
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
  error?: string;
  required?: boolean;
  tabindex?: number | null;
  label?: string | null;
  full?: boolean;
  value?: string | number;
  defaultValue?: string | number;
  type?: string;
  custom?: string;
  placeholder?: string;
  capitalize?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  step?: string;
  min?: number;
  max?: number;
  isMasked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

const StyledIcon = styled('div', {
  width: '20px',
  height: '20px',
  marginRight: '4px',
  marginLeft: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
});

const StyledInput = styled('input', {
  padding: '0 $3',
  height: '28px',
  flexGrow: 1,
  width: '100%',
  backgroundColor: '$bgDefault',
  border: '1px solid $borderMuted',
  fontSize: '$xsmall',
  borderRadius: '$input',
  position: 'relative',

  '&:focus-within': {
    boxShadow: '$focus',
  },

  variants: {
    hasSuffix: {
      true: {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      },
    },
    hasPrefix: {
      true: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      },
    },
  },
});

const StyledSuffix = styled('button', {
  width: '28px',
  height: '28px',
  backgroundColor: '$bgDefault',
  border: '1px solid $borderMuted',
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  borderLeft: 0,
  display: 'flex',
  alignItems: 'center',

  '&:focus': {
    outline: 'none',
    backgroundColor: '$interaction',
    color: '$onInteraction',
  },
});

const StyledPrefix = styled('div', {
  padding: '0 $3',
  height: '28px',
  flexShrink: 0,
  border: '1px solid $borderMuted',
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
  borderRight: 0,
  backgroundColor: '$bgDefault',
  display: 'flex',
  alignItems: 'center',

  '&:focus': {
    outline: 'none',
    boxShadow: 'none',
    backgroundColor: '$bgSubtle',
  },
});

const Input: React.FC<Props> = ({
  name,
  error = '',
  required = false,
  tabindex = null,
  label = null,
  full,
  onChange,
  value,
  defaultValue,
  type,
  prefix,
  suffix,
  min,
  max,
  step,
  custom = '',
  inputRef = null,
  placeholder = '',
  capitalize = false,
  isMasked = false,
}) => {
  // if isMasked is true, then we need to handle toggle visibility
  const [show, setShow] = React.useState(false);

  // @TODO this causes new function refs on each render
  // should be a useCallback
  const handleVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShow(!show);
    if (inputRef?.current?.type) {
      inputRef.current.type = inputRef?.current?.type === 'password' ? 'text' : 'password';
    }
  };

  return (
    <label htmlFor={name} className="text-xxs font-medium block">
      {(!!label || !!error) && (
        <Stack direction="row" justify="between" align="center" css={{ marginBottom: '$1' }}>
          {label ? <div className={capitalize ? 'capitalize' : undefined}>{label}</div> : null}
          {error ? <div className="text-red-500 font-bold">{error}</div> : null}
        </Stack>
      )}
      <Box css={{ display: 'flex', position: 'relative', width: full ? '100%' : 0 }} className="input">
        {!!prefix && <StyledPrefix>{prefix}</StyledPrefix>}
        <StyledInput
          spellCheck={false}
          tabIndex={tabindex ?? undefined}
          type={type}
          value={value}
          defaultValue={defaultValue}
          name={name}
          onChange={onChange}
          required={required}
          min={min}
          max={max}
          step={step}
          data-custom={custom}
          ref={inputRef}
          placeholder={placeholder}
          hasPrefix={!!prefix}
          hasSuffix={!!isMasked}
        />
        {!!suffix && <span>{suffix}</span>}
        {isMasked && (
          <StyledSuffix type="button" onClick={handleVisibility}>
            <StyledIcon>{show ? <IconVisibility /> : <IconVisibilityOff />}</StyledIcon>
          </StyledSuffix>
        )}
      </Box>
    </label>
  );
};

export default Input;
