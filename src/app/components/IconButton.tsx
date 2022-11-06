import React from 'react';
import { styled } from '@/stitches.config';
import Tooltip from './Tooltip';
import { StyledDirtyStateBadge } from './StyledDirtyStateBadge';
import { StitchesCSS } from '@/types';
import Spinner from './Spinner';

const commonStyles = {
  all: 'unset',
  backgroundColor: 'red',
  border: 'none',
  borderRadius: '$button',
  cursor: 'pointer',
  '&:not(:disabled):hover, &:not(:disabled):focus': {
    boxShadow: 'none',
  },
  '&:disabled': {
    pointerEvents: 'none',
    opacity: 0.5,
  },
  variants: {
    size: {
      medium: {
        padding: '$2',
      },
      large: {
        padding: '$3',
      },
    },
    buttonVariant: {
      primary: {
        display: 'block',
        backgroundColor: '$interaction',
        color: '$onInteraction',
        '&:not(:disabled):hover, &:not(:disabled):focus': {
          backgroundColor: '$interactionSubtle',
        },
      },
      default: {
        display: 'block',
        backgroundColor: 'transparent',
        color: '$text',
        '&:not(:disabled):hover, &:not(:disabled):focus': {
          backgroundColor: '$bgSubtle',
        },
      },
    },
  },
};

const Box = styled('div', {});
const StyledButton = styled('button', commonStyles);
const StyledLink = styled('a', commonStyles);

type StyledButtonProps = React.ComponentProps<typeof StyledButton>;
type Props = {
  disabled?: boolean;
  tooltip?: string;
  dataCy?: string;
  loading?: boolean;
  icon: any;
  css?: StitchesCSS;
  className?: string
  variant?: StyledButtonProps['buttonVariant'];
  size?: 'medium' | 'large';
  tooltipSide?: 'bottom' | 'left' | 'top' | undefined;
  onClick?: () => void;
  href?: string;
  badge?: boolean;
};

function IconButtonInnerContent({ icon, badge }: { icon: Props['icon']; badge?: Props['badge'] }) {
  return (
    <>
      <Box css={{ transition: 'transform 200ms ease-in-out', transform: 'var(--transform)' }}>{icon}</Box>
      {badge && <StyledDirtyStateBadge />}
    </>

  );
}

export default function IconButton({
  disabled = false,
  tooltip,
  dataCy,
  loading,
  onClick,
  href,
  icon,
  css,
  className,
  variant = 'default',
  size = 'medium',
  tooltipSide = 'left',
  badge,
}: Props) {
  const handleClick = React.useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  return (
    <Box css={{ position: 'relative', ...css }} className={className}>
      <Tooltip side={tooltipSide} label={tooltip ?? ''}>
        {href ? (
          <Box>
            <StyledLink
              target="_blank"
              rel="noreferrer"
              href={href}
              data-cy={dataCy}
              size={size}
              buttonVariant={variant}
            >
              <IconButtonInnerContent icon={loading ? <Spinner /> : icon} badge={badge} />
            </StyledLink>
          </Box>
        ) : (
          <StyledButton
            css={css}
            disabled={disabled}
            data-testid={dataCy}
            data-cy={dataCy}
            type="button"
            onClick={handleClick}
            size={size}
            buttonVariant={variant}
          >
            <IconButtonInnerContent icon={loading ? <Spinner /> : icon} badge={badge} />
          </StyledButton>
        )}
      </Tooltip>
    </Box>
  );
}
