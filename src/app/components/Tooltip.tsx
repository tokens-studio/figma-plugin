import * as React from 'react';
import ReachTooltip from '@reach/tooltip';
import '@reach/tooltip/styles.css';

type TooltipProps = {
    label: string;
};

const Tooltip: React.FunctionComponent<TooltipProps> = ({label, children}) => (
    <ReachTooltip label={label}>{children}</ReachTooltip>
);

export default Tooltip;
