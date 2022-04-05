import React from 'react';
import { SingleToken } from '@/types/tokens';
import Tooltip from '../Tooltip';
import { TokenTooltipContent } from './TokenTooltipContent';

type Props = {
  token: SingleToken;
};

export const TokenTooltip: React.FC<Props> = ({
  children,
  token,
}) => {
  if (!children || !React.isValidElement(children)) {
    return null;
  }

  return (
    <Tooltip
      side="bottom"
      label={(
        <TokenTooltipContent
          token={token}
        />
      )}
    >
      {children}
    </Tooltip>
  );
};
