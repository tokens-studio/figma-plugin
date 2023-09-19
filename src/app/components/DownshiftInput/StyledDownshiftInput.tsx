import React from 'react';
import type { GetInputPropsOptions } from 'downshift';
import { FixedSizeList as List } from 'react-window';
import { styled } from '@/stitches.config';
import { StyledInput } from '../Input';

type Props = {
  type?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  suffix?: React.ReactNode;
  inputRef: React.RefObject<HTMLInputElement>;
  dataCy?: string;
  getInputProps: <T>(options?: T) => T & GetInputPropsOptions;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.ChangeEventHandler<HTMLInputElement>;
};

export const StyledDropdown = styled('div', {
  position: 'absolute',
  zIndex: '10',
  width: '100%',
  maxHeight: '30vh',
  borderBottomLeftRadius: '$medium',
  borderBottomRightRadius: '$medium',
  overflowY: 'scroll',
  backgroundColor: '$bgDefault',
  cursor: 'pointer',
  boxShadow: '$contextMenu',
});

export const StyledList = styled(List, {
  position: 'absolute',
  zIndex: '10',
  width: 'calc(100% - $scrollbarWidth)',
  maxHeight: '30vh',
  overflowY: 'scroll',
  backgroundColor: '$bgDefault',
  marginTop: '1px',
  cursor: 'pointer',
  boxShadow: '$contextMenu',
});

export const StyledItemValue = styled('div', {
  color: 'var(--mentions-color-muted, var(--colors-fgMuted))',
  fontWeight: '$bold',
  textAlign: 'right',
  maxWidth: '300px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const StyledItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $3',
  borderRadius: '$small',
  fontSize: '$xsmall',
  variants: {
    isFocused: {
      true: {
        backgroundColor: '$accentDefault',
        color: '$fgOnEmphasis',
        [`& ${StyledItemValue}`]: {
          color: '$fgOnEmphasis',
        },
      },
    },
  },
});

export const StyledItemColorDiv = styled('div', {
  flexShrink: 0,
});

export const StyledItemColor = styled('div', {
  width: '16px',
  height: '16px',
  borderRadius: '$colorSwatch',
  border: '1px solid',
  borderColor: '$borderMuted',
});

export const StyledItemName = styled('div', {
  flexGrow: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const StyledPart = styled('span', {
  variants: {
    matches: {
      true: {
        fontWeight: '$bold',
      },
    },
  },
});

export const StyledButton = styled('button', {
  padding: '$2 $3',
  fontSize: '$xsmall',

  variants: {
    isFocused: {
      false: {
        color: '$fgDisabled',
      },
    },
  },
});

export const StyledDownshiftInput: React.FC<Props> = ({
  type,
  name,
  value,
  placeholder,
  suffix,
  inputRef,
  dataCy,
  onChange,
  onBlur,
  getInputProps,
}) => {
  const { ref, size, ...inputProps } = getInputProps({
    ref: inputRef,
    name,
    label: type || null,
    value: value || '',
    placeholder,
    onChange,
    onBlur,
  });

  return (
    <StyledInput
      ref={ref as React.MutableRefObject<HTMLInputElement>}
      data-testid={dataCy}
      hasSuffix={!!suffix}
      size="small"
      className="input"
      {...inputProps}
    />
  );
};
