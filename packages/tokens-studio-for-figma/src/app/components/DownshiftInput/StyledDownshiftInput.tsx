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
  padding: '$3',
});

export const StyledList = styled(List as ComponentType<any>, {
  zIndex: '10',
  maxHeight: '30vh',
  overflowY: 'auto',
  backgroundColor: '$bgCanvas',
  cursor: 'pointer',
  padding: '$2',
});

export const StyledItemValue = styled('div', {
  fontSize: '$xxsmall',
  color: '$fgDefault',
  fontWeight: '$normal',
  textAlign: 'right',
  flex: '1 0 auto',
  variants: {
    truncate: {
      true: {
        maxWidth: '50%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textWrap: 'nowrap',
      },
    },
  },
});

export const StyledItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$2 $3',
  fontSize: '$xxsmall',
  variants: {
    isFocused: {
      true: {
        borderRadius: '0 !important',
        backgroundColor: '$bgSubtle',
      },
    },
  },
});

export const StyledItemColorDiv = styled('div', {
  flexShrink: 0,
  marginRight: '$2',
});

export const StyledItemColor = styled('div', {
  width: '20px',
  height: '20px',
  borderRadius: '$medium',
  border: '1px solid $borderMuted',
});

export const StyledItemName = styled('div', {
  fontSize: '$xsmall',
  color: '$fgDefault',
  fontWeight: '$sansBold',
  flex: '1 1 auto',
  lineHeight: '1.4',
  wordBreak: 'break-word',
  marginRight: '$2',
  variants: {
    truncate: {
      true: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textWrap: 'nowrap',
      },
    },
  },
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
