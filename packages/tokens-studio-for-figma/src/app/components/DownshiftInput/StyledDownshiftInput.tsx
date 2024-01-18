import React, { ComponentType } from 'react';
import type { GetInputPropsOptions } from 'downshift';
import { FixedSizeList as List } from 'react-window';
import { TextInput } from '@tokens-studio/ui';
import { styled } from '@/stitches.config';

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
  overflowY: 'auto',
  backgroundColor: '$bgDefault',
  cursor: 'pointer',
  boxShadow: '$contextMenu',
});

export const StyledList = styled(List as ComponentType<any>, {
  zIndex: '10',
  maxHeight: '30vh',
  overflowY: 'auto',
  backgroundColor: '$bgDefault',
  cursor: 'pointer',
  padding: '$2',
});

export const StyledItemValue = styled('div', {
  color: '$fgMuted',
  fontWeight: '$sansBold',
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
  fontSize: '$xxsmall',
  variants: {
    isFocused: {
      true: {
        backgroundColor: '$bgSubtle',
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
  borderRadius: '$small',
  border: '1px solid',
  borderColor: '$borderSubtle',
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
        fontWeight: '$sansSemibold',
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

export const StyledDownshiftInput: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
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
    <TextInput
      ref={ref as React.MutableRefObject<HTMLInputElement>}
      data-testid={dataCy}
      {...inputProps}
    />
  );
};
