/* eslint-disable react/jsx-props-no-spreading */
import * as React from 'react';
import {styled} from '@/stitches.config';
import * as Tooltip from '@radix-ui/react-tooltip';

const StyledContent = styled(Tooltip.Content, {
    borderRadius: '$contextMenu',
    padding: '5px 10px',
    fontSize: 12,
    backgroundColor: '$contextMenuBackground',
    color: '$contextMenuForeground',
});

const StyledArrow = styled(Tooltip.Arrow, {
    fill: '$contextMenuBackground',
});
export default ({
    label,
    children,
    side = 'left',
}: {
    label: string | React.ReactElement;
    children: React.ReactElement;
    side?: 'left' | 'bottom';
}) => (
    <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger as="span">{children}</Tooltip.Trigger>
        <StyledContent side={side}>
            <StyledArrow />
            {label}
        </StyledContent>
    </Tooltip.Root>
);
