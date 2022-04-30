/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { styled, keyframes } from '@/stitches.config';

const scaleIn = keyframes({
  '0%': { opacity: 0, transform: 'scale(0.7)' },
  '100%': { opacity: 1, transform: 'scale(1)' },
});

const StyledContent = styled(Tooltip.Content, {
  borderRadius: '$contextMenu',
  padding: '5px 10px',
  fontSize: 12,
  maxWidth: '70vw',
  width: 'auto',
  backgroundColor: '$bgToolTip',
  color: '$fgToolTip',
  transformOrigin: 'var(--radix-tooltip-content-transform-origin)',
  animation: `${scaleIn} 0.1s ease-out`,
});

const StyledArrow = styled(Tooltip.Arrow, {
  fill: '$contextMenuBackground',
});

type Props = {
  children: React.ReactElement;
  label?: string | React.ReactElement;
  side?: 'left' | 'bottom' | 'top';
};

const Toolip: React.FC<Props> = ({
  label,
  children,
  side = 'left',
}) => (
  label ? (
    <Tooltip.Root delayDuration={0}>
      <Tooltip.Trigger as="div">{children}</Tooltip.Trigger>
      <StyledContent side={side}>
        <StyledArrow offset={10} />
        {label}
      </StyledContent>
    </Tooltip.Root>
  ) : children
);

export default Toolip;
