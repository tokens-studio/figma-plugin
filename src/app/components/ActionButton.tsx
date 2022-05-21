import React from 'react';
import { styled } from '@/stitches.config';

const Box = styled('div', {});
const StyledButton = styled('button', {
  all: 'unset',
  backgroundColor: 'red',
  border: 'none',
  padding: '$3 $3',
  borderRadius: '$button',
  fontSize: '$xsmall',
  cursor: 'pointer',
  '&:hover, &:focus': {
    boxShadow: 'none',
  },
  variants: {
    buttonVariant: {
      primary: {
        backgroundColor: '$interaction',
        color: '$onInteraction',
        '&:hover, &:focus': {
          backgroundColor: '$interactionSubtle',
        },
      },
      default: {
        backgroundColor: 'transparent',
        color: '$text',
        '&:hover, &:focus': {
          backgroundColor: '$bgSubtle',
        },
      },
    },
  },
});

type Props = {
  disabled?: boolean;
  dataCy?: string | null;
  onClick: any;
  icon?: any;
  css?: any;
  variant?: React.ComponentProps<typeof StyledButton>['buttonVariant'];
  text: string;
};

export default function ActionButton({
  disabled = false,
  dataCy = null,
  onClick,
  icon,
  css,
  variant = 'default',
  text,
}: Props) {
  const handleClick = React.useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  return (
    <Box css={css}>
      <StyledButton disabled={disabled} data-cy={dataCy} type="button" onClick={handleClick} buttonVariant={variant}>
        {icon ? <Box css={{ transition: 'transform 200ms ease-in-out', transform: 'var(--transform)' }}>{icon}</Box> : null}
        {text}
      </StyledButton>
    </Box>
  );
}
