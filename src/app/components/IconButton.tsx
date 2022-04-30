import React from 'react';
import { styled } from '@/stitches.config';
import Tooltip from './Tooltip';

const Box = styled('div', {});
const StyledButton = styled('button', {
  all: 'unset',
  backgroundColor: 'red',
  border: 'none',
  padding: '$2',
  borderRadius: '$button',
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

type StyledButtonProps = React.ComponentProps<typeof StyledButton>;
type Props = {
  disabled?: boolean;
  tooltip?: string;
  dataCy?: string;
  icon: any;
  css?: any;
  variant?: StyledButtonProps['buttonVariant'];
  tooltipSide?: 'bottom' | 'left' | 'top' | undefined;
  onClick?: () => void;
  badge?: boolean;
};

export default function IconButton({
  disabled = false,
  tooltip,
  dataCy,
  onClick,
  icon,
  css,
  variant = 'default',
  tooltipSide = 'left',
  badge,
}: Props) {
  const handleClick = React.useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  return (
    <Box css={css}>
      <Tooltip side={tooltipSide} label={tooltip ?? ''}>
        <StyledButton disabled={disabled} data-cy={dataCy} type="button" onClick={handleClick} buttonVariant={variant}>
          <Box css={{ transition: 'transform 200ms ease-in-out', transform: 'var(--transform)' }}>{icon}</Box>
          {badge && (
            <Box
              css={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '$2',
                height: '$2',
                borderRadius: '100px',
                backgroundColor: '$bgAccent',
              }}
            />
          )}
        </StyledButton>
      </Tooltip>
    </Box>
  );
}
