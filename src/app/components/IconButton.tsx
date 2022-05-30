import React from 'react';
import { styled } from '@/stitches.config';
import Tooltip from './Tooltip';
import { StyledDirtyStateBadge } from './StyledDirtyStateBadge';

const commonStyles = {
  display: 'inline-flex',
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
};

const Box = styled('div', {});
const StyledButton = styled('button', commonStyles);
const StyledLink = styled('a', commonStyles);

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
  onClick,
  href,
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
    <Box css={{ position: 'relative', ...css }}>
      <Tooltip side={tooltipSide} label={tooltip ?? ''}>
        {href ? (
          <Box>
            <StyledLink
              target="_blank"
              rel="noreferrer"
              href={href}
              data-cy={dataCy}
              buttonVariant={variant}
            >
              <IconButtonInnerContent icon={icon} badge={badge} />
            </StyledLink>
          </Box>
        )
          : (
            <StyledButton disabled={disabled} data-cy={dataCy} type="button" onClick={handleClick} buttonVariant={variant}>
              <IconButtonInnerContent icon={icon} badge={badge} />
            </StyledButton>
          )}
      </Tooltip>
    </Box>
  );
}
