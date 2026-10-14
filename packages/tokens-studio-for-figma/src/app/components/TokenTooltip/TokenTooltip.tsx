import React from 'react';
import { useSelector } from 'react-redux';
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip';
import { SingleToken } from '@/types/tokens';
import Tooltip from '../Tooltip';
import { TokenTooltipContent } from './TokenTooltipContent';
import { showEditFormSelector } from '@/selectors';

type Props = {
  token: SingleToken;
};

export const TokenTooltip: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
  children,
  token,
}) => {
  // When we open the token edit form we don't want tooltips to show through, which is happening sometimes
  const showEditForm = useSelector(showEditFormSelector);

  if (!children || !React.isValidElement(children)) {
    return null;
  }

  // Every token gets its own provider. Radix keeps the provider's skip-delay flag in React state and
  // flips it when a tooltip opens and again shortly after it closes. With the single app-wide provider
  // each flip re-rendered every token tooltip, which blocks hovering for hundreds of ms on large sets.
  return (
    <TooltipProvider>
      <Tooltip
        side="bottom"
        label={showEditForm ? '' : (
          <TokenTooltipContent
            token={token}
          />
        )}
      >
        {children}
      </Tooltip>
    </TooltipProvider>
  );
};
