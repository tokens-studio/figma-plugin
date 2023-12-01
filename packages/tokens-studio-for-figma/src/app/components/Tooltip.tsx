/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { styled, keyframes } from '@/stitches.config';

const scaleIn = keyframes({
  '0%': { opacity: 0, transform: 'scale(0.7)' },
  '100%': { opacity: 1, transform: 'scale(1)' },
});

const StyledContent = styled(Tooltip.Content, {
  borderRadius: '$medium',
  padding: '$2 $3',
  fontSize: '$small',
  maxWidth: '70vw',
  width: 'auto',
  backgroundColor: '$tooltipBg',
  color: '$tooltipFg',
  transformOrigin: 'var(--radix-tooltip-content-transform-origin)',
  animation: `${scaleIn} 0.1s ease-out`,
});

const StyledArrow = styled(Tooltip.Arrow, {
  fill: '$tooltipBg',
});

type Props = {
  children: React.ReactElement;
  label?: string | React.ReactElement;
  side?: 'left' | 'bottom' | 'top' | 'right';
};

const Toolip: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
  label,
  children,
  side = 'left',
}) => (
  label ? (
    <Tooltip.Provider disableHoverableContent>
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <StyledContent side={side}>
            <StyledArrow offset={10} />
            {label}
          </StyledContent>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  ) : children
);

export default Toolip;
