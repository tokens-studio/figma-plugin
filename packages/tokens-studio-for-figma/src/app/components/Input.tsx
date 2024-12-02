import React, { useCallback } from 'react';
import { styled } from '@/stitches.config';
import IconVisibility from '@/icons/visibilityon.svg';
import IconVisibilityOff from '@/icons/visibilityoff.svg';
import type { StitchesCSS } from '@/types';
import Box from './Box';
import Stack from './Stack';
import { ErrorValidation } from './ErrorValidation';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  form?: string;
  name?: string;
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
  error?: string | null;
  required?: boolean;
  autofocus?: boolean;
  tabindex?: number | null;
  label?: string | null;
  full?: boolean;
  value?: string | number;
  defaultValue?: string | number;
  type?: string;
  custom?: string;
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  step?: string;
  isMasked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  size?: 'small' | 'large';
  css?: StitchesCSS
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
  flexGrow: 1,
  width: '100%',
  backgroundColor: '$bgDefault',
  border: '1px solid $borderMuted',
  fontSize: '$xsmall',
  borderRadius: '$small',
  position: 'relative',

  '&:focus-within': {
    boxShadow: '$focus',
  },

  variants: {
    size: {
      small: {
        height: '$controlSmall',
      },
      large: {
        height: '$controlLarge',
      },
    },
    hasSuffix: {
      true: {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderRight: 0,
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
  backgroundColor: '$bgDefault',
  border: '1px solid $borderMuted',
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  borderLeft: 0,
  display: 'flex',
  alignItems: 'center',

  '&:focus': {
    outline: 'none',
    backgroundColor: '$accentDefault',
    color: '$fgOnEmphasis',
  },

  variants: {
    size: {
      small: {
        width: '$controlSmall',
        height: '$controlSmall',
      },
      large: {
        width: '$controlLarge',
        height: '$controlLarge',
      },
    },
  },
});

const StyledPrefix = styled('div', {
  padding: '0 $3',
  height: '$controlSmall',
  flexShrink: 0,
  border: '1px solid $borderMuted',
  borderRadius: '$small',
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
  borderRight: 0,
  backgroundColor: '$bgDefault',
  display: 'flex',
  alignItems: 'center',
  fontSize: '$xsmall',
  color: '$fgMuted',

  '&:focus': {
    outline: 'none',
    boxShadow: 'none',
    backgroundColor: '$bgSubtle',
  },

  variants: {
    isText: {
      true: {
        minWidth: '60px',
      },
    },
    isComposition: {
      true: {
        padding: '0',
      },
    },
  },
});

const StyledLabel = styled('label', {
  display: 'block',
  fontWeight: '$sansBold',
  fontSize: '$small',
});

const Input = React.forwardRef<HTMLInputElement, Props>(({
  form,
  name,
  autofocus,
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
  step,
  custom = '',
  inputRef,
  placeholder = '',
  isMasked = false,
  size = 'small',
  ...inputProps
}, ref) => {
  // if isMasked is true, then we need to handle toggle visibility
  const [show, setShow] = React.useState(false);
  const htmlInputRef = React.useRef<HTMLInputElement>(null);
  const reifiedRef = inputRef || htmlInputRef;

  const handleVisibility = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShow(!show);
    if (reifiedRef?.current?.type) {
      reifiedRef.current.type = reifiedRef?.current?.type === 'password' ? 'text' : 'password';
    }
  }, [show, reifiedRef]);

  React.useEffect(() => {
    if (autofocus && htmlInputRef && htmlInputRef.current) {
      htmlInputRef.current.focus();
    }
  }, [autofocus, htmlInputRef]);

  return (
    <StyledLabel htmlFor={name} css={{ width: full ? '100%' : '' }}>
      {(!!label || !!error) && (
        <Stack direction="row" justify="between" align="center" css={{ marginBottom: '$1' }}>
          {label || null}
          {error ? (
            <ErrorValidation>{error}</ErrorValidation>
          ) : null}
        </Stack>
      )}
      <Box css={{ display: 'flex', position: 'relative', width: full ? '100%' : '' }} className="input">
        {!!prefix && <StyledPrefix>{prefix}</StyledPrefix>}
        <StyledInput
          form={form}
          ref={inputRef || ref || htmlInputRef}
          spellCheck={false}
          tabIndex={tabindex ?? undefined}
          type={type}
          value={value}
          defaultValue={defaultValue}
          name={name}
          onChange={onChange}
          required={required}
          autoFocus={autofocus}
          step={step}
          data-custom={custom}
          placeholder={placeholder}
          hasPrefix={!!prefix}
          hasSuffix={!!isMasked}
          size={size}
          data-testid={`input-${name}`}
          {...inputProps}
        />
        {!!suffix && <span>{suffix}</span>}
        {isMasked && (
          <StyledSuffix type="button" onClick={handleVisibility}>
            <StyledIcon>{show ? <IconVisibility /> : <IconVisibilityOff />}</StyledIcon>
          </StyledSuffix>
        )}
      </Box>
    </StyledLabel>
  );
});

export default Input;
export { StyledInput, StyledPrefix, StyledSuffix };
